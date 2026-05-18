from pathlib import Path
import sqlite3
import yaml

root = Path(__file__).resolve().parents[1]
config = yaml.safe_load((root / 'sol_mean_reversion_bot' / 'config.yaml').read_text())
db_path = root / config['storage']['database_path']

with sqlite3.connect(db_path) as conn:
    cur = conn.cursor()
    cur.execute('SELECT timeframe, count(*) FROM market_data WHERE symbol=? GROUP BY timeframe', (config['symbol'],))
    print('timeframe counts:', cur.fetchall())

    cur.execute(
        'SELECT count(*) FROM (SELECT symbol, timeframe, timestamp, count(*) AS c FROM market_data WHERE symbol=? AND timeframe=? GROUP BY symbol, timeframe, timestamp HAVING c>1)',
        (config['symbol'], config['timeframe']),
    )
    print('duplicate timestamp rows:', cur.fetchone()[0])
