const db = require('./db');

const insertStmt = db.prepare(
  'INSERT INTO reminders (guild_id, channel_id, user_id, message, remind_at) VALUES (?, ?, ?, ?, ?)',
);
const getDueStmt = db.prepare('SELECT * FROM reminders WHERE remind_at <= ?');
const deleteStmt = db.prepare('DELETE FROM reminders WHERE id = ?');

function addReminder(guildId, channelId, userId, message, remindAt) {
  return insertStmt.run(guildId, channelId, userId, message, remindAt).lastInsertRowid;
}

function getDueReminders(nowUnixSeconds) {
  return getDueStmt.all(nowUnixSeconds);
}

function deleteReminder(id) {
  deleteStmt.run(id);
}

module.exports = { addReminder, getDueReminders, deleteReminder };
