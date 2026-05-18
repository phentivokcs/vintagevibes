"""Long-only SOL mean reversion strategy rules."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import pandas as pd

SignalType = Literal["buy", "sell", "hold"]


@dataclass(frozen=True)
class Signal:
	"""Trading signal emitted by the mean reversion strategy."""

	action: SignalType
	reason: str
	stop_price: float | None = None


class MeanReversionStrategy:
	"""Evaluate entry and exit rules for a long-only mean reversion setup."""

	def __init__(self, config: dict) -> None:
		self.config = config
		self.atr_stop_multiplier = config["strategy"]["atr_stop_multiplier"]
		# Minimum stop distance as fraction of price (e.g. 0.005 = 0.5%)
		self.min_stop_pct = config.get("strategy", {}).get("min_stop_pct", 0.005)
		self.rsi_entry = config["strategy"]["rsi_entry"]
		self.bb_lower_buffer_pct = config["strategy"].get("bollinger_lower_buffer_pct", 0.0)
		self.bb_exit_buffer_pct = config["strategy"].get("bollinger_exit_buffer_pct", 0.0)

	def evaluate_entry(self, row: pd.Series) -> Signal:
		"""Return a buy signal when all entry conditions are true."""
		if self._has_missing_values(row):
			return Signal("hold", "indikátor bemelegítés")

		trend_filter = row["close"] > row["ema200"]
		band_reversion = row["close"] < row["bb_lower"] * (1 + self.bb_lower_buffer_pct)
		oversold = row["rsi"] < self.rsi_entry

		if trend_filter and band_reversion and oversold:
			# Compute ATR-based stop and enforce a minimum percentage distance
			atr_stop = row["atr"] * self.atr_stop_multiplier
			min_stop = float(row["close"]) * float(self.min_stop_pct)
			stop_distance = max(atr_stop, min_stop)
			stop_price = float(row["close"]) - stop_distance
			return Signal(
				"buy",
				"EMA trend + Bollinger alsó szalag + RSI túladott",
				float(stop_price),
			)

		return Signal("hold", "nincs belépési jel")

	def evaluate_exit(self, row: pd.Series, position: dict) -> Signal:
		"""Return a sell signal when the take-profit or ATR stop is reached."""
		if self._has_missing_values(row):
			return Signal("hold", "indikátor bemelegítés")

		stop_price = position.get("stop_price")
		if stop_price is not None and row["low"] <= stop_price:
			return Signal("sell", "ATR stop sérült")

		exit_target = row["bb_middle"] * (1 + self.bb_exit_buffer_pct)
		if row["close"] >= exit_target:
			return Signal("sell", "Bollinger középső szalag elérve + buffer")

		return Signal("hold", "pozíció tartása")

	@staticmethod
	def _has_missing_values(row: pd.Series) -> bool:
		required_columns = ["ema200", "rsi", "bb_lower", "bb_middle", "atr"]
		return row[required_columns].isna().any()


class BreakoutMomentumStrategy:
	"""Evaluate entry and exit rules for a breakout momentum setup."""

	def __init__(self, config: dict) -> None:
		self.config = config
		self.atr_stop_multiplier = config["strategy"]["atr_stop_multiplier"]
		self.min_stop_pct = config.get("strategy", {}).get("min_stop_pct", 0.005)
		self.rsi_momentum = config.get("strategy", {}).get("rsi_momentum", 50)
		self.breakout_buffer_pct = config.get("strategy", {}).get("breakout_buffer_pct", 0.0)
		self.take_profit_pct = config.get("strategy", {}).get("take_profit_pct", 0.02)
		self.exit_buffer_pct = config.get("strategy", {}).get("bollinger_exit_buffer_pct", 0.0)

	def evaluate_entry(self, row: pd.Series) -> Signal:
		if self._has_missing_values(row):
			return Signal("hold", "indikátor bemelegítés")

		trend_filter = row["close"] > row["ema200"]
		breakout = row["close"] > row["bb_upper"] * (1 + self.breakout_buffer_pct)
		momentum = row["rsi"] > self.rsi_momentum
		strong_candle = row["close"] > row["open"] and row["close"] > row.get("prev_close", row["close"])

		if trend_filter and breakout and momentum and strong_candle:
			atr_stop = row["atr"] * self.atr_stop_multiplier
			min_stop = float(row["close"]) * float(self.min_stop_pct)
			stop_distance = max(atr_stop, min_stop)
			stop_price = float(row["close"]) - stop_distance
			return Signal(
				"buy",
				"EMA trend + breakout felett + RSI momentum",
				float(stop_price),
			)

		return Signal("hold", "nincs breakout jel")

	def evaluate_exit(self, row: pd.Series, position: dict) -> Signal:
		if self._has_missing_values(row):
			return Signal("hold", "indikátor bemelegítés")

		stop_price = position.get("stop_price")
		if stop_price is not None and row["low"] <= stop_price:
			return Signal("sell", "ATR stop sérült")

		exit_target = row["bb_middle"] * (1 - self.exit_buffer_pct)
		if row["close"] <= exit_target:
			return Signal("sell", "momentum pullback alá esett")

		return Signal("hold", "pozíció tartása")

	@staticmethod
	def _has_missing_values(row: pd.Series) -> bool:
		required_columns = ["ema200", "rsi", "bb_upper", "bb_middle", "atr"]
		return row[required_columns].isna().any()
