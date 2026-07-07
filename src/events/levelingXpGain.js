const { Events } = require('discord.js');
const { addXp } = require('../database/levels');

const XP_COOLDOWN_MS = 60_000;
const MIN_XP = 15;
const MAX_XP = 25;

const lastXpAt = new Map(); // `${guildId}:${userId}` -> timestamp

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (!message.guild || message.author.bot) return;

    const key = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    if (lastXpAt.get(key) && now - lastXpAt.get(key) < XP_COOLDOWN_MS) return;
    lastXpAt.set(key, now);

    const amount = Math.floor(Math.random() * (MAX_XP - MIN_XP + 1)) + MIN_XP;
    const { level, leveledUp } = addXp(message.guild.id, message.author.id, amount);

    if (leveledUp) {
      await message.channel
        .send(`🎉 ${message.author} just reached **level ${level}**!`)
        .catch(() => {});
    }
  },
};
