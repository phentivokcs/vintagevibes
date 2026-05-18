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
    strategy = MeanReversionStrategy(config)
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
        "avg_win_pct": sum(p for p in pnl_percs if p > 0) / len([p for p in pnl_percs if p > 0]) if any(p > 0 for p in pnl_percs) else 0.0,
        "avg_loss_pct": sum(p for p in pnl_percs if p < 0) / len([p for p in pnl_percs if p < 0]) if any(p < 0 for p in pnl_percs) else 0.0,
    }


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    config = load_config(repo_root)
    db_path = Path(config.get("storage", {}).get("database_path", "sol_mean_reversion_bot/bot.db"))
    if not db_path.is_absolute():
        db_path = repo_root / db_path

    symbol = config.get("symbol", "SOL/USDC")
    timeframe = config.get("timeframe", "1h")
    df = load_market_data(db_path, symbol, timeframe)

    rsi_entries = [25, 30, 35, 40, 45]
    lower_buffers = [0.0, 0.01, 0.02, 0.03]
    atr_multipliers = [0.8, 1.0, 1.2, 1.5]
    exit_buffers = [0.0, 0.005, 0.01]

    rows = []
    for rsi_entry in rsi_entries:
        for lower_buffer in lower_buffers:
            for atr_mult in atr_multipliers:
                for exit_buffer in exit_buffers:
                    cfg = {**config, "strategy": {**config["strategy"]}}
                    cfg["strategy"]["rsi_entry"] = rsi_entry
                    cfg["strategy"]["bollinger_lower_buffer_pct"] = lower_buffer
                    cfg["strategy"]["atr_stop_multiplier"] = atr_mult
                    cfg["strategy"]["bollinger_exit_buffer_pct"] = exit_buffer

                    result = run_backtest(df, cfg, max_open=10)
                    result.update({
                        "rsi_entry": rsi_entry,
                        "lower_buffer": lower_buffer,
                        "atr_stop_multiplier": atr_mult,
                        "exit_buffer": exit_buffer,
                    })
                    rows.append(result)

    results_df = pd.DataFrame(rows)
    results_df = results_df.sort_values(["total_pnl", "profit_factor", "avg_pnl_pct"], ascending=[False, False, False])

    print("Top 10 parameter sets by total PnL:")
    print(results_df.head(10).to_string(index=False, float_format="{:.4f}"))

    positive = results_df[results_df["total_pnl"] > 0]
    if not positive.empty:
        print("\nBest positive result:")
        print(positive.head(1).to_string(index=False, float_format="{:.4f}"))
    else:
        print("\nNo positive total PnL found in the sweep.")


if __name__ == "__main__":
    main()
