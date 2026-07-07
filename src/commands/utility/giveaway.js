const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createGiveaway } = require('../../database/giveaways');

const GIVEAWAY_EMOJI = '🎉';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a giveaway')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((opt) => opt.setName('prize').setDescription('What are you giving away?').setRequired(true).setMaxLength(200))
    .addIntegerOption((opt) =>
      opt.setName('duration_minutes').setDescription('How long the giveaway runs, in minutes').setRequired(true).setMinValue(1),
    )
    .addIntegerOption((opt) =>
      opt.setName('winners').setDescription('Number of winners (default 1)').setMinValue(1).setMaxValue(20),
    ),
  async execute(interaction) {
    const prize = interaction.options.getString('prize', true);
    const durationMinutes = interaction.options.getInteger('duration_minutes', true);
    const winnerCount = interaction.options.getInteger('winners') ?? 1;
    const endsAt = Math.floor(Date.now() / 1000) + durationMinutes * 60;

    const embed = new EmbedBuilder()
      .setTitle('🎉 Giveaway!')
      .setColor(0x9b59b6)
      .setDescription(`**Prize:** ${prize}\nReact with ${GIVEAWAY_EMOJI} to enter!`)
      .addFields(
        { name: 'Winners', value: `${winnerCount}`, inline: true },
        { name: 'Ends', value: `<t:${endsAt}:R>`, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
    const message = await interaction.fetchReply();
    await message.react(GIVEAWAY_EMOJI).catch(() => {});

    createGiveaway(interaction.guild.id, interaction.channel.id, message.id, prize, winnerCount, endsAt);
  },
};
