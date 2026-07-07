const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const {
  setModLogChannel,
  setWelcomeChannel,
  setWelcomeMessage,
  setBirthdayChannel,
  setTicketCategory,
  setTicketSupportRole,
  setStarboardChannel,
  setStarboardThreshold,
  setModuleEnabled,
} = require('../../database/guildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configure server logging and welcome messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommandGroup((group) =>
      group
        .setName('logs')
        .setDescription('Server logging settings')
        .addSubcommand((sub) =>
          sub
            .setName('channel')
            .setDescription('Set the channel where server logs are posted')
            .addChannelOption((opt) =>
              opt
                .setName('channel')
                .setDescription('The log channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true),
            ),
        ),
    )
    .addSubcommandGroup((group) =>
      group
        .setName('welcome')
        .setDescription('Welcome message settings')
        .addSubcommand((sub) =>
          sub
            .setName('channel')
            .setDescription('Set the channel where welcome messages are posted')
            .addChannelOption((opt) =>
              opt
                .setName('channel')
                .setDescription('The welcome channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true),
            ),
        )
        .addSubcommand((sub) =>
          sub
            .setName('message')
            .setDescription('Set the welcome message text ({user} and {server} are replaced)')
            .addStringOption((opt) =>
              opt.setName('text').setDescription('e.g. Welcome to {server}, {user}!').setRequired(true),
            ),
        ),
    )
    .addSubcommandGroup((group) =>
      group
        .setName('birthday')
        .setDescription('Birthday announcement settings')
        .addSubcommand((sub) =>
          sub
            .setName('channel')
            .setDescription('Set the channel where birthday announcements are posted')
            .addChannelOption((opt) =>
              opt
                .setName('channel')
                .setDescription('The birthday channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true),
            ),
        ),
    )
    .addSubcommandGroup((group) =>
      group
        .setName('ticket')
        .setDescription('Ticket system settings')
        .addSubcommand((sub) =>
          sub
            .setName('category')
            .setDescription('Set the category ticket channels are created under')
            .addChannelOption((opt) =>
              opt
                .setName('category')
                .setDescription('The category')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true),
            ),
        )
        .addSubcommand((sub) =>
          sub
            .setName('supportrole')
            .setDescription('Set the role that can see and help with tickets')
            .addRoleOption((opt) => opt.setName('role').setDescription('The support role').setRequired(true)),
        ),
    )
    .addSubcommandGroup((group) =>
      group
        .setName('modules')
        .setDescription('Enable or disable bot modules')
        .addSubcommand((sub) =>
          sub
            .setName('toggle')
            .setDescription('Enable or disable a module')
            .addStringOption((opt) =>
              opt
                .setName('module')
                .setDescription('The module to toggle')
                .setRequired(true)
                .addChoices(
                  { name: 'Moderation', value: 'moderation' },
                  { name: 'Utility', value: 'utility' },
                  { name: 'Engagement', value: 'engagement' },
                ),
            )
            .addBooleanOption((opt) =>
              opt.setName('enabled').setDescription('Enable or disable the module').setRequired(true),
            ),
        ),
    ),
  async execute(interaction) {
    const group = interaction.options.getSubcommandGroup();
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (group === 'logs' && sub === 'channel') {
      const channel = interaction.options.getChannel('channel', true);
      setModLogChannel(guildId, channel.id);
      return interaction.reply(`Server logs will now be posted in ${channel}.`);
    }

    if (group === 'welcome' && sub === 'channel') {
      const channel = interaction.options.getChannel('channel', true);
      setWelcomeChannel(guildId, channel.id);
      return interaction.reply(`Welcome messages will now be posted in ${channel}.`);
    }

    if (group === 'welcome' && sub === 'message') {
      const text = interaction.options.getString('text', true);
      setWelcomeMessage(guildId, text);
      return interaction.reply(`Welcome message updated to:\n> ${text}`);
    }

    if (group === 'birthday' && sub === 'channel') {
      const channel = interaction.options.getChannel('channel', true);
      setBirthdayChannel(guildId, channel.id);
      return interaction.reply(`Birthday announcements will now be posted in ${channel}.`);
    }

    if (group === 'ticket' && sub === 'category') {
      const category = interaction.options.getChannel('category', true);
      setTicketCategory(guildId, category.id);
      return interaction.reply(`New tickets will now be created under **${category.name}**.`);
    }

    if (group === 'ticket' && sub === 'supportrole') {
      const role = interaction.options.getRole('role', true);
      setTicketSupportRole(guildId, role.id);
      return interaction.reply(`**${role.name}** will now be able to see and help with tickets.`);
    }

    if (group === 'modules' && sub === 'toggle') {
      const moduleName = interaction.options.getString('module', true);
      const enabled = interaction.options.getBoolean('enabled', true);
      setModuleEnabled(guildId, moduleName, enabled);
      return interaction.reply(`The **${moduleName}** module is now **${enabled ? 'enabled' : 'disabled'}**.`);
    }
  },
};
