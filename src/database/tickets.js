const db = require('./db');

const insertStmt = db.prepare('INSERT INTO tickets (guild_id, channel_id, user_id) VALUES (?, ?, ?)');
const getOpenForUserStmt = db.prepare(
  "SELECT * FROM tickets WHERE guild_id = ? AND user_id = ? AND status = 'open'",
);
const getByChannelStmt = db.prepare('SELECT * FROM tickets WHERE channel_id = ?');
const closeStmt = db.prepare("UPDATE tickets SET status = 'closed' WHERE channel_id = ?");

function createTicket(guildId, channelId, userId) {
  return insertStmt.run(guildId, channelId, userId).lastInsertRowid;
}

function getOpenTicketForUser(guildId, userId) {
  return getOpenForUserStmt.get(guildId, userId) ?? null;
}

function getTicketByChannel(channelId) {
  return getByChannelStmt.get(channelId) ?? null;
}

function closeTicket(channelId) {
  return closeStmt.run(channelId).changes > 0;
}

module.exports = { createTicket, getOpenTicketForUser, getTicketByChannel, closeTicket };
