const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGuildSettings } = require('../../database/guildSettings');
const { createSuggestion } = require('../../database/suggestions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion for the server')
    .addStringOption((opt) => opt.setName('text').setDescription('Your suggestion').setRequired(true).setMaxLength(1000)),
  async execute(interaction) {
    const settings = getGuildSettings(interaction.guild.id);
    if (!settings.suggestions_channel_id) {
      return interaction.reply({
        content: 'The suggestions channel has not been set up yet. Ask an admin to run `/config suggestions channel`.',
        ephemeral: true,
      });
    }

    const channel = await interaction.guild.channels.fetch(settings.suggestions_channel_id).catch(() => null);
    if (!channel) {
      return interaction.reply({ content: 'The configured suggestions channel no longer exists.', ephemeral: true });
    }

    const text = interaction.options.getString('text', true);

    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
      .setColor(0x3498db)
      .setDescription(text)
      .addFields({ name: 'Status', value: '🕒 Pending' });

    const message = await channel.send({ embeds: [embed] });
    await message.react('👍').catch(() => {});
    await message.react('👎').catch(() => {});

    const id = createSuggestion(interaction.guild.id, channel.id, message.id, interaction.user.id, text);
    await message.edit({ embeds: [embed.setFooter({ text: `Suggestion #${id}` })] }).catch(() => {});

    await interaction.reply({ content: `Your suggestion was posted in ${channel} as **#${id}**.`, ephemeral: true });
  },
};
