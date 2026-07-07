const { Events, AttachmentBuilder } = require('discord.js');
const { getGuildSettings } = require('../database/guildSettings');
const { buildWelcomeCard } = require('../utils/welcomeCard');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const settings = getGuildSettings(member.guild.id);
    if (!settings.welcome_channel_id) return;

    const channel = member.guild.channels.cache.get(settings.welcome_channel_id);
    if (!channel) return;

    const text = (settings.welcome_message || 'Welcome to {server}, {user}!')
      .replaceAll('{user}', `${member}`)
      .replaceAll('{server}', member.guild.name);

    const allowedMentions = { users: [member.id] };

    try {
      const imageBuffer = await buildWelcomeCard(member);
      const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome.png' });
      await channel.send({ content: text, files: [attachment], allowedMentions });
    } catch (error) {
      console.error('Failed to send welcome message:', error);
      await channel.send({ content: text, allowedMentions }).catch(() => {});
    }
  },
};
