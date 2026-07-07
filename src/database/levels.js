const db = require('./db');

const getStmt = db.prepare('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?');
const insertStmt = db.prepare('INSERT INTO levels (guild_id, user_id) VALUES (?, ?)');
const updateStmt = db.prepare('UPDATE levels SET xp = ?, level = ? WHERE guild_id = ? AND user_id = ?');
const leaderboardStmt = db.prepare('SELECT * FROM levels WHERE guild_id = ? ORDER BY xp DESC LIMIT ?');
const rankStmt = db.prepare('SELECT COUNT(*) + 1 AS rank FROM levels WHERE guild_id = ? AND xp > ?');

function xpForNextLevel(level) {
  return 5 * level * level + 50 * level + 100;
}

function getOrCreate(guildId, userId) {
  let row = getStmt.get(guildId, userId);
  if (!row) {
    insertStmt.run(guildId, userId);
    row = getStmt.get(guildId, userId);
  }
  return row;
}

function getLevel(guildId, userId) {
  return getOrCreate(guildId, userId);
}

function addXp(guildId, userId, amount) {
  const row = getOrCreate(guildId, userId);
  let { xp, level } = row;
  xp += amount;

  let leveledUp = false;
  while (xp >= xpForNextLevel(level)) {
    xp -= xpForNextLevel(level);
    level += 1;
    leveledUp = true;
  }

  updateStmt.run(xp, level, guildId, userId);
  return { xp, level, leveledUp };
}

function getLeaderboard(guildId, limit = 10) {
  return leaderboardStmt.all(guildId, limit);
}

function getRank(guildId, xp) {
  return rankStmt.get(guildId, xp).rank;
}

module.exports = { xpForNextLevel, getLevel, addXp, getLeaderboard, getRank };
