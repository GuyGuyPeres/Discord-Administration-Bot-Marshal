const { SlashCommandBuilder } = require('discord.js');
const jokes = require('../../data/jokes');

module.exports = {
  data: new SlashCommandBuilder().setName('joke').setDescription('Get a random joke'),
  async execute(interaction) {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    await interaction.reply(joke);
  },
};
