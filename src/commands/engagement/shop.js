const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { addItem, listItems, getItem, removeItem } = require('../../database/shop');
const { getBalance, addBalance } = require('../../database/economy');

function requireManageGuild(interaction) {
  return interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Browse and buy items with your coins')
    .addSubcommand((sub) => sub.setName('list').setDescription('List items available in the shop'))
    .addSubcommand((sub) =>
      sub
        .setName('buy')
        .setDescription('Buy an item from the shop')
        .addIntegerOption((opt) => opt.setName('item_id').setDescription('The item ID').setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('[Manage Server] Add an item to the shop')
        .addStringOption((opt) => opt.setName('name').setDescription('Item name').setRequired(true).setMaxLength(100))
        .addIntegerOption((opt) => opt.setName('price').setDescription('Price in coins').setRequired(true).setMinValue(1))
        .addRoleOption((opt) => opt.setName('role').setDescription('Role granted on purchase (optional)')),
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('[Manage Server] Remove an item from the shop')
        .addIntegerOption((opt) => opt.setName('item_id').setDescription('The item ID').setRequired(true)),
    ),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    if (sub === 'list') {
      const items = listItems(guildId);
      if (items.length === 0) {
        return interaction.reply({ content: 'The shop is empty.', ephemeral: true });
      }
      const embed = new EmbedBuilder()
        .setTitle('🛒 Shop')
        .setColor(0x00b894)
        .setDescription(
          items.map((item) => `\`#${item.id}\` **${item.name}** — ${item.price} coins${item.role_id ? ` (grants <@&${item.role_id}>)` : ''}`).join('\n'),
        );
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'buy') {
      const itemId = interaction.options.getInteger('item_id', true);
      const item = getItem(guildId, itemId);
      if (!item) {
        return interaction.reply({ content: 'No item found with that ID.', ephemeral: true });
      }

      const balance = getBalance(guildId, interaction.user.id);
      if (balance < item.price) {
        return interaction.reply({ content: `You need **${item.price}** coins but only have **${balance}**.`, ephemeral: true });
      }

      addBalance(guildId, interaction.user.id, -item.price);

      if (item.role_id) {
        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        await member?.roles.add(item.role_id).catch(() => {});
      }

      return interaction.reply(`✅ You bought **${item.name}** for **${item.price}** coins!`);
    }

    if (sub === 'add') {
      if (!requireManageGuild(interaction)) {
        return interaction.reply({ content: 'You need the Manage Server permission to do that.', ephemeral: true });
      }
      const name = interaction.options.getString('name', true);
      const price = interaction.options.getInteger('price', true);
      const role = interaction.options.getRole('role');
      const id = addItem(guildId, name, price, role?.id ?? null);
      return interaction.reply(`Added **${name}** (\`#${id}\`) to the shop for **${price}** coins.`);
    }

    if (sub === 'remove') {
      if (!requireManageGuild(interaction)) {
        return interaction.reply({ content: 'You need the Manage Server permission to do that.', ephemeral: true });
      }
      const itemId = interaction.options.getInteger('item_id', true);
      const removed = removeItem(guildId, itemId);
      return interaction.reply({
        content: removed ? `Removed item \`#${itemId}\`.` : 'No item found with that ID.',
        ephemeral: true,
      });
    }
  },
};
