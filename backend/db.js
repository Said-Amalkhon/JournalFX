const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// In Docker: DB lives at /data/journalfx.db (mounted volume)
// Locally: falls back to ./journalfx.db
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'journalfx.db');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    week_start_date TEXT NOT NULL,
    target_amount REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, week_start_date)
  );
`);

// Migrations for existing databases
try { db.exec('ALTER TABLE trades ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE'); } catch {}
try { db.exec('ALTER TABLE weekly_targets ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE'); } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL'); } catch {}

// Migrate weekly_targets from old UNIQUE(week_start_date) to UNIQUE(user_id, week_start_date)
// Check if old constraint exists by inspecting the table's SQL
try {
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='weekly_targets'").get();
  if (tableInfo && tableInfo.sql && !tableInfo.sql.includes('UNIQUE(user_id') && !tableInfo.sql.includes('user_id, week_start_date')) {
    db.exec(`
      CREATE TABLE weekly_targets_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        week_start_date TEXT NOT NULL,
        target_amount REAL NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id, week_start_date)
      );
      INSERT INTO weekly_targets_new (id, user_id, week_start_date, target_amount, created_at)
        SELECT id, user_id, week_start_date, target_amount, created_at FROM weekly_targets;
      DROP TABLE weekly_targets;
      ALTER TABLE weekly_targets_new RENAME TO weekly_targets;
    `);
  }
} catch {}

module.exports = db;
