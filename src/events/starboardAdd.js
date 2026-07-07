const { Events } = require('discord.js');
const { handleStarReaction } = require('../utils/starboardHandler');

module.exports = {
  name: Events.MessageReactionAdd,
  execute: handleStarReaction,
};
