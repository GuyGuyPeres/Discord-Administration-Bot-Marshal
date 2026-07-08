const { Events } = require('discord.js');
const { startReminderScheduler } = require('../utils/reminderScheduler');
const { startGiveawayScheduler } = require('../utils/giveawayScheduler');
const { startBirthdayScheduler } = require('../utils/birthdayScheduler');
const { startAlertScheduler } = require('../utils/alertScheduler');
const { startHeartbeatMonitor } = require('../utils/heartbeat');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
    startReminderScheduler(client);
    startGiveawayScheduler(client);
    startBirthdayScheduler(client);
    startAlertScheduler(client);
    startHeartbeatMonitor(client);
  },
};
