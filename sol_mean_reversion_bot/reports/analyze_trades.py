"""Trade analysis helpers for the paper trading SQLite database."""

from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path

import pandas as pd
import yaml

from sol_mean_reversion_bot.storage.db import BotDatabase

DEFAULT_CONFIG_PATH = Path(__file__).parents[1] / "config.yaml"


def load_config(path: Path) -> dict:
	"""Load bot configuration from YAML."""
	with path.open("r", encoding="utf-8") as config_file:
		return yaml.safe_load(config_file)


def analyze(database_path: str) -> dict:
	"""Calculate first-pass trade statistics from closed sell trades."""
	BotDatabase(database_path)
	with sqlite3.connect(database_path) as connection:
		trades = pd.read_sql_query("SELECT * FROM trades ORDER BY timestamp", connection)
		equity = pd.read_sql_query("SELECT * FROM equity_history ORDER BY timestamp", connection)

	sells = trades[trades["side"] == "sell"] if not trades.empty else pd.DataFrame()
	gross_profit = sells.loc[sells["realized_pnl"] > 0, "realized_pnl"].sum() if not sells.empty else 0
	gross_loss = abs(sells.loc[sells["realized_pnl"] < 0, "realized_pnl"].sum()) if not sells.empty else 0

	# drawdown
	max_drawdown = 0.0
	if not equity.empty:
		running_max = equity["equity"].cummax()
		drawdown = (equity["equity"] - running_max) / running_max
		max_drawdown = float(drawdown.min())

	# basic stats
	closed = int(len(sells))
	winrate = float((sells["realized_pnl"] > 0).mean()) if not sells.empty else 0.0
	profit_factor = float(gross_profit / gross_loss) if gross_loss else 0.0
	average_profit = float(sells["realized_pnl"].mean()) if not sells.empty else 0.0

	# wins / losses
	wins = sells.loc[sells["realized_pnl"] > 0, "realized_pnl"]
	losses = sells.loc[sells["realized_pnl"] < 0, "realized_pnl"]
	avg_win = float(wins.mean()) if not wins.empty else 0.0
	avg_loss = float(abs(losses.mean())) if not losses.empty else 0.0
	max_win = float(wins.max()) if not wins.empty else 0.0
	max_loss = float(abs(losses.min())) if not losses.empty else 0.0

	# expectancy: expected PnL per trade
	expectancy = winrate * avg_win - (1.0 - winrate) * avg_loss if closed else 0.0

	return {
		"closed_trades": closed,
		"winrate": winrate,
		"profit_factor": profit_factor,
		"average_profit": average_profit,
		"max_drawdown": max_drawdown,
		"avg_win": avg_win,
		"avg_loss": avg_loss,
		"max_win": max_win,
		"max_loss": max_loss,
		"expectancy": expectancy,
		"sells": sells,
	}


def parse_args() -> argparse.Namespace:
	parser = argparse.ArgumentParser(description="Analyze paper trading results")
	parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG_PATH, help="YAML konfiguráció útvonala")
	parser.add_argument("--csv", type=Path, default=None, help="Optional path to write closed trades CSV")
	return parser.parse_args()


if __name__ == "__main__":
	args = parse_args()
	config = load_config(args.config)

	# Run analysis and print a user-friendly summary
	try:
		db_path = config["storage"]["database_path"]
		print("\n=== Trade Analysis ===")
		print(f"Database: {db_path}\n")
		stats = analyze(db_path)

		closed = stats.get("closed_trades", 0)
		print(f"Closed trades: {closed}")
		winrate = stats.get("winrate", 0.0)
		print(f"Win rate: {winrate * 100:.1f}%")
		pf = stats.get("profit_factor", 0.0)
		print(f"Profit factor: {pf:.2f}")
		avg = stats.get("average_profit", 0.0)
		print(f"Average realized PnL (per closed): {avg:.2f}")
		mdd = stats.get("max_drawdown", 0.0)
		print(f"Max drawdown: {mdd * 100:.2f}%")

		# extra metrics
		avg_win = stats.get("avg_win", 0.0)
		avg_loss = stats.get("avg_loss", 0.0)
		print(f"Average win: {avg_win:.2f}, Average loss: {avg_loss:.2f}")
		max_win = stats.get("max_win", 0.0)
		max_loss = stats.get("max_loss", 0.0)
		print(f"Biggest win: {max_win:.2f}, Biggest loss: {max_loss:.2f}")
		expectancy = stats.get("expectancy", 0.0)
		print(f"Expectancy (per trade): {expectancy:.4f}")

		# optional CSV export of closed trades
		if args.csv:
			sells = stats.get("sells")
			if sells is None or sells.empty:
				print(f"No closed trades to write to CSV: {args.csv}")
			else:
				sells.to_csv(args.csv, index=False)
				print(f"Wrote closed trades CSV to: {args.csv}")

		print("\nSummary: ")
		if closed == 0:
			print("No closed trades found in the database.")
		else:
			print("Analysis complete. Use these metrics for quick evaluation.")

	except Exception as exc:
		print(f"[analyze_trades][ERROR] {exc}")
		raise
