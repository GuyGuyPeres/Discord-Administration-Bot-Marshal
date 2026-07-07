const db = require('./db');

const insertStmt = db.prepare(
  'INSERT INTO giveaways (guild_id, channel_id, message_id, prize, winner_count, ends_at) VALUES (?, ?, ?, ?, ?, ?)',
);
const getDueStmt = db.prepare('SELECT * FROM giveaways WHERE ends_at <= ?');
const deleteStmt = db.prepare('DELETE FROM giveaways WHERE id = ?');

function createGiveaway(guildId, channelId, messageId, prize, winnerCount, endsAt) {
  return insertStmt.run(guildId, channelId, messageId, prize, winnerCount, endsAt).lastInsertRowid;
}

function getDueGiveaways(nowUnixSeconds) {
  return getDueStmt.all(nowUnixSeconds);
}

function deleteGiveaway(id) {
  deleteStmt.run(id);
}

module.exports = { createGiveaway, getDueGiveaways, deleteGiveaway };
