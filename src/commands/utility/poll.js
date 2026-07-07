const { SlashCommandBuilder } = require('discord.js');

const OPTION_COUNT = 5;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption((opt) => opt.setName('question').setDescription('The poll question').setRequired(true).setMaxLength(300))
    .addStringOption((opt) => opt.setName('option1').setDescription('Option 1').setRequired(true).setMaxLength(55))
    .addStringOption((opt) => opt.setName('option2').setDescription('Option 2').setRequired(true).setMaxLength(55))
    .addStringOption((opt) => opt.setName('option3').setDescription('Option 3').setMaxLength(55))
    .addStringOption((opt) => opt.setName('option4').setDescription('Option 4').setMaxLength(55))
    .addStringOption((opt) => opt.setName('option5').setDescription('Option 5').setMaxLength(55))
    .addIntegerOption((opt) =>
      opt.setName('duration_hours').setDescription('How long the poll runs, in hours (default 24)').setMinValue(1).setMaxValue(768),
    )
    .addBooleanOption((opt) => opt.setName('multiselect').setDescription('Allow selecting multiple options')),
  async execute(interaction) {
    const question = interaction.options.getString('question', true);
    const options = Array.from({ length: OPTION_COUNT }, (_, i) => interaction.options.getString(`option${i + 1}`)).filter(
      Boolean,
    );
    const duration = interaction.options.getInteger('duration_hours') ?? 24;
    const multiselect = interaction.options.getBoolean('multiselect') ?? false;

    await interaction.reply({
      poll: {
        question: { text: question },
        answers: options.map((text) => ({ text })),
        duration,
        allowMultiselect: multiselect,
      },
    });
  },
};
