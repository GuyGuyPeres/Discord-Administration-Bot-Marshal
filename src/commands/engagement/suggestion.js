const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getSuggestion, setSuggestionStatus } = require('../../database/suggestions');

async function resolve(interaction, status, color, label) {
  const id = interaction.options.getInteger('id', true);
  const suggestion = getSuggestion(interaction.guild.id, id);
  if (!suggestion) {
    return interaction.reply({ content: `No suggestion found with ID **#${id}**.`, ephemeral: true });
  }

  setSuggestionStatus(interaction.guild.id, id, status);

  const channel = await interaction.guild.channels.fetch(suggestion.channel_id).catch(() => null);
  const message = channel ? await channel.messages.fetch(suggestion.message_id).catch(() => null) : null;

  if (message) {
    const embed = EmbedBuilder.from(message.embeds[0]).setColor(color);
    const fields = embed.data.fields?.filter((f) => f.name !== 'Status') ?? [];
    embed.setFields([...fields, { name: 'Status', value: label }]);
    await message.edit({ embeds: [embed] }).catch(() => {});
  }

  return interaction.reply(`Suggestion **#${id}** marked as ${label}.`);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestion')
    .setDescription('Approve or deny a suggestion')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('approve')
        .setDescription('Approve a suggestion')
        .addIntegerOption((opt) => opt.setName('id').setDescription('The suggestion ID').setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName('deny')
        .setDescription('Deny a suggestion')
        .addIntegerOption((opt) => opt.setName('id').setDescription('The suggestion ID').setRequired(true)),
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'approve') return resolve(interaction, 'approved', 0x2ecc71, '✅ Approved');
    if (sub === 'deny') return resolve(interaction, 'denied', 0xe74c3c, '❌ Denied');
  },
};
