const { SlashCommandBuilder } = require('discord.js');
const { startTrivia } = require('../../utils/triviaGame');

module.exports = {
  data: new SlashCommandBuilder().setName('trivia').setDescription('Answer a trivia question for a coin reward'),
  async execute(interaction) {
    await startTrivia(interaction);
  },
};
