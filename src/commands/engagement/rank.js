const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLevel, getRank, xpForNextLevel } = require('../../database/levels');
const { progressBar } = require('../../utils/progressBar');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription("Check your (or someone else's) level and XP")
    .addUserOption((opt) => opt.setName('user').setDescription('The member to check')),
  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const { xp, level } = getLevel(interaction.guild.id, target.id);
    const rank = getRank(interaction.guild.id, xp);
    const needed = xpForNextLevel(level);

    const embed = new EmbedBuilder()
      .setTitle(`${target.username}'s Rank`)
      .setColor(0x00cec9)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: 'Rank', value: `#${rank}`, inline: true },
        { name: 'Level', value: `${level}`, inline: true },
        { name: 'XP', value: `${xp} / ${needed}`, inline: true },
        { name: 'Progress', value: `${progressBar(xp, needed)} ${Math.floor((xp / needed) * 100)}%` },
      );

    await interaction.reply({ embeds: [embed] });
  },
};
