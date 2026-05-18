"""Run backtest and print indicator snapshots at each entry and exit to detect faulty indicators."""
from pathlib import Path
import sqlite3
import yaml

import pandas as pd

from sol_mean_reversion_bot.strategy.indicators import add_indicators
from sol_mean_reversion_bot.strategy.mean_reversion import MeanReversionStrategy
from sol_mean_reversion_bot.broker.paper_broker import PaperBroker


def load_config(repo_root: Path):
    with (repo_root / "sol_mean_reversion_bot" / "config.yaml").open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def run_diagnostics(db_path: Path, symbol: str, timeframe: str, config: dict):
    with sqlite3.connect(db_path) as conn:
        df = pd.read_sql_query(
            "SELECT timestamp, open, high, low, close, volume FROM market_data WHERE symbol = ? AND timeframe = ? ORDER BY timestamp",
            conn,
            params=(symbol, timeframe),
        )

    df["timestamp"] = pd.to_datetime(df["timestamp"])  # assume ISO strings
    enriched = add_indicators(df, config)

    print("\nEntry filter diagnostics:\n")
    analyze_entry_filters(enriched, config)

    strategy = MeanReversionStrategy(config)
    broker = PaperBroker(config)

    print("\nIndicator diagnostics:\n")
    entries = []

    for _, row in enriched.iterrows():
        if broker.open_position is None:
            signal = strategy.evaluate_entry(row)
            if signal.action == "buy":
                # capture indicators at entry
                info = {
                    "opened_at": row["timestamp"].isoformat(),
                    "entry_price": float(row["close"]),
                    "ema200": float(row.get("ema200") or float('nan')),
                    "rsi": float(row.get("rsi") or float('nan')),
                    "bb_lower": float(row.get("bb_lower") or float('nan')),
                    "atr": float(row.get("atr") or float('nan')),
                    "stop_price_computed": float(signal.stop_price) if signal.stop_price is not None else None,
                }
                entries.append(info)
                broker.buy(float(row["close"]), row["timestamp"].isoformat(), signal.reason, signal.stop_price)
        else:
            signal = strategy.evaluate_exit(row, broker.open_position)
            if signal.action == "sell":
                broker.sell(float(row["close"]), row["timestamp"].isoformat(), signal.reason)

    if not entries:
        print("No entries found during period.")
        return

    # Print table of captured indicators
    print(
        "{:<3} {:<20} {:<10} {:<10} {:<8} {:<8} {:<8} {:<14}".format(
            "#", "opened_at", "entry", "ema200", "rsi", "atr", "bb_lower", "stop_price"
        )
    )
    for i, e in enumerate(entries, start=1):
        bb_lower = e.get("bb_lower", float('nan'))
        print(
            "{:<3} {:<20} {:<10.2f} {:<10.2f} {:<8.2f} {:<8.2f} {:<8.2f} {:<14.2f}".format(
                i,
                e["opened_at"],
                e["entry_price"],
                e["ema200"],
                e["rsi"],
                e["atr"],
                bb_lower,
                e["stop_price_computed"] or float('nan'),
            )
        )


def analyze_entry_filters(enriched: pd.DataFrame, config: dict) -> None:
    strategy_config = config["strategy"]
    rsi_entry = strategy_config["rsi_entry"]

    valid = ~enriched[["ema200", "rsi", "bb_lower"]].isna().any(axis=1)
    if valid.sum() == 0:
        print("No valid indicator rows available for entry filter analysis.")
        return

    df = enriched.loc[valid].copy()
    trend_filter = df["close"] > df["ema200"]
    band_reversion = df["close"] < df["bb_lower"]
    oversold = df["rsi"] < rsi_entry
    entry_signal = trend_filter & band_reversion & oversold

    total = len(df)
    counts = {
        "trend_true": trend_filter.sum(),
        "band_true": band_reversion.sum(),
        "oversold_true": oversold.sum(),
        "entry_signals": entry_signal.sum(),
    }

    only_trend_block = ((~trend_filter) & band_reversion & oversold).sum()
    only_band_block = (trend_filter & (~band_reversion) & oversold).sum()
    only_oversold_block = (trend_filter & band_reversion & (~oversold)).sum()

    print("\nEntry filter breakdown:")
    print(f"Total valid rows: {total}")
    print(f"Entry signals found: {counts['entry_signals']} ({counts['entry_signals'] / total:.2%})")
    print(f"Trend filter true: {counts['trend_true']} ({counts['trend_true'] / total:.2%})")
    print(f"Bollinger lower filter true: {counts['band_true']} ({counts['band_true'] / total:.2%})")
    print(f"RSI oversold filter true (< {rsi_entry}): {counts['oversold_true']} ({counts['oversold_true'] / total:.2%})")

    print("\nMost restrictive condition (only this one blocks an otherwise valid entry):")
    print(f"  Trend filter blocks: {only_trend_block} rows")
    print(f"  Bollinger lower filter blocks: {only_band_block} rows")
    print(f"  RSI oversold filter blocks: {only_oversold_block} rows")

    blockers = {
        "trend": only_trend_block,
        "bollinger": only_band_block,
        "rsi": only_oversold_block,
    }
    tightest = max(blockers, key=blockers.get)
    print(f"Most restrictive single rule: {tightest} filter")

    without_trend = (band_reversion & oversold).sum()
    without_band = (trend_filter & oversold).sum()
    without_rsi = (trend_filter & band_reversion).sum()

    print("\nIf you removed one filter entirely, entry candidate counts would become:")
    print(f"  Without trend filter: {without_trend} rows")
    print(f"  Without Bollinger lower filter: {without_band} rows")
    print(f"  Without RSI oversold filter: {without_rsi} rows")

    if counts['entry_signals'] > 0:
        avg_entry_rsi = df.loc[entry_signal, "rsi"].mean()
        avg_entry_dist_bb = ((df.loc[entry_signal, "bb_lower"] - df.loc[entry_signal, "close"]).mean())
        print(f"\nAverage RSI on actual entries: {avg_entry_rsi:.2f}")
        print(f"Average close vs bb_lower distance on entries: {avg_entry_dist_bb:.6f}")


def main():
    repo_root = Path(__file__).resolve().parents[1]
    config = load_config(repo_root)
    db_path = Path(config.get("storage", {}).get("database_path", "sol_mean_reversion_bot/bot.db"))
    if not db_path.is_absolute():
        db_path = repo_root / db_path

    symbol = config.get("symbol", "SOL/USDC")
    timeframe = config.get("timeframe", "1h")

    run_diagnostics(db_path, symbol, timeframe, config)


if __name__ == "__main__":
    main()
