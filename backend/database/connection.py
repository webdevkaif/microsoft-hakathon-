import sqlite3
import os
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[2] / 'finguard.db'

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
