const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addReactionRole, removeReactionRole, listReactionRoles } = require('../../database/reactionRoles');
const { emojiKeyFromRaw } = require('../../utils/emoji');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Manage reaction roles')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sub) =>
      sub
        .setName('add')
        .setDescription('Bind a role to an emoji on a message in this channel')
        .addStringOption((opt) => opt.setName('message_id').setDescription('The message ID').setRequired(true))
        .addStringOption((opt) => opt.setName('emoji').setDescription('The emoji to react with').setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription('The role to grant').setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a reaction role binding')
        .addStringOption((opt) => opt.setName('message_id').setDescription('The message ID').setRequired(true))
        .addStringOption((opt) => opt.setName('emoji').setDescription('The emoji').setRequired(true)),
    )
    .addSubcommand((sub) => sub.setName('list').setDescription('List reaction roles in this server')),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'add') {
      const messageId = interaction.options.getString('message_id', true);
      const emojiRaw = interaction.options.getString('emoji', true);
      const role = interaction.options.getRole('role', true);

      const message = await interaction.channel.messages.fetch(messageId).catch(() => null);
      if (!message) {
        return interaction.reply({ content: 'Could not find that message in this channel.', ephemeral: true });
      }
      if (role.position >= interaction.member.roles.highest.position) {
        return interaction.reply({
          content: 'You cannot bind a role equal to or higher than your own.',
          ephemeral: true,
        });
      }
      if (role.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply({
          content: 'I cannot assign a role equal to or higher than my own.',
          ephemeral: true,
        });
      }

      try {
        await message.react(emojiRaw);
      } catch {
        return interaction.reply({ content: "That emoji is invalid or I don't have access to it.", ephemeral: true });
      }

      addReactionRole(guildId, messageId, emojiKeyFromRaw(emojiRaw), role.id);
      return interaction.reply(`Reacting with ${emojiRaw} on that message will now grant **${role.name}**.`);
    }

    if (sub === 'remove') {
      const messageId = interaction.options.getString('message_id', true);
      const emojiRaw = interaction.options.getString('emoji', true);
      const removed = removeReactionRole(messageId, emojiKeyFromRaw(emojiRaw));
      return interaction.reply({
        content: removed ? 'Reaction role removed.' : 'No reaction role found for that message/emoji combination.',
        ephemeral: true,
      });
    }

    if (sub === 'list') {
      const rows = listReactionRoles(guildId);
      if (rows.length === 0) {
        return interaction.reply({ content: 'No reaction roles configured in this server.', ephemeral: true });
      }
      const description = rows.map((r) => `Message \`${r.message_id}\` - <@&${r.role_id}>`).join('\n');
      return interaction.reply({ content: description, ephemeral: true });
    }
  },
};
