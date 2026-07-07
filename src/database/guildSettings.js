const db = require('./db');

const getStmt = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?');
const insertStmt = db.prepare('INSERT INTO guild_settings (guild_id) VALUES (?)');
const setModLogChannelStmt = db.prepare('UPDATE guild_settings SET mod_log_channel_id = ? WHERE guild_id = ?');
const setWelcomeChannelStmt = db.prepare('UPDATE guild_settings SET welcome_channel_id = ? WHERE guild_id = ?');
const setWelcomeMessageStmt = db.prepare('UPDATE guild_settings SET welcome_message = ? WHERE guild_id = ?');
const setModulesEnabledStmt = db.prepare('UPDATE guild_settings SET modules_enabled = ? WHERE guild_id = ?');
const setBirthdayChannelStmt = db.prepare('UPDATE guild_settings SET birthday_channel_id = ? WHERE guild_id = ?');
const setTicketCategoryStmt = db.prepare('UPDATE guild_settings SET ticket_category_id = ? WHERE guild_id = ?');
const setTicketSupportRoleStmt = db.prepare('UPDATE guild_settings SET ticket_support_role_id = ? WHERE guild_id = ?');
const setStarboardChannelStmt = db.prepare('UPDATE guild_settings SET starboard_channel_id = ? WHERE guild_id = ?');
const setStarboardThresholdStmt = db.prepare('UPDATE guild_settings SET starboard_threshold = ? WHERE guild_id = ?');

function getGuildSettings(guildId) {
  let settings = getStmt.get(guildId);
  if (!settings) {
    insertStmt.run(guildId);
    settings = getStmt.get(guildId);
  }
  return { ...settings, modules_enabled: JSON.parse(settings.modules_enabled) };
}

function setModLogChannel(guildId, channelId) {
  getGuildSettings(guildId);
  setModLogChannelStmt.run(channelId, guildId);
}

function setWelcomeChannel(guildId, channelId) {
  getGuildSettings(guildId);
  setWelcomeChannelStmt.run(channelId, guildId);
}

function setWelcomeMessage(guildId, message) {
  getGuildSettings(guildId);
  setWelcomeMessageStmt.run(message, guildId);
}

function setBirthdayChannel(guildId, channelId) {
  getGuildSettings(guildId);
  setBirthdayChannelStmt.run(channelId, guildId);
}

function setTicketCategory(guildId, categoryId) {
  getGuildSettings(guildId);
  setTicketCategoryStmt.run(categoryId, guildId);
}

function setTicketSupportRole(guildId, roleId) {
  getGuildSettings(guildId);
  setTicketSupportRoleStmt.run(roleId, guildId);
}

function setStarboardChannel(guildId, channelId) {
  getGuildSettings(guildId);
  setStarboardChannelStmt.run(channelId, guildId);
}

function setStarboardThreshold(guildId, threshold) {
  getGuildSettings(guildId);
  setStarboardThresholdStmt.run(threshold, guildId);
}

function setModuleEnabled(guildId, moduleName, enabled) {
  const settings = getGuildSettings(guildId);
  settings.modules_enabled[moduleName] = enabled;
  setModulesEnabledStmt.run(JSON.stringify(settings.modules_enabled), guildId);
}

function isModuleEnabled(guildId, moduleName) {
  const settings = getGuildSettings(guildId);
  return settings.modules_enabled[moduleName] !== false;
}

module.exports = {
  getGuildSettings,
  setModLogChannel,
  setWelcomeChannel,
  setWelcomeMessage,
  setBirthdayChannel,
  setTicketCategory,
  setTicketSupportRole,
  setStarboardChannel,
  setStarboardThreshold,
  setModuleEnabled,
  isModuleEnabled,
};
