const { EmbedBuilder } = require('discord.js');
const { getGuildSettings } = require('../database/guildSettings');
const { getStarboardPost, upsertStarboardPost } = require('../database/starboard');

const STAR_EMOJI = '⭐';

async function handleStarReaction(reaction, user) {
  if (user.bot) return;
  if (reaction.emoji.name !== STAR_EMOJI) return;

  if (reaction.partial) {
    reaction = await reaction.fetch().catch(() => null);
    if (!reaction) return;
  }

  const message = reaction.message.partial ? await reaction.message.fetch().catch(() => null) : reaction.message;
  if (!message || !message.guild) return;

  const settings = getGuildSettings(message.guild.id);
  if (!settings.starboard_channel_id || message.channel.id === settings.starboard_channel_id) return;

  const starCount = reaction.count ?? 0;
  const existing = getStarboardPost(message.guild.id, message.id);

  if (starCount < settings.starboard_threshold && !existing) return;

  const starboardChannel = await message.guild.channels.fetch(settings.starboard_channel_id).catch(() => null);
  if (!starboardChannel) return;

  const embed = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
    .setDescription(message.content || '*No text content*')
    .addFields({ name: 'Source', value: `[Jump to message](${message.url})` })
    .setTimestamp(message.createdAt);

  const firstImage = message.attachments.find((a) => a.contentType?.startsWith('image/'));
  if (firstImage) embed.setImage(firstImage.url);

  const content = `⭐ **${starCount}** | ${message.channel}`;

  if (existing) {
    const starboardMessage = await starboardChannel.messages.fetch(existing.starboard_message_id).catch(() => null);
    if (starboardMessage) {
      await starboardMessage.edit({ content, embeds: [embed] }).catch(() => {});
      return;
    }
  }

  const posted = await starboardChannel.send({ content, embeds: [embed] }).catch(() => null);
  if (posted) upsertStarboardPost(message.guild.id, message.id, posted.id);
}

module.exports = { handleStarReaction };
