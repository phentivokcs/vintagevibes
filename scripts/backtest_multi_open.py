"""Backtest allowing up to 10 simultaneous open long trades from SQL market data."""
from pathlib import Path
import sqlite3
import yaml

import pandas as pd

from sol_mean_reversion_bot.strategy.indicators import add_indicators
from sol_mean_reversion_bot.strategy.mean_reversion import MeanReversionStrategy


class MultiPaperBroker:
    def __init__(self, config: dict, max_open: int = 10):
        broker_config = config["broker"]
        self.symbol = config["symbol"]
        self.cash = float(broker_config["initial_balance"])
        self.position_size_pct = float(broker_config["position_size_pct"])
        self.fee_rate = float(broker_config["fee_rate"])
        self.max_open = max_open
        self.open_positions: list[dict] = []
        self.closed_positions: list[dict] = []

    def can_open(self) -> bool:
        return len(self.open_positions) < self.max_open

    def buy(self, price: float, timestamp: str, reason: str, stop_price: float | None, take_profit_price: float | None = None) -> dict:
        if not self.can_open():
            raise ValueError("Too many open positions")

        notional = self.cash * self.position_size_pct
        fee = notional * self.fee_rate
        quantity = (notional - fee) / price
        self.cash -= notional

        position = {
            "opened_at": timestamp,
            "symbol": self.symbol,
            "entry_price": price,
            "quantity": quantity,
            "stop_price": stop_price,
            "take_profit_price": take_profit_price,
            "status": "open",
            "reason": reason,
        }
        self.open_positions.append(position)
        return position

    def sell(self, position: dict, price: float, timestamp: str, reason: str) -> dict:
        quantity = position["quantity"]
        gross_value = quantity * price
        fee = gross_value * self.fee_rate
        net_value = gross_value - fee
        cost_basis = quantity * position["entry_price"]
        realized_pnl = net_value - cost_basis
        self.cash += net_value

        closed = {
            **position,
            "closed_at": timestamp,
            "exit_price": price,
            "status": "closed",
            "realized_pnl": realized_pnl,
            "close_reason": reason,
        }
        self.open_positions.remove(position)
        self.closed_positions.append(closed)
        return closed

    def equity(self, last_price: float) -> float:
        value = self.cash
        for pos in self.open_positions:
            value += pos["quantity"] * last_price
        return value


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

        # first evaluate exits for all open positions
        closed_now = []
        for position in list(broker.open_positions):
            signal = strategy.evaluate_exit(row, position)
            if signal.action == "sell":
                exit_price = (
                    float(position.get("stop_price") or close)
                    if "stop" in signal.reason.lower()
                    else close
                )
                broker.sell(position, exit_price, timestamp, signal.reason)
                closed_now.append(position)

        # then allow one new entry per candle if capacity allows
        if broker.can_open():
            signal = strategy.evaluate_entry(row)
            if signal.action == "buy":
                broker.buy(close, timestamp, signal.reason, signal.stop_price)

    closed_trades = broker.closed_positions
    total_pnl = sum(float(t["realized_pnl"]) for t in closed_trades)
    wins = [t for t in closed_trades if t["realized_pnl"] > 0]
    losses = [t for t in closed_trades if t["realized_pnl"] < 0]
    gross_profit = sum(t["realized_pnl"] for t in wins)
    gross_loss = abs(sum(t["realized_pnl"] for t in losses))
    profit_factor = gross_profit / gross_loss if gross_loss else float("inf")

    pnl_percs = []
    for t in closed_trades:
        entry = t["entry_price"]
        quantity = t["quantity"]
        position_value = quantity * entry if entry else 0
        if position_value:
            pnl_percs.append(t["realized_pnl"] / position_value * 100.0)

    avg_pnl_pct = sum(pnl_percs) / len(pnl_percs) if pnl_percs else 0.0

    return {
        "trades": len(closed_trades),
        "winrate": len(wins) / len(closed_trades) if closed_trades else 0.0,
        "total_pnl": total_pnl,
        "profit_factor": profit_factor,
        "avg_pnl_pct": avg_pnl_pct,
        "open_at_end": len(broker.open_positions),
        "max_opened": max_open,
    }


def main():
    repo_root = Path(__file__).resolve().parents[1]
    config = load_config(repo_root)
    db_path = Path(config.get("storage", {}).get("database_path", "sol_mean_reversion_bot/bot.db"))
    if not db_path.is_absolute():
        db_path = repo_root / db_path

    symbol = config.get("symbol", "SOL/USDC")
    timeframe = config.get("timeframe", "1h")
    df = load_market_data(db_path, symbol, timeframe)
    result = run_backtest(df, config, max_open=10)

    print("Backtest with up to 10 simultaneous open trades:")
    for key, value in result.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    main()
