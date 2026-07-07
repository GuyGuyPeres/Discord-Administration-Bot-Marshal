const crypto = require('node:crypto');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const games = new Map(); // gameId -> { board, players: { X, O }, turn, finished }

function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every((cell) => cell) ? 'draw' : null;
}

function buildBoard(gameId, game) {
  const rows = [];
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 3; c++) {
      const i = r * 3 + c;
      const cell = game.board[i];
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ttt:${gameId}:${i}`)
          .setLabel(cell ?? '​')
          .setStyle(cell === 'X' ? ButtonStyle.Danger : cell === 'O' ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(Boolean(cell) || game.finished),
      );
    }
    rows.push(row);
  }
  return rows;
}

function statusEmbed(game) {
  const status = game.finished
    ? game.finished === 'draw'
      ? "It's a draw!"
      : `<@${game.players[game.finished]}> (${game.finished}) wins! 🎉`
    : `It's <@${game.players[game.turn]}>'s turn (${game.turn})`;

  return new EmbedBuilder().setTitle('⭕ Tic-Tac-Toe ❌').setColor(0x00cec9).setDescription(status);
}

async function startTicTacToe(interaction) {
  const opponent = interaction.options.getUser('opponent', true);

  if (opponent.id === interaction.user.id) {
    return interaction.reply({ content: "You can't play against yourself.", ephemeral: true });
  }
  if (opponent.bot) {
    return interaction.reply({ content: "You can't play against a bot.", ephemeral: true });
  }

  const gameId = crypto.randomUUID();
  const game = {
    board: Array(9).fill(null),
    players: { X: interaction.user.id, O: opponent.id },
    turn: 'X',
    finished: null,
  };
  games.set(gameId, game);

  await interaction.reply({
    content: `${interaction.user} vs ${opponent}`,
    embeds: [statusEmbed(game)],
    components: buildBoard(gameId, game),
  });
}

async function handleTicTacToeButton(interaction) {
  const [, gameId, cellStr] = interaction.customId.split(':');
  const game = games.get(gameId);

  if (!game || game.finished) {
    return interaction.reply({ content: 'This game has ended.', ephemeral: true });
  }

  const currentPlayerId = game.players[game.turn];
  if (interaction.user.id !== currentPlayerId) {
    return interaction.reply({ content: "It's not your turn.", ephemeral: true });
  }

  const cell = Number(cellStr);
  if (game.board[cell]) {
    return interaction.reply({ content: 'That cell is already taken.', ephemeral: true });
  }

  game.board[cell] = game.turn;
  const result = checkWinner(game.board);

  if (result) {
    game.finished = result;
    games.delete(gameId);
  } else {
    game.turn = game.turn === 'X' ? 'O' : 'X';
  }

  await interaction.update({ embeds: [statusEmbed(game)], components: buildBoard(gameId, game) });
}

module.exports = { startTicTacToe, handleTicTacToeButton };
