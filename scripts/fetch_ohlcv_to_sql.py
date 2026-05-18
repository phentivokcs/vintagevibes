"""Fetch historical OHLCV from Binance and insert into the bot SQLite DB as `market_data` table."""
from pathlib import Path
import sqlite3
import time
from datetime import datetime, timedelta, timezone

from sol_mean_reversion_bot.data.binance_data import BinanceDataClient, clean_ohlcv
import pandas as pd


def ms(ts: datetime) -> int:
    return int(ts.replace(tzinfo=timezone.utc).timestamp() * 1000)


def main():
    repo_root = Path(__file__).resolve().parents[1]
    config_path = repo_root / "sol_mean_reversion_bot" / "config.yaml"
    import yaml

    with config_path.open("r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    # force SOL/USDC as requested
    symbol = "SOL/USDC"
    timeframe = config.get("timeframe", "1h")
    days = 180
    limit = 500

    db_path = Path(config.get("storage", {}).get("database_path", "sol_mean_reversion_bot/bot.db"))
    if not db_path.is_absolute():
        db_path = repo_root / db_path

    client = BinanceDataClient()
    exchange = client.exchange

    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)
    since = ms(start)

    rows = []
    print(f"[fetch_sql] Fetching {symbol} {timeframe} since {start.isoformat()}")
    while True:
        try:
            candles = exchange.fetch_ohlcv(symbol, timeframe=timeframe, since=since, limit=limit)
        except Exception as exc:
            print(f"[fetch_sql][ERROR] {exc}")
            time.sleep(1)
            continue

        if not candles:
            break

        df = clean_ohlcv(candles)
        if df.empty:
            break

        # convert timestamp to ISO strings
        df["timestamp"] = df["timestamp"].dt.tz_convert(None).dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        for _, r in df.iterrows():
            rows.append(
                (
                    r["timestamp"],
                    symbol,
                    timeframe,
                    float(r["open"]),
                    float(r["high"]),
                    float(r["low"]),
                    float(r["close"]),
                    float(r["volume"]),
                )
            )

        last_dt = pd.to_datetime(df["timestamp"].iloc[-1])
        since = ms(last_dt) + 1

        if since >= ms(end):
            break

        time.sleep(0.2)

    if not rows:
        print("[fetch_sql] No candles fetched.")
        return

    # insert into DB
    print(f"[fetch_sql] Inserting {len(rows)} rows into {db_path}")
    with sqlite3.connect(db_path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS market_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                symbol TEXT NOT NULL,
                timeframe TEXT NOT NULL,
                open REAL,
                high REAL,
                low REAL,
                close REAL,
                volume REAL
            );
            """
        )
        conn.executemany(
            "INSERT INTO market_data (timestamp, symbol, timeframe, open, high, low, close, volume) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
            rows,
        )

    print(f"[fetch_sql] Done.")


if __name__ == "__main__":
    main()
