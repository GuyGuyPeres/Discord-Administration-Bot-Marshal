const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const {
  getAlertsConfig,
  setAlertsEnabled,
  setAlertsChannel,
  setAlertsRole,
  setAlertsCities,
} = require('../../database/alerts');
const { buildAlertEmbed } = require('../../utils/alertScheduler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('alerts')
    .setDescription('Configure real-time Home Front Command (Pikud Haoref) alert broadcasting')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('toggle')
        .setDescription('Enable or disable alert broadcasting')
        .addBooleanOption((opt) => opt.setName('enabled').setDescription('Enabled?').setRequired(true)),
    )
    .addSubcommand((sub) =>
      sub
        .setName('channel')
        .setDescription('Set the channel where alerts are posted')
        .addChannelOption((opt) =>
          opt
            .setName('channel')
            .setDescription('The alerts channel')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('role')
        .setDescription('Set (or clear) a role to ping on every alert')
        .addRoleOption((opt) => opt.setName('role').setDescription('Role to ping (omit to clear)').setRequired(false)),
    )
    .addSubcommand((sub) =>
      sub
        .setName('cities')
        .setDescription('Filter alerts to specific areas (omit / "all" to receive every alert nationwide)')
        .addStringOption((opt) =>
          opt
            .setName('list')
            .setDescription('Comma-separated area names in Hebrew, e.g. תל אביב,חיפה - or "all" to clear the filter')
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) => sub.setName('status').setDescription('View current alert settings'))
    .addSubcommand((sub) => sub.setName('test').setDescription('Send a sample alert to verify your setup')),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();

    if (sub === 'toggle') {
      const enabled = interaction.options.getBoolean('enabled', true);
      setAlertsEnabled(guildId, enabled);
      return interaction.reply(`Alert broadcasting is now **${enabled ? 'enabled' : 'disabled'}**.`);
    }

    if (sub === 'channel') {
      const channel = interaction.options.getChannel('channel', true);
      setAlertsChannel(guildId, channel.id);
      return interaction.reply(`Home Front Command alerts will now be posted in ${channel}.`);
    }

    if (sub === 'role') {
      const role = interaction.options.getRole('role');
      if (role && role.id === guildId) {
        return interaction.reply({
          content: 'You can\'t set @everyone as the alert ping role - that would mass-ping the whole server on every alert. Pick a specific role instead.',
          ephemeral: true,
        });
      }
      setAlertsRole(guildId, role ? role.id : null);
      return interaction.reply(role ? `**${role.name}** will now be pinged on every alert.` : 'Alert role ping cleared.');
    }

    if (sub === 'cities') {
      const raw = interaction.options.getString('list', true).trim();
      const cities = raw.toLowerCase() === 'all' ? [] : raw.split(',').map((c) => c.trim()).filter(Boolean);
      setAlertsCities(guildId, cities);
      return interaction.reply(
        cities.length > 0
          ? `Alerts will now be filtered to areas matching: ${cities.map((c) => `\`${c}\``).join(', ')}.`
          : 'Alert area filter cleared - all nationwide alerts will be posted.',
      );
    }

    if (sub === 'status') {
      const config = getAlertsConfig(guildId);
      const embed = new EmbedBuilder()
        .setTitle('Alert Settings')
        .setColor(0xe53935)
        .addFields(
          { name: 'Enabled', value: config.enabled ? 'Yes' : 'No', inline: true },
          { name: 'Channel', value: config.channel_id ? `<#${config.channel_id}>` : 'Not set', inline: true },
          { name: 'Ping Role', value: config.role_id ? `<@&${config.role_id}>` : 'None', inline: true },
          { name: 'Area Filter', value: config.cities.length > 0 ? config.cities.join(', ') : 'All of Israel' },
        )
        .setFooter({ text: 'Data via Pikud Haoref API by eladnava - github.com/eladnava/pikud-haoref-api' });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'test') {
      const config = getAlertsConfig(guildId);
      if (!config.channel_id) {
        return interaction.reply({ content: 'Set an alerts channel first with `/alerts channel`.', ephemeral: true });
      }

      const channel = await interaction.guild.channels.fetch(config.channel_id).catch(() => null);
      if (!channel) {
        return interaction.reply({ content: 'The configured alerts channel no longer exists.', ephemeral: true });
      }

      const testAlert = {
        type: 'missiles',
        cities: ['בדיקה - התרעה לדוגמה'],
        instructions: 'זוהי הודעת בדיקה בלבד - אין צורך לנקוט פעולה.',
      };

      await channel.send({
        content: config.role_id ? `<@&${config.role_id}> (test)` : '**(test)**',
        embeds: [buildAlertEmbed(testAlert)],
        allowedMentions: config.role_id ? { roles: [config.role_id] } : undefined,
      });

      return interaction.reply({ content: `Test alert sent to ${channel}.`, ephemeral: true });
    }
  },
};
