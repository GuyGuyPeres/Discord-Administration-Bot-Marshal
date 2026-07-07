const { SlashCommandBuilder } = require('discord.js');
const { startTicTacToe } = require('../../utils/tictactoe');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Challenge someone to Tic-Tac-Toe')
    .addUserOption((opt) => opt.setName('opponent').setDescription('Who to challenge').setRequired(true)),
  async execute(interaction) {
    await startTicTacToe(interaction);
  },
};
