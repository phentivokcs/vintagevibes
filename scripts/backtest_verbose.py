"""Run backtest from DB and print trade-by-trade log with stop pct and duration."""
from pathlib import Path
import sqlite3
import yaml
from datetime import datetime

import pandas as pd

from sol_mean_reversion_bot.strategy.indicators import add_indicators
from sol_mean_reversion_bot.strategy.mean_reversion import MeanReversionStrategy
from sol_mean_reversion_bot.broker.paper_broker import PaperBroker


def load_config(repo_root: Path):
    with (repo_root / "sol_mean_reversion_bot" / "config.yaml").open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def run_verbose(db_path: Path, symbol: str, timeframe: str, config: dict):
    with sqlite3.connect(db_path) as conn:
        df = pd.read_sql_query(
            "SELECT timestamp, open, high, low, close, volume FROM market_data WHERE symbol = ? AND timeframe = ? ORDER BY timestamp",
            conn,
            params=(symbol, timeframe),
        )

    df["timestamp"] = pd.to_datetime(df["timestamp"])  # assume ISO strings
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

    # Print header
    print("\nTrade log:")
    print(
        "{:<3} {:<20} {:<20} {:<8} {:<8} {:<10} {:<9} {:<8} {:<10}".format(
            "#", "opened_at", "closed_at", "entry", "exit", "realized_pnl", "pnl_pct", "stop_pct", "duration_min"
        )
    )

    for i, t in enumerate(closed_trades, start=1):
        opened = pd.to_datetime(t.get("opened_at"))
        closed = pd.to_datetime(t.get("closed_at"))
        entry = float(t.get("entry_price") or 0)
        exit_p = float(t.get("exit_price") or 0)
        pnl = float(t.get("realized_pnl") or 0)
        quantity = float(t.get("quantity") or 0)
        position_value = quantity * entry if entry else 0
        pnl_pct = (pnl / position_value * 100.0) if position_value else None
        stop = t.get("stop_price")
        stop_pct = None
        if stop is not None and entry:
            stop_pct = abs(entry - float(stop)) / entry * 100.0
        duration_min = (closed - opened).total_seconds() / 60.0 if not pd.isna(opened) and not pd.isna(closed) else None

        pnl_pct_s = f"{pnl_pct:.2f}%" if pnl_pct is not None else "-"
        stop_pct_s = f"{stop_pct:.2f}%" if stop_pct is not None else "-"
        duration_s = f"{duration_min:.1f}" if duration_min is not None else "-"

        print(
            "{:<3} {:<20} {:<20} {:<8.2f} {:<8.2f} {:<10.2f} {:<9} {:<8} {:<10}".format(
                i, opened.isoformat(), closed.isoformat(), entry, exit_p, pnl, pnl_pct_s, stop_pct_s, duration_s
            )
        )

    # summary
    total = sum(float(t.get("realized_pnl") or 0) for t in closed_trades)
    wins = [t for t in closed_trades if float(t.get("realized_pnl") or 0) > 0]
    losses = [t for t in closed_trades if float(t.get("realized_pnl") or 0) < 0]
    gross_profit = sum(float(t.get("realized_pnl") or 0) for t in wins)
    gross_loss = abs(sum(float(t.get("realized_pnl") or 0) for t in losses))
    pf = gross_profit / gross_loss if gross_loss else float("inf")
    pnl_percs = []
    for t in closed_trades:
        entry = float(t.get("entry_price") or 0)
        quantity = float(t.get("quantity") or 0)
        position_value = quantity * entry if entry else 0
        if position_value:
            pnl_percs.append(float(t.get("realized_pnl") or 0) / position_value * 100.0)

    avg_pnl_pct = sum(pnl_percs) / len(pnl_percs) if pnl_percs else 0.0

    print("\nSummary:")
    print(f"Trades: {len(closed_trades)}, Wins: {len(wins)}, Losses: {len(losses)}")
    print(f"Total PnL: {total:.2f}, Profit factor: {pf:.2f}")
    print(f"Average trade return: {avg_pnl_pct:.2f}%")


def main():
    repo_root = Path(__file__).resolve().parents[1]
    config = load_config(repo_root)
    db_path = Path(config.get("storage", {}).get("database_path", "sol_mean_reversion_bot/bot.db"))
    if not db_path.is_absolute():
        db_path = repo_root / db_path

    symbol = config.get("symbol", "SOL/USDC")
    timeframe = config.get("timeframe", "1h")

    run_verbose(db_path, symbol, timeframe, config)


if __name__ == "__main__":
    main()
