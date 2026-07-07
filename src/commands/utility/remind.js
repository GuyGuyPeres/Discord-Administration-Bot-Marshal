const { SlashCommandBuilder } = require('discord.js');
const { addReminder } = require('../../database/reminders');

const UNIT_SECONDS = {
  minutes: 60,
  hours: 60 * 60,
  days: 24 * 60 * 60,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder')
    .addIntegerOption((opt) => opt.setName('amount').setDescription('How many').setRequired(true).setMinValue(1))
    .addStringOption((opt) =>
      opt
        .setName('unit')
        .setDescription('Time unit')
        .setRequired(true)
        .addChoices(
          { name: 'Minutes', value: 'minutes' },
          { name: 'Hours', value: 'hours' },
          { name: 'Days', value: 'days' },
        ),
    )
    .addStringOption((opt) =>
      opt.setName('message').setDescription('What to remind you about').setRequired(true).setMaxLength(500),
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount', true);
    const unit = interaction.options.getString('unit', true);
    const message = interaction.options.getString('message', true);

    const remindAt = Math.floor(Date.now() / 1000) + amount * UNIT_SECONDS[unit];

    addReminder(interaction.guild.id, interaction.channel.id, interaction.user.id, message, remindAt);

    await interaction.reply({
      content: `Got it — I'll remind you in ${amount} ${unit}: "${message}"`,
      ephemeral: true,
    });
  },
};
