const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'bot.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    prefix TEXT DEFAULT '!',
    mod_log_channel_id TEXT,
    welcome_channel_id TEXT,
    welcome_message TEXT,
    birthday_channel_id TEXT,
    ticket_category_id TEXT,
    ticket_support_role_id TEXT,
    starboard_channel_id TEXT,
    starboard_threshold INTEGER NOT NULL DEFAULT 3,
    suggestions_channel_id TEXT,
    modules_enabled TEXT DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE INDEX IF NOT EXISTS idx_warnings_guild_user ON warnings (guild_id, user_id);

  CREATE TABLE IF NOT EXISTS automod_config (
    guild_id TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 0,
    banned_words TEXT NOT NULL DEFAULT '[]',
    block_invites INTEGER NOT NULL DEFAULT 0,
    max_mentions INTEGER NOT NULL DEFAULT 0,
    caps_threshold INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS antiraid_config (
    guild_id TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 0,
    join_threshold INTEGER NOT NULL DEFAULT 10,
    window_seconds INTEGER NOT NULL DEFAULT 10,
    min_account_age_days INTEGER NOT NULL DEFAULT 7
  );

  CREATE TABLE IF NOT EXISTS reaction_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    emoji_key TEXT NOT NULL,
    role_id TEXT NOT NULL,
    UNIQUE(message_id, emoji_key)
  );

  CREATE INDEX IF NOT EXISTS idx_reaction_roles_message ON reaction_roles (message_id);

  CREATE TABLE IF NOT EXISTS custom_commands (
    guild_id TEXT NOT NULL,
    trigger TEXT NOT NULL,
    response TEXT NOT NULL,
    PRIMARY KEY (guild_id, trigger)
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    remind_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders (remind_at);

  CREATE TABLE IF NOT EXISTS giveaways (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    prize TEXT NOT NULL,
    winner_count INTEGER NOT NULL,
    ends_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_giveaways_ends_at ON giveaways (ends_at);

  CREATE TABLE IF NOT EXISTS birthdays (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    last_announced_year INTEGER,
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_birthdays_month_day ON birthdays (month, day);

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open'
  );

  CREATE INDEX IF NOT EXISTS idx_tickets_guild_user ON tickets (guild_id, user_id);

  CREATE TABLE IF NOT EXISTS levels (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_levels_guild_xp ON levels (guild_id, xp DESC);

  CREATE TABLE IF NOT EXISTS economy (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    last_daily_at INTEGER,
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    role_id TEXT
  );

  CREATE TABLE IF NOT EXISTS starboard_posts (
    guild_id TEXT NOT NULL,
    source_message_id TEXT NOT NULL,
    starboard_message_id TEXT NOT NULL,
    PRIMARY KEY (guild_id, source_message_id)
  );

  CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
  );
`);

// Migrations for columns added to guild_settings after the table was first created —
// CREATE TABLE IF NOT EXISTS above is a no-op on a database that predates these columns.
function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!columns.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn('guild_settings', 'birthday_channel_id', 'TEXT');
ensureColumn('guild_settings', 'ticket_category_id', 'TEXT');
ensureColumn('guild_settings', 'ticket_support_role_id', 'TEXT');
ensureColumn('guild_settings', 'starboard_channel_id', 'TEXT');
ensureColumn('guild_settings', 'starboard_threshold', 'INTEGER NOT NULL DEFAULT 3');
ensureColumn('guild_settings', 'suggestions_channel_id', 'TEXT');

module.exports = db;
