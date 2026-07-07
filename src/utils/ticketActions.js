const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const { getGuildSettings } = require('../database/guildSettings');
const { createTicket, getOpenTicketForUser, getTicketByChannel, closeTicket } = require('../database/tickets');

async function openTicket(interaction) {
  const settings = getGuildSettings(interaction.guild.id);

  const existing = getOpenTicketForUser(interaction.guild.id, interaction.user.id);
  if (existing) {
    const channel = interaction.guild.channels.cache.get(existing.channel_id);
    if (channel) {
      return interaction.reply({ content: `You already have an open ticket: ${channel}`, ephemeral: true });
    }
  }

  const overwrites = [
    { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: interaction.user.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    },
    {
      id: interaction.client.user.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels],
    },
  ];
  if (settings.ticket_support_role_id) {
    overwrites.push({
      id: settings.ticket_support_role_id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
    });
  }

  const channelName = `ticket-${interaction.user.username}`.toLowerCase().slice(0, 90);

  const channel = await interaction.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: settings.ticket_category_id || undefined,
    permissionOverwrites: overwrites,
  });

  createTicket(interaction.guild.id, channel.id, interaction.user.id);

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Close Ticket').setStyle(ButtonStyle.Danger),
  );

  const embed = new EmbedBuilder()
    .setTitle('🎫 Support Ticket')
    .setColor(0x3498db)
    .setDescription(`Hi ${interaction.user}, a member of our team will be with you shortly. Describe your issue below.`);

  await channel.send({
    content: settings.ticket_support_role_id ? `<@&${settings.ticket_support_role_id}>` : undefined,
    embeds: [embed],
    components: [closeRow],
    allowedMentions: { roles: settings.ticket_support_role_id ? [settings.ticket_support_role_id] : [] },
  });

  return interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
}

async function closeTicketButton(interaction) {
  const ticket = getTicketByChannel(interaction.channel.id);
  if (!ticket || ticket.status !== 'open') {
    return interaction.reply({ content: 'This channel is not an open ticket.', ephemeral: true });
  }

  closeTicket(interaction.channel.id);
  await interaction.reply('🔒 Closing this ticket in 5 seconds...');
  setTimeout(() => {
    interaction.channel.delete().catch(() => {});
  }, 5000).unref();
}

module.exports = { openTicket, closeTicketButton };
