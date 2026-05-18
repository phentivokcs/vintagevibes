from pathlib import Path
import sys
import sqlite3
import yaml
import pandas as pd

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root))

from sol_mean_reversion_bot.strategy.indicators import add_indicators
from sol_mean_reversion_bot.strategy.mean_reversion import MeanReversionStrategy
from scripts.backtest_multi_open import MultiPaperBroker


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    with (repo_root / "sol_mean_reversion_bot" / "config.yaml").open("r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    db_path = repo_root / config["storage"]["database_path"]
    with sqlite3.connect(db_path) as conn:
        df = pd.read_sql_query(
            "SELECT timestamp, open, high, low, close, volume FROM market_data WHERE symbol = ? AND timeframe = ? ORDER BY timestamp",
            conn,
            params=(config["symbol"], config["timeframe"]),
        )

    df["timestamp"] = pd.to_datetime(df["timestamp"])

    print("Exit buffer scan: \n")
    for buf in [0.0, 0.005, 0.01, 0.015, 0.02]:
        cfg = dict(config)
        cfg["strategy"] = dict(config["strategy"])
        cfg["strategy"]["bollinger_exit_buffer_pct"] = buf

        enriched = add_indicators(df, cfg)
        strat = MeanReversionStrategy(cfg)
        broker = MultiPaperBroker(cfg, max_open=10)

        for _, row in enriched.iterrows():
            timestamp = row["timestamp"].isoformat()
            close = float(row["close"])

            for position in list(broker.open_positions):
                signal = strat.evaluate_exit(row, position)
                if signal.action == "sell":
                    exit_price = float(position.get("stop_price") or close) if "stop" in signal.reason.lower() else close
                    broker.sell(position, exit_price, timestamp, signal.reason)

            if broker.can_open():
                signal = strat.evaluate_entry(row)
                if signal.action == "buy":
                    broker.buy(close, timestamp, signal.reason, signal.stop_price)

        closed = broker.closed_positions
        total_pnl = sum(float(t["realized_pnl"]) for t in closed)
        wins = [t for t in closed if t["realized_pnl"] > 0]
        losses = [t for t in closed if t["realized_pnl"] < 0]
        gross_profit = sum(t["realized_pnl"] for t in wins)
        gross_loss = abs(sum(t["realized_pnl"] for t in losses))
        profit_factor = gross_profit / gross_loss if gross_loss else float("inf")
        avg_pnl = sum((t["realized_pnl"] / (t["quantity"] * t["entry_price"]) * 100) for t in closed) / len(closed) if closed else 0

        print(
            f"buf={buf:.3f} trades={len(closed)} winrate={len(wins)/len(closed) if closed else 0:.4f} "
            f"total_pnl={total_pnl:.4f} pf={profit_factor:.4f} avg_pct={avg_pnl:.4f}"
        )


if __name__ == "__main__":
    main()
