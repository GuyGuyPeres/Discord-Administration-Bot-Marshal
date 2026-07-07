const db = require('./db');

const upsertStmt = db.prepare(`
  INSERT INTO birthdays (guild_id, user_id, month, day) VALUES (?, ?, ?, ?)
  ON CONFLICT(guild_id, user_id) DO UPDATE SET month = excluded.month, day = excluded.day, last_announced_year = NULL
`);
const getStmt = db.prepare('SELECT * FROM birthdays WHERE guild_id = ? AND user_id = ?');
const removeStmt = db.prepare('DELETE FROM birthdays WHERE guild_id = ? AND user_id = ?');
const listStmt = db.prepare('SELECT * FROM birthdays WHERE guild_id = ?');
const getTodayStmt = db.prepare(
  'SELECT * FROM birthdays WHERE month = ? AND day = ? AND (last_announced_year IS NULL OR last_announced_year != ?)',
);
const markAnnouncedStmt = db.prepare(
  'UPDATE birthdays SET last_announced_year = ? WHERE guild_id = ? AND user_id = ?',
);

function setBirthday(guildId, userId, month, day) {
  upsertStmt.run(guildId, userId, month, day);
}

function getBirthday(guildId, userId) {
  return getStmt.get(guildId, userId) ?? null;
}

function removeBirthday(guildId, userId) {
  return removeStmt.run(guildId, userId).changes > 0;
}

function listBirthdays(guildId) {
  return listStmt.all(guildId);
}

function getBirthdaysForToday(month, day, year) {
  return getTodayStmt.all(month, day, year);
}

function markAnnounced(guildId, userId, year) {
  markAnnouncedStmt.run(year, guildId, userId);
}

module.exports = {
  setBirthday,
  getBirthday,
  removeBirthday,
  listBirthdays,
  getBirthdaysForToday,
  markAnnounced,
};
