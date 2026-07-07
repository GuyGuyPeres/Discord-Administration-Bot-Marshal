const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Roll a dice')
    .addIntegerOption((opt) => opt.setName('sides').setDescription('Number of sides (default 6)').setMinValue(2).setMaxValue(1000)),
  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') ?? 6;
    const result = Math.floor(Math.random() * sides) + 1;
    await interaction.reply(`🎲 You rolled a **${result}** (out of ${sides}).`);
  },
};
