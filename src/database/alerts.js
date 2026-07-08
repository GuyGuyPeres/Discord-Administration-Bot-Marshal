const db = require('./db');

const getStmt = db.prepare('SELECT * FROM alerts_config WHERE guild_id = ?');
const insertStmt = db.prepare('INSERT INTO alerts_config (guild_id) VALUES (?)');
const setEnabledStmt = db.prepare('UPDATE alerts_config SET enabled = ? WHERE guild_id = ?');
const setChannelStmt = db.prepare('UPDATE alerts_config SET channel_id = ? WHERE guild_id = ?');
const setRoleStmt = db.prepare('UPDATE alerts_config SET role_id = ? WHERE guild_id = ?');
const setCitiesStmt = db.prepare('UPDATE alerts_config SET cities = ? WHERE guild_id = ?');
const getActiveConfigsStmt = db.prepare(
  "SELECT * FROM alerts_config WHERE enabled = 1 AND channel_id IS NOT NULL",
);

function parseConfig(config) {
  return { ...config, enabled: Boolean(config.enabled), cities: JSON.parse(config.cities) };
}

function getAlertsConfig(guildId) {
  let config = getStmt.get(guildId);
  if (!config) {
    insertStmt.run(guildId);
    config = getStmt.get(guildId);
  }
  return parseConfig(config);
}

function setAlertsEnabled(guildId, enabled) {
  getAlertsConfig(guildId);
  setEnabledStmt.run(enabled ? 1 : 0, guildId);
}

function setAlertsChannel(guildId, channelId) {
  getAlertsConfig(guildId);
  setChannelStmt.run(channelId, guildId);
}

function setAlertsRole(guildId, roleId) {
  getAlertsConfig(guildId);
  setRoleStmt.run(roleId, guildId);
}

function setAlertsCities(guildId, cities) {
  getAlertsConfig(guildId);
  setCitiesStmt.run(JSON.stringify(cities), guildId);
}

function getActiveAlertConfigs() {
  return getActiveConfigsStmt.all().map(parseConfig);
}

module.exports = {
  getAlertsConfig,
  setAlertsEnabled,
  setAlertsChannel,
  setAlertsRole,
  setAlertsCities,
  getActiveAlertConfigs,
};
