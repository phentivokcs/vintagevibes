from pathlib import Path
import sys
import sqlite3
import yaml

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root))

import pandas as pd
from sol_mean_reversion_bot.strategy.indicators import add_indicators
from sol_mean_reversion_bot.strategy.mean_reversion import BreakoutMomentumStrategy
from scripts.backtest_multi_open import MultiPaperBroker


def load_config(repo_root: Path) -> dict:
    with (repo_root / "sol_mean_reversion_bot" / "config.yaml").open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_market_data(db_path: Path, symbol: str, timeframe: str) -> pd.DataFrame:
    with sqlite3.connect(db_path) as conn:
        df = pd.read_sql_query(
            "SELECT timestamp, open, high, low, close, volume FROM market_data WHERE symbol = ? AND timeframe = ? ORDER BY timestamp",
            conn,
            params=(symbol, timeframe),
        )
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df


def run_backtest(df: pd.DataFrame, config: dict, max_open: int = 10) -> dict:
    enriched = add_indicators(df, config)
    strategy = BreakoutMomentumStrategy(config)
    broker = MultiPaperBroker(config, max_open=max_open)

    for _, row in enriched.iterrows():
        timestamp = row["timestamp"].isoformat()
        close = float(row["close"])

        for position in list(broker.open_positions):
            signal = strategy.evaluate_exit(row, position)
            if signal.action == "sell":
                exit_price = (
                    float(position.get("stop_price") or close)
                    if "stop" in signal.reason.lower()
                    else close
                )
                broker.sell(position, exit_price, timestamp, signal.reason)

        if broker.can_open():
            signal = strategy.evaluate_entry(row)
            if signal.action == "buy":
                broker.buy(close, timestamp, signal.reason, signal.stop_price)

    closed_trades = broker.closed_positions
    total_pnl = sum(float(t["realized_pnl"]) for t in closed_trades)
    wins = [t for t in closed_trades if float(t["realized_pnl"]) > 0]
    losses = [t for t in closed_trades if float(t["realized_pnl"]) < 0]
    gross_profit = sum(float(t["realized_pnl"]) for t in wins)
    gross_loss = abs(sum(float(t["realized_pnl"]) for t in losses))
    profit_factor = gross_profit / gross_loss if gross_loss else float("inf")
    pnl_percs = []
    for t in closed_trades:
        entry = float(t["entry_price"])
        quantity = float(t["quantity"])
        position_value = quantity * entry if entry else 0
        if position_value:
            pnl_percs.append(float(t["realized_pnl"]) / position_value * 100.0)

    return {
        "trades": len(closed_trades),
        "winrate": len(wins) / len(closed_trades) if closed_trades else 0.0,
        "total_pnl": total_pnl,
        "profit_factor": profit_factor,
        "avg_pnl_pct": sum(pnl_percs) / len(pnl_percs) if pnl_percs else 0.0,
        "open_at_end": len(broker.open_positions),
        "max_opened": max_open,
    }


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    config = load_config(repo_root)
    db_path = Path(config.get("storage", {}).get("database_path", "sol_mean_reversion_bot/bot.db"))
    if not db_path.is_absolute():
        db_path = repo_root / db_path

    df = load_market_data(db_path, config.get("symbol", "SOL/USDC"), config.get("timeframe", "1h"))
    result = run_backtest(df, config)

    print("Breakout momentum backtest result:")
    for key, value in result.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    main()
