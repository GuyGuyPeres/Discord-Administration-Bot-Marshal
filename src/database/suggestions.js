const db = require('./db');

const insertStmt = db.prepare(
  'INSERT INTO suggestions (guild_id, channel_id, message_id, user_id, content) VALUES (?, ?, ?, ?, ?)',
);
const getStmt = db.prepare('SELECT * FROM suggestions WHERE guild_id = ? AND id = ?');
const setStatusStmt = db.prepare('UPDATE suggestions SET status = ? WHERE guild_id = ? AND id = ?');

function createSuggestion(guildId, channelId, messageId, userId, content) {
  return insertStmt.run(guildId, channelId, messageId, userId, content).lastInsertRowid;
}

function getSuggestion(guildId, id) {
  return getStmt.get(guildId, id) ?? null;
}

function setSuggestionStatus(guildId, id, status) {
  setStatusStmt.run(status, guildId, id);
}

module.exports = { createSuggestion, getSuggestion, setSuggestionStatus };
