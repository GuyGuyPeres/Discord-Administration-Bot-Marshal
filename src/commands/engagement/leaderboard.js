const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../../database/levels');

module.exports = {
  data: new SlashCommandBuilder().setName('leaderboard').setDescription('View the server XP leaderboard'),
  async execute(interaction) {
    const rows = getLeaderboard(interaction.guild.id, 10);

    if (rows.length === 0) {
      return interaction.reply({ content: 'No one has earned any XP yet.', ephemeral: true });
    }

    const medals = ['🥇', '🥈', '🥉'];
    const embed = new EmbedBuilder()
      .setTitle('🏆 XP Leaderboard')
      .setColor(0xf1c40f)
      .setDescription(
        rows
          .map((r, i) => `${medals[i] ?? `**${i + 1}.**`} <@${r.user_id}> — Level ${r.level} (${r.xp} XP)`)
          .join('\n'),
      );

    await interaction.reply({ embeds: [embed] });
  },
};
