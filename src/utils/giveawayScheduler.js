const { EmbedBuilder } = require('discord.js');
const { getDueGiveaways, deleteGiveaway } = require('../database/giveaways');

const CHECK_INTERVAL_MS = 30_000;
const GIVEAWAY_EMOJI = '🎉';

function pickWinners(userIds, count) {
  const pool = [...userIds];
  const winners = [];
  while (pool.length > 0 && winners.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(index, 1)[0]);
  }
  return winners;
}

async function endGiveaway(client, giveaway) {
  deleteGiveaway(giveaway.id);

  const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
  if (!channel) return;

  const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
  if (!message) return;

  const reaction = message.reactions.cache.get(GIVEAWAY_EMOJI);
  const entrants = reaction ? await reaction.users.fetch().catch(() => null) : null;
  const entrantIds = entrants ? [...entrants.values()].filter((u) => !u.bot).map((u) => u.id) : [];

  const embed = new EmbedBuilder().setTitle('🎉 Giveaway Ended').setColor(0x9b59b6);

  if (entrantIds.length === 0) {
    embed.setDescription(`No one entered the giveaway for **${giveaway.prize}**.`);
  } else {
    const winners = pickWinners(entrantIds, giveaway.winner_count);
    embed.setDescription(
      `Congratulations ${winners.map((id) => `<@${id}>`).join(', ')}! You won **${giveaway.prize}**!`,
    );
  }

  await channel.send({ embeds: [embed] }).catch(() => {});
}

async function checkGiveaways(client) {
  const due = getDueGiveaways(Math.floor(Date.now() / 1000));
  for (const giveaway of due) {
    await endGiveaway(client, giveaway);
  }
}

function startGiveawayScheduler(client) {
  checkGiveaways(client);
  setInterval(() => checkGiveaways(client), CHECK_INTERVAL_MS).unref();
}

module.exports = { startGiveawayScheduler };
