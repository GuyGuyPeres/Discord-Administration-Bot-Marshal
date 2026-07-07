const { SlashCommandBuilder } = require('discord.js');
const { transfer } = require('../../database/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Send coins to another member')
    .addUserOption((opt) => opt.setName('user').setDescription('Who to pay').setRequired(true))
    .addIntegerOption((opt) => opt.setName('amount').setDescription('Amount to send').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: "You can't pay yourself.", ephemeral: true });
    }
    if (target.bot) {
      return interaction.reply({ content: "You can't pay a bot.", ephemeral: true });
    }

    const success = transfer(interaction.guild.id, interaction.user.id, target.id, amount);
    if (!success) {
      return interaction.reply({ content: "You don't have enough coins for that.", ephemeral: true });
    }

    await interaction.reply(`💸 ${interaction.user} sent **${amount}** coins to ${target}.`);
  },
};
