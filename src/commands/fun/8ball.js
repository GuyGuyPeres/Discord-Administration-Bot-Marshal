const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const responses = require('../../data/magic8ballResponses');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8-ball a question')
    .addStringOption((opt) => opt.setName('question').setDescription('Your question').setRequired(true)),
  async execute(interaction) {
    const question = interaction.options.getString('question', true);
    const answer = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setTitle('🎱 Magic 8-Ball')
      .setColor(0x2c3e50)
      .addFields({ name: 'Question', value: question }, { name: 'Answer', value: answer });

    await interaction.reply({ embeds: [embed] });
  },
};
