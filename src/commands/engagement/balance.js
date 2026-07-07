const { SlashCommandBuilder } = require('discord.js');
const { getBalance } = require('../../database/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription("Check your (or someone else's) coin balance")
    .addUserOption((opt) => opt.setName('user').setDescription('The member to check')),
  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const balance = getBalance(interaction.guild.id, target.id);
    await interaction.reply(`💰 ${target.id === interaction.user.id ? 'You have' : `${target.username} has`} **${balance}** coins.`);
  },
};
