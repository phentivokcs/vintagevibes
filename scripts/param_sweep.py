"""Sweep ATR stop multiplier and minimum stop percent to find improved percent returns."""
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


def run_backtest(df: pd.DataFrame, config: dict):
    enriched = add_indicators(df, config)
    strategy = MeanReversionStrategy(config)
    broker = PaperBroker(config)
    closed_trades = []

    for _, row in enriched.iterrows():
        timestamp = row["timestamp"].isoformat()
        close = float(row["close"])

        if broker.open_position is None:
            signal = strategy.evaluate_entry(row)
            if signal.action == "buy":
                broker.buy(close, timestamp, signal.reason, signal.stop_price)
        else:
            signal = strategy.evaluate_exit(row, broker.open_position)
            if signal.action == "sell":
                exit_price = (
                    float(broker.open_position.get("stop_price") or close)
                    if "stop" in signal.reason.lower()
                    else close
                )
                closed_trades.append(broker.sell(exit_price, timestamp, signal.reason))

    total_pnl = sum(float(t.get("realized_pnl") or 0) for t in closed_trades)
    wins = [t for t in closed_trades if float(t.get("realized_pnl") or 0) > 0]
    losses = [t for t in closed_trades if float(t.get("realized_pnl") or 0) < 0]
    gross_profit = sum(float(t.get("realized_pnl") or 0) for t in wins)
    gross_loss = abs(sum(float(t.get("realized_pnl") or 0) for t in losses))
    profit_factor = gross_profit / gross_loss if gross_loss else float("inf")

    pnl_percs = []
    for t in closed_trades:
        entry = float(t.get("entry_price") or 0)
        quantity = float(t.get("quantity") or 0)
        position_value = quantity * entry if entry else 0
        if position_value:
            pnl_percs.append(float(t.get("realized_pnl") or 0) / position_value * 100.0)

    avg_pnl_pct = sum(pnl_percs) / len(pnl_percs) if pnl_percs else 0.0
    winrate = len(wins) / len(closed_trades) if closed_trades else 0.0
    avg_win_pct = sum(p for p in pnl_percs if p > 0) / len([p for p in pnl_percs if p > 0]) if any(p > 0 for p in pnl_percs) else 0.0
    avg_loss_pct = sum(p for p in pnl_percs if p < 0) / len([p for p in pnl_percs if p < 0]) if any(p < 0 for p in pnl_percs) else 0.0

    return {
        "trades": len(closed_trades),
        "winrate": winrate,
        "total_pnl": total_pnl,
        "profit_factor": profit_factor,
        "avg_pnl_pct": avg_pnl_pct,
        "avg_win_pct": avg_win_pct,
        "avg_loss_pct": avg_loss_pct,
    }


def load_market_data(db_path: Path, symbol: str, timeframe: str) -> pd.DataFrame:
    with sqlite3.connect(db_path) as conn:
        df = pd.read_sql_query(
            "SELECT timestamp, open, high, low, close, volume FROM market_data WHERE symbol = ? AND timeframe = ? ORDER BY timestamp",
            conn,
            params=(symbol, timeframe),
        )
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df


def main():
    repo_root = Path(__file__).resolve().parents[1]
    config = load_config(repo_root)
    db_path = Path(config.get("storage", {}).get("database_path", "sol_mean_reversion_bot/bot.db"))
    if not db_path.is_absolute():
        db_path = repo_root / db_path

    symbol = config.get("symbol", "SOL/USDC")
    timeframe = config.get("timeframe", "1h")
    df = load_market_data(db_path, symbol, timeframe)

    multipliers = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0]
    min_stops = [0.003, 0.005, 0.007, 0.01, 0.015]

    results = []
    for m in multipliers:
        for p in min_stops:
            cfg = dict(config)
            cfg = {**config, "strategy": {**config["strategy"], "atr_stop_multiplier": m, "min_stop_pct": p}}
            res = run_backtest(df, cfg)
            res.update({"atr_stop_multiplier": m, "min_stop_pct": p})
            results.append(res)

    results_df = pd.DataFrame(results)
    results_df = results_df.sort_values(["avg_pnl_pct", "profit_factor"], ascending=[False, False])
    print(results_df.head(10).to_string(index=False, float_format="{:.4f}".format))

    best = results_df.iloc[0]
    print("\nBest result:")
    print(best.to_string())


if __name__ == "__main__":
    main()
