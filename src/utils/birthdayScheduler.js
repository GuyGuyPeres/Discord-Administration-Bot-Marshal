const { AttachmentBuilder } = require('discord.js');
const { getBirthdaysForToday, markAnnounced } = require('../database/birthdays');
const { getGuildSettings } = require('../database/guildSettings');
const { buildBirthdayCard } = require('./birthdayCard');

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly; the per-year guard prevents duplicate announcements

async function announceBirthday(client, entry, year) {
  markAnnounced(entry.guild_id, entry.user_id, year);

  const settings = getGuildSettings(entry.guild_id);
  if (!settings.birthday_channel_id) return;

  const channel = await client.channels.fetch(settings.birthday_channel_id).catch(() => null);
  if (!channel) return;

  const member = await channel.guild.members.fetch(entry.user_id).catch(() => null);
  if (!member) return;

  try {
    const imageBuffer = await buildBirthdayCard(member.user);
    const attachment = new AttachmentBuilder(imageBuffer, { name: 'birthday.png' });
    await channel.send({ content: `🎉 Everyone wish ${member} a happy birthday! 🎂`, files: [attachment] });
  } catch (error) {
    console.error('Failed to send birthday card:', error);
    await channel.send(`🎉 Happy Birthday, ${member}! 🎂`).catch(() => {});
  }
}

async function checkBirthdays(client) {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const year = now.getUTCFullYear();

  const entries = getBirthdaysForToday(month, day, year);
  for (const entry of entries) {
    try {
      await announceBirthday(client, entry, year);
    } catch (error) {
      console.error(`Failed to announce birthday for user ${entry.user_id}:`, error);
    }
  }
}

function safeCheck(client) {
  checkBirthdays(client).catch((error) => console.error('Birthday scheduler error:', error));
}

function startBirthdayScheduler(client) {
  safeCheck(client);
  setInterval(() => safeCheck(client), CHECK_INTERVAL_MS).unref();
}

module.exports = { startBirthdayScheduler };
