"""Run backtest using OHLCV data stored in the bot SQLite DB (`market_data`)."""
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


def run_from_db(db_path: Path, symbol: str, timeframe: str, config: dict) -> dict:
    with sqlite3.connect(db_path) as conn:
        df = pd.read_sql_query(
            "SELECT timestamp, open, high, low, close, volume FROM market_data WHERE symbol = ? AND timeframe = ? ORDER BY timestamp",
            conn,
            params=(symbol, timeframe),
        )

    if df.empty:
        raise SystemExit("No market_data found for symbol/timeframe in DB")

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

    final_price = float(enriched.iloc[-1]["close"])
    wins = [trade for trade in closed_trades if trade["realized_pnl"] > 0]
    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "trades": len(closed_trades),
        "winrate": (len(wins) / len(closed_trades)) if closed_trades else 0,
        "final_equity": broker.equity(final_price),
        "cash": broker.cash,
        "open_position": broker.open_position is not None,
    }


def main():
    repo_root = Path(__file__).resolve().parents[1]
    config = load_config(repo_root)
    db_path = Path(config.get("storage", {}).get("database_path", "sol_mean_reversion_bot/bot.db"))
    if not db_path.is_absolute():
        db_path = repo_root / db_path

    symbol = config.get("symbol", "SOL/USDC")
    timeframe = config.get("timeframe", "1h")

    result = run_from_db(db_path, symbol, timeframe, config)
    for k, v in result.items():
        print(f"{k}: {v}")


if __name__ == "__main__":
    main()
