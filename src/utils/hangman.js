const { EmbedBuilder } = require('discord.js');
const words = require('../data/hangmanWords');

const STAGES = [
  '```\n  +---+\n      |\n      |\n      |\n     ===```',
  '```\n  +---+\n  O   |\n      |\n      |\n     ===```',
  '```\n  +---+\n  O   |\n  |   |\n      |\n     ===```',
  '```\n  +---+\n  O   |\n /|   |\n      |\n     ===```',
  '```\n  +---+\n  O   |\n /|\\  |\n      |\n     ===```',
  '```\n  +---+\n  O   |\n /|\\  |\n /    |\n     ===```',
  '```\n  +---+\n  O   |\n /|\\  |\n / \\  |\n     ===```',
];
const MAX_WRONG = STAGES.length - 1;

const activeGames = new Map(); // channelId -> { word, guessed: Set, wrong: Set, message }

function renderMasked(word, guessed) {
  return word
    .split('')
    .map((ch) => (guessed.has(ch) ? ch : '_'))
    .join(' ');
}

function buildEmbed(game, statusText) {
  return new EmbedBuilder()
    .setTitle('🎪 Hangman')
    .setColor(0xe67e22)
    .setDescription(`${STAGES[game.wrong.size]}\n\n**${renderMasked(game.word, game.guessed)}**`)
    .addFields({ name: 'Wrong guesses', value: game.wrong.size > 0 ? [...game.wrong].join(', ') : 'None' })
    .setFooter({ text: statusText ?? 'Type a single letter in this channel to guess!' });
}

async function startHangman(interaction) {
  if (activeGames.has(interaction.channel.id)) {
    return interaction.reply({ content: 'A hangman game is already in progress in this channel.', ephemeral: true });
  }

  const word = words[Math.floor(Math.random() * words.length)];
  const game = { word, guessed: new Set(), wrong: new Set() };
  activeGames.set(interaction.channel.id, game);

  await interaction.reply({ embeds: [buildEmbed(game)] });
  game.message = await interaction.fetchReply();
}

async function processGuess(message) {
  const game = activeGames.get(message.channel.id);
  if (!game) return;

  const letter = message.content.toLowerCase();
  if (!/^[a-z]$/.test(letter)) return;
  if (game.guessed.has(letter) || game.wrong.has(letter)) return;

  if (game.word.includes(letter)) {
    game.guessed.add(letter);
  } else {
    game.wrong.add(letter);
  }

  const won = game.word.split('').every((ch) => game.guessed.has(ch));
  const lost = game.wrong.size >= MAX_WRONG;

  if (won || lost) {
    activeGames.delete(message.channel.id);
    const statusText = won ? `🎉 Solved it! The word was "${game.word}".` : `💀 Game over! The word was "${game.word}".`;
    await game.message?.edit({ embeds: [buildEmbed(game, statusText)] }).catch(() => {});
    return;
  }

  await game.message?.edit({ embeds: [buildEmbed(game)] }).catch(() => {});
}

module.exports = { startHangman, processGuess };
