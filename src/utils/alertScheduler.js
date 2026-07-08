const { EmbedBuilder } = require('discord.js');
const { getActiveAlertConfigs } = require('../database/alerts');
const { getActiveAlerts } = require('./pikudHaoref');

// Matches the polling interval used in the pikud-haoref-api library's own examples.
const POLL_INTERVAL_MS = 5000;
const ERROR_LOG_THROTTLE_MS = 5 * 60 * 1000;

const ALERT_TYPE_INFO = {
  missiles: { label: 'Rocket & Missile Fire', emoji: '🚀', color: 0xe53935 },
  hostileAircraftIntrusion: { label: 'Hostile Aircraft Intrusion', emoji: '🛩️', color: 0xe53935 },
  earthQuake: { label: 'Earthquake', emoji: '🌍', color: 0xe67e22 },
  tsunami: { label: 'Tsunami', emoji: '🌊', color: 0xe67e22 },
  radiologicalEvent: { label: 'Radiological Event', emoji: '☢️', color: 0xe53935 },
  hazardousMaterials: { label: 'Hazardous Materials', emoji: '☣️', color: 0xe53935 },
  terroristInfiltration: { label: 'Terrorist Infiltration', emoji: '🔫', color: 0xe53935 },
  newsFlash: { label: 'News Flash', emoji: '📢', color: 0x3498db },
  general: { label: 'General Alert', emoji: '⚠️', color: 0xe67e22 },
  unknown: { label: 'Alert', emoji: '⚠️', color: 0x95a5a6 },
};

function describeAlertType(type) {
  if (ALERT_TYPE_INFO[type]) return ALERT_TYPE_INFO[type];
  if (type && type.endsWith('Drill')) {
    const base = ALERT_TYPE_INFO[type.slice(0, -'Drill'.length)] || ALERT_TYPE_INFO.unknown;
    return { label: `Drill: ${base.label}`, emoji: '🎯', color: 0x95a5a6 };
  }
  return ALERT_TYPE_INFO.unknown;
}

function alertKey(alert) {
  if (alert.id) return alert.id;
  return `${alert.type}:${[...alert.cities].sort().join(',')}:${alert.instructions || ''}`;
}

function buildAlertEmbed(alert) {
  const info = describeAlertType(alert.type);
  const embed = new EmbedBuilder()
    .setTitle(`${info.emoji} ${info.label}`)
    .setColor(info.color)
    .addFields({ name: 'Areas', value: alert.cities.join('\n') || 'Unknown' })
    .setTimestamp()
    .setFooter({ text: 'Data via Pikud Haoref API by eladnava - github.com/eladnava/pikud-haoref-api' });

  if (alert.instructions) {
    embed.addFields({ name: 'Instructions', value: alert.instructions });
  }

  return embed;
}

function matchesCityFilter(alert, cityFilters) {
  if (!cityFilters || cityFilters.length === 0) return true;
  return alert.cities.some((city) => cityFilters.some((filter) => city.includes(filter)));
}

async function broadcastAlert(client, alert, configs) {
  const embed = buildAlertEmbed(alert);

  for (const config of configs) {
    if (!matchesCityFilter(alert, config.cities)) continue;

    const channel = await client.channels.fetch(config.channel_id).catch(() => null);
    if (!channel) continue;

    await channel
      .send({
        content: config.role_id ? `<@&${config.role_id}>` : undefined,
        embeds: [embed],
        allowedMentions: config.role_id ? { roles: [config.role_id] } : undefined,
      })
      .catch((error) => console.error(`Failed to send alert to guild ${config.guild_id}:`, error));
  }
}

let previousActiveKeys = new Set();
let lastErrorLogAt = 0;

async function checkAlerts(client) {
  const alerts = await getActiveAlerts();
  const currentKeys = new Set(alerts.map(alertKey));
  const newAlerts = alerts.filter((alert) => !previousActiveKeys.has(alertKey(alert)));

  if (newAlerts.length > 0) {
    const configs = getActiveAlertConfigs();
    for (const alert of newAlerts) {
      await broadcastAlert(client, alert, configs);
    }
  }

  previousActiveKeys = currentKeys;
}

function safeCheck(client) {
  checkAlerts(client).catch((error) => {
    const now = Date.now();
    if (now - lastErrorLogAt > ERROR_LOG_THROTTLE_MS) {
      lastErrorLogAt = now;
      console.error('Alert scheduler error (will keep retrying silently):', error);
    }
  });
}

function startAlertScheduler(client) {
  safeCheck(client);
  setInterval(() => safeCheck(client), POLL_INTERVAL_MS).unref();
}

module.exports = { startAlertScheduler, buildAlertEmbed };
