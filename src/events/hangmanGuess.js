const { Events } = require('discord.js');
const { processGuess } = require('../utils/hangman');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (!message.guild || message.author.bot) return;
    await processGuess(message);
  },
};
