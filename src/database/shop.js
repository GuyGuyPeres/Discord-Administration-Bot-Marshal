const db = require('./db');

const insertStmt = db.prepare('INSERT INTO shop_items (guild_id, name, price, role_id) VALUES (?, ?, ?, ?)');
const listStmt = db.prepare('SELECT * FROM shop_items WHERE guild_id = ? ORDER BY price ASC');
const getStmt = db.prepare('SELECT * FROM shop_items WHERE guild_id = ? AND id = ?');
const removeStmt = db.prepare('DELETE FROM shop_items WHERE guild_id = ? AND id = ?');

function addItem(guildId, name, price, roleId = null) {
  return insertStmt.run(guildId, name, price, roleId).lastInsertRowid;
}

function listItems(guildId) {
  return listStmt.all(guildId);
}

function getItem(guildId, itemId) {
  return getStmt.get(guildId, itemId) ?? null;
}

function removeItem(guildId, itemId) {
  return removeStmt.run(guildId, itemId).changes > 0;
}

module.exports = { addItem, listItems, getItem, removeItem };
