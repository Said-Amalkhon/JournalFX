const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// In Docker: DB lives at /data/journalfx.db (mounted volume)
// Locally: falls back to ./journalfx.db
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'journalfx.db');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instrument TEXT NOT NULL,
    side TEXT NOT NULL,
    amount REAL NOT NULL,
    result_type TEXT NOT NULL,
    note TEXT DEFAULT '',
    reason_tag TEXT DEFAULT '',
    mood_tag TEXT DEFAULT '',
    trade_date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS weekly_targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start_date TEXT NOT NULL UNIQUE,
    target_amount REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
