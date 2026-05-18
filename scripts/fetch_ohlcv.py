"""Fetch historical OHLCV from Binance and cache to CSV.

Usage: python scripts/fetch_ohlcv.py
"""
from pathlib import Path
import sys
from datetime import datetime, timedelta, timezone
import time

import pandas as pd

from sol_mean_reversion_bot.data.binance_data import BinanceDataClient


def ms(ts: datetime) -> int:
    return int(ts.replace(tzinfo=timezone.utc).timestamp() * 1000)


def main():
    repo_root = Path(__file__).resolve().parents[1]
    # parameters
    symbol = "SOL/USDC"
    timeframe = "1h"
    days = 180
    limit = 500

    client = BinanceDataClient()
    exchange = client.exchange

    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)
    since = ms(start)

    all_rows = []
    print(f"[fetch] Downloading {symbol} {timeframe} from {start.date()} to {end.date()}")

    while True:
        try:
            candles = exchange.fetch_ohlcv(symbol, timeframe=timeframe, since=since, limit=limit)
        except Exception as exc:
            print(f"[fetch][ERROR] {exc}")
            time.sleep(1)
            continue

        if not candles:
            break

        df = client.clean_ohlcv(candles)
        if df.empty:
            break

        all_rows.append(df)
        last_ts = int(df["timestamp"].astype('int64').iloc[-1] // 10**6)
        # advance since to last_ts + 1 ms
        since = last_ts + 1

        # stop if we've reached now
        if last_ts >= ms(end):
            break

        # sleep to respect rate limits
        time.sleep(0.2)

    if not all_rows:
        print("[fetch] No data downloaded")
        return

    data = pd.concat(all_rows).drop_duplicates(subset="timestamp").sort_values("timestamp").reset_index(drop=True)

    cache_dir = repo_root / "sol_mean_reversion_bot" / "data" / "cache"
    cache_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{symbol.replace('/','_')}_{timeframe}.csv"
    path = cache_dir / filename
    data.to_csv(path, index=False)
    print(f"[fetch] Wrote {len(data)} candles to {path}")


if __name__ == "__main__":
    main()
