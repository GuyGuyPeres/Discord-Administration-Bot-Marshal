const { SlashCommandBuilder } = require('discord.js');
const { claimDaily } = require('../../database/economy');

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

module.exports = {
  data: new SlashCommandBuilder().setName('daily').setDescription('Claim your daily coin reward'),
  async execute(interaction) {
    const result = claimDaily(interaction.guild.id, interaction.user.id);

    if (!result.success) {
      return interaction.reply({
        content: `You already claimed your daily reward. Come back in ${formatDuration(result.secondsRemaining)}.`,
        ephemeral: true,
      });
    }

    await interaction.reply(`💰 You claimed your daily **${result.amount}** coins! New balance: **${result.newBalance}**.`);
  },
};
