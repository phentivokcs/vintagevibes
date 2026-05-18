"""Simple helper to seed the SQLite DB from the repo migration SQL."""

from pathlib import Path
import sqlite3
import sys
import yaml

# Ensure repo root is on sys.path so local package imports work when running
# the script directly (avoids ModuleNotFoundError).
repo_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(repo_root))

from sol_mean_reversion_bot.storage.db import BotDatabase


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    config_path = repo_root / "sol_mean_reversion_bot" / "config.yaml"
    seed_sql = repo_root / "sol_mean_reversion_bot" / "migrations" / "seed_trades.sql"
    try:
        print(f"[seed_db] Repo root: {repo_root}")
        print(f"[seed_db] Reading config: {config_path}")
        with config_path.open("r", encoding="utf-8") as f:
            config = yaml.safe_load(f)

        db_path = config.get("storage", {}).get("database_path")
        if not db_path:
            raise SystemExit("database_path not found in config.yaml")

        # Resolve DB path relative to repo root if it's not absolute
        db_full = Path(db_path)
        if not db_full.is_absolute():
            db_full = repo_root / db_full

        print(f"[seed_db] Using DB path: {db_full}")

        # Ensure DB and tables exist
        print("[seed_db] Initializing database and tables...")
        BotDatabase(str(db_full))

        # Load seed SQL and execute
        if not seed_sql.exists():
            raise SystemExit(f"Seed SQL not found: {seed_sql}")

        print(f"[seed_db] Applying seed SQL: {seed_sql}")
        sql_text = seed_sql.read_text(encoding="utf-8")
        with sqlite3.connect(str(db_full)) as conn:
            conn.executescript(sql_text)

        print(f"[seed_db] Seeded database at: {db_full}")
    except Exception as exc:
        print(f"[seed_db][ERROR] {exc}")
        raise


if __name__ == "__main__":
    main()
