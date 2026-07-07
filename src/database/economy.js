const db = require('./db');

const DAILY_AMOUNT = 100;
const DAILY_COOLDOWN_SECONDS = 24 * 60 * 60;

const getStmt = db.prepare('SELECT * FROM economy WHERE guild_id = ? AND user_id = ?');
const insertStmt = db.prepare('INSERT INTO economy (guild_id, user_id) VALUES (?, ?)');
const setBalanceStmt = db.prepare('UPDATE economy SET balance = ? WHERE guild_id = ? AND user_id = ?');
const setDailyStmt = db.prepare('UPDATE economy SET balance = ?, last_daily_at = ? WHERE guild_id = ? AND user_id = ?');

function getOrCreate(guildId, userId) {
  let row = getStmt.get(guildId, userId);
  if (!row) {
    insertStmt.run(guildId, userId);
    row = getStmt.get(guildId, userId);
  }
  return row;
}

function getBalance(guildId, userId) {
  return getOrCreate(guildId, userId).balance;
}

function addBalance(guildId, userId, amount) {
  const row = getOrCreate(guildId, userId);
  const newBalance = Math.max(0, row.balance + amount);
  setBalanceStmt.run(newBalance, guildId, userId);
  return newBalance;
}

function claimDaily(guildId, userId) {
  const row = getOrCreate(guildId, userId);
  const now = Math.floor(Date.now() / 1000);

  if (row.last_daily_at && now - row.last_daily_at < DAILY_COOLDOWN_SECONDS) {
    return { success: false, secondsRemaining: DAILY_COOLDOWN_SECONDS - (now - row.last_daily_at) };
  }

  const newBalance = row.balance + DAILY_AMOUNT;
  setDailyStmt.run(newBalance, now, guildId, userId);
  return { success: true, amount: DAILY_AMOUNT, newBalance };
}

function transfer(guildId, fromUserId, toUserId, amount) {
  const from = getOrCreate(guildId, fromUserId);
  if (from.balance < amount) return false;

  getOrCreate(guildId, toUserId);
  addBalance(guildId, fromUserId, -amount);
  addBalance(guildId, toUserId, amount);
  return true;
}

module.exports = { getBalance, addBalance, claimDaily, transfer, DAILY_AMOUNT };
