"""Run backtest from a cached OHLCV CSV file instead of live fetch."""
from __future__ import annotations

from pathlib import Path
import yaml
import pandas as pd

from sol_mean_reversion_bot.strategy.indicators import add_indicators
from sol_mean_reversion_bot.strategy.mean_reversion import MeanReversionStrategy
from sol_mean_reversion_bot.broker.paper_broker import PaperBroker


def load_config(repo_root: Path):
    with (repo_root / "sol_mean_reversion_bot" / "config.yaml").open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def run_from_csv(csv_path: Path, config: dict) -> dict:
    candles = pd.read_csv(csv_path, parse_dates=["timestamp"])  # expects timestamp
    # ensure column names compatible
    enriched = add_indicators(candles, config)

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

    final_price = float(enriched.iloc[-1]["close"])
    wins = [trade for trade in closed_trades if trade["realized_pnl"] > 0]
    return {
        "symbol": config["symbol"],
        "timeframe": config["timeframe"],
        "trades": len(closed_trades),
        "winrate": (len(wins) / len(closed_trades)) if closed_trades else 0,
        "final_equity": broker.equity(final_price),
        "cash": broker.cash,
        "open_position": broker.open_position is not None,
    }


def main():
    repo_root = Path(__file__).resolve().parents[1]
    config = load_config(repo_root)
    csv_path = repo_root / "sol_mean_reversion_bot" / "data" / "cache" / f"{config['symbol'].replace('/','_')}_{config['timeframe']}.csv"
    if not csv_path.exists():
        raise SystemExit(f"Cached CSV not found: {csv_path}. Run scripts/fetch_ohlcv.py first.")

    result = run_from_csv(csv_path, config)
    for k, v in result.items():
        print(f"{k}: {v}")


if __name__ == "__main__":
    main()
