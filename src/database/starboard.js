const db = require('./db');

const getStmt = db.prepare('SELECT * FROM starboard_posts WHERE guild_id = ? AND source_message_id = ?');
const upsertStmt = db.prepare(`
  INSERT INTO starboard_posts (guild_id, source_message_id, starboard_message_id) VALUES (?, ?, ?)
  ON CONFLICT(guild_id, source_message_id) DO UPDATE SET starboard_message_id = excluded.starboard_message_id
`);

function getStarboardPost(guildId, sourceMessageId) {
  return getStmt.get(guildId, sourceMessageId) ?? null;
}

function upsertStarboardPost(guildId, sourceMessageId, starboardMessageId) {
  upsertStmt.run(guildId, sourceMessageId, starboardMessageId);
}

module.exports = { getStarboardPost, upsertStarboardPost };
