const { SlashCommandBuilder } = require('discord.js');
const { startHangman } = require('../../utils/hangman');

module.exports = {
  data: new SlashCommandBuilder().setName('hangman').setDescription('Start a game of hangman in this channel'),
  async execute(interaction) {
    await startHangman(interaction);
  },
};
