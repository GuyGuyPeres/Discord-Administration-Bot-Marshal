const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { setBirthday, removeBirthday, listBirthdays } = require('../../database/birthdays');

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysUntil(month, day) {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  let next = new Date(Date.UTC(currentYear, month - 1, day));
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (next < today) {
    next = new Date(Date.UTC(currentYear + 1, month - 1, day));
  }
  return Math.round((next - today) / (1000 * 60 * 60 * 24));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Manage your birthday')
    .addSubcommand((sub) =>
      sub
        .setName('set')
        .setDescription('Set your birthday')
        .addIntegerOption((opt) => opt.setName('month').setDescription('Month (1-12)').setRequired(true).setMinValue(1).setMaxValue(12))
        .addIntegerOption((opt) => opt.setName('day').setDescription('Day').setRequired(true).setMinValue(1).setMaxValue(31)),
    )
    .addSubcommand((sub) => sub.setName('remove').setDescription('Remove your saved birthday'))
    .addSubcommand((sub) => sub.setName('next').setDescription('See the next upcoming birthdays in this server')),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    if (sub === 'set') {
      const month = interaction.options.getInteger('month', true);
      const day = interaction.options.getInteger('day', true);

      if (day > DAYS_IN_MONTH[month - 1]) {
        return interaction.reply({
          content: `${MONTH_NAMES[month - 1]} doesn't have ${day} days. Please check the date.`,
          ephemeral: true,
        });
      }

      setBirthday(guildId, interaction.user.id, month, day);
      return interaction.reply({
        content: `🎂 Got it! Your birthday is set to **${MONTH_NAMES[month - 1]} ${day}**.`,
        ephemeral: true,
      });
    }

    if (sub === 'remove') {
      const removed = removeBirthday(guildId, interaction.user.id);
      return interaction.reply({
        content: removed ? 'Your birthday has been removed.' : "You don't have a birthday saved.",
        ephemeral: true,
      });
    }

    if (sub === 'next') {
      const all = listBirthdays(guildId);
      if (all.length === 0) {
        return interaction.reply({ content: 'No birthdays saved in this server yet.', ephemeral: true });
      }

      const sorted = all
        .map((b) => ({ ...b, daysUntil: daysUntil(b.month, b.day) }))
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 10);

      const embed = new EmbedBuilder()
        .setTitle('🎂 Upcoming Birthdays')
        .setColor(0xe84393)
        .setDescription(
          sorted
            .map((b) => `<@${b.user_id}> — **${MONTH_NAMES[b.month - 1]} ${b.day}** (in ${b.daysUntil === 0 ? 'today!' : `${b.daysUntil}d`})`)
            .join('\n'),
        );

      return interaction.reply({ embeds: [embed] });
    }
  },
};
