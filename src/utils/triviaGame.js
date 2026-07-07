const crypto = require('node:crypto');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const questions = require('../data/triviaQuestions');
const { addBalance } = require('../database/economy');

const ANSWER_TIME_MS = 20_000;
const CORRECT_REWARD = 20;
const LETTERS = ['A', 'B', 'C', 'D'];

const sessions = new Map(); // sessionId -> { question, userId, answered, message }

function buildRow(sessionId, disabled, correctIndex) {
  const row = new ActionRowBuilder();
  for (let i = 0; i < 4; i++) {
    const button = new ButtonBuilder()
      .setCustomId(`trivia:${sessionId}:${i}`)
      .setLabel(LETTERS[i])
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled);
    if (disabled && correctIndex === i) button.setStyle(ButtonStyle.Success);
    row.addComponents(button);
  }
  return row;
}

async function startTrivia(interaction) {
  const question = questions[Math.floor(Math.random() * questions.length)];
  const sessionId = crypto.randomUUID();

  const embed = new EmbedBuilder()
    .setTitle('🧠 Trivia Time!')
    .setColor(0x9b59b6)
    .setDescription(question.question)
    .addFields(question.choices.map((choice, i) => ({ name: LETTERS[i], value: choice, inline: true })))
    .setFooter({ text: `You have ${ANSWER_TIME_MS / 1000} seconds — correct answers earn ${CORRECT_REWARD} coins!` });

  await interaction.reply({ embeds: [embed], components: [buildRow(sessionId, false)] });
  const message = await interaction.fetchReply();

  const session = { question, userId: interaction.user.id, answered: false, message };
  sessions.set(sessionId, session);

  setTimeout(async () => {
    if (session.answered) return;
    session.answered = true;
    sessions.delete(sessionId);
    await message
      .edit({
        embeds: [embed.setFooter({ text: `Time's up! The correct answer was ${LETTERS[question.answerIndex]}.` })],
        components: [buildRow(sessionId, true, question.answerIndex)],
      })
      .catch(() => {});
  }, ANSWER_TIME_MS).unref();
}

async function handleTriviaButton(interaction) {
  const [, sessionId, choiceIndexStr] = interaction.customId.split(':');
  const session = sessions.get(sessionId);

  if (!session) {
    return interaction.reply({ content: 'This trivia question has expired.', ephemeral: true });
  }
  if (interaction.user.id !== session.userId) {
    return interaction.reply({ content: "This isn't your trivia question!", ephemeral: true });
  }
  if (session.answered) return;

  session.answered = true;
  sessions.delete(sessionId);

  const choiceIndex = Number(choiceIndexStr);
  const correct = choiceIndex === session.question.answerIndex;

  if (correct) {
    addBalance(interaction.guild.id, interaction.user.id, CORRECT_REWARD);
  }

  const embed = EmbedBuilder.from(interaction.message.embeds[0]).setFooter({
    text: correct
      ? `Correct! You earned ${CORRECT_REWARD} coins. 🎉`
      : `Incorrect — the correct answer was ${LETTERS[session.question.answerIndex]}.`,
  });

  await interaction.update({
    embeds: [embed],
    components: [buildRow(sessionId, true, session.question.answerIndex)],
  });
}

module.exports = { startTrivia, handleTriviaButton };
