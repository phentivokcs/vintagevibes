"""Diagnose why stops are hit: compute stop distances and durations per position."""
from pathlib import Path
import sqlite3
import yaml
from datetime import datetime

import pandas as pd


def load_config(repo_root: Path):
    config_path = repo_root / "sol_mean_reversion_bot" / "config.yaml"
    with config_path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def main():
    repo_root = Path(__file__).resolve().parents[1]
    config = load_config(repo_root)
    db_path = config["storage"]["database_path"]
    db_full = Path(db_path)
    if not db_full.is_absolute():
        db_full = repo_root / db_full

    print(f"[diagnose] DB: {db_full}")
    with sqlite3.connect(str(db_full)) as conn:
        positions = pd.read_sql_query("SELECT * FROM positions ORDER BY opened_at", conn)
        trades = pd.read_sql_query("SELECT * FROM trades ORDER BY timestamp", conn)

    if positions.empty:
        print("[diagnose] No positions table entries found.")
        return

    # Parse times if present
    for col in ("opened_at", "closed_at"):
        if col in positions.columns:
            positions[col] = pd.to_datetime(positions[col], errors="coerce")

    # Compute stop distance pct and duration
    def stop_distance_pct(row):
        if pd.isna(row.get("stop_price")) or pd.isna(row.get("entry_price")):
            return None
        try:
            return abs(row["entry_price"] - row["stop_price"]) / float(row["entry_price"]) * 100.0
        except Exception:
            return None

    positions["stop_distance_pct"] = positions.apply(stop_distance_pct, axis=1)
    positions["duration_minutes"] = (
        positions["closed_at"] - positions["opened_at"]
    ).dt.total_seconds() / 60.0

    # Summarize per symbol
    summary = positions.groupby("symbol").agg(
        positions_count=("id", "count"),
        avg_stop_pct=("stop_distance_pct", "mean"),
        median_stop_pct=("stop_distance_pct", "median"),
        avg_duration_min=("duration_minutes", "mean"),
        stopped_count=("status", lambda s: (s == "closed").sum()),
    )

    print("\n[diagnose] Per-symbol summary:")
    print(summary.to_string())

    print("\n[diagnose] Positions with small stop distance (<1%):")
    tight = positions[positions["stop_distance_pct"] < 1]
    if tight.empty:
        print("None")
    else:
        print(tight[["id", "symbol", "entry_price", "stop_price", "stop_distance_pct", "duration_minutes", "status"]].to_string(index=False))

    print("\n[diagnose] Positions sample (all):")
    print(positions[["id", "symbol", "entry_price", "stop_price", "stop_distance_pct", "duration_minutes", "status"]].to_string(index=False))


if __name__ == "__main__":
    main()
