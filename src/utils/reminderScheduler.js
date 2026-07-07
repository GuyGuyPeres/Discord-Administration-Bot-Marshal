const { getDueReminders, deleteReminder } = require('../database/reminders');

const CHECK_INTERVAL_MS = 30_000;

async function checkReminders(client) {
  const due = getDueReminders(Math.floor(Date.now() / 1000));
  for (const reminder of due) {
    deleteReminder(reminder.id);

    const channel = await client.channels.fetch(reminder.channel_id).catch(() => null);
    if (!channel) continue;

    await channel
      .send({
        content: `⏰ <@${reminder.user_id}>, you asked me to remind you: ${reminder.message}`,
        allowedMentions: { users: [reminder.user_id] },
      })
      .catch(() => {});
  }
}

function startReminderScheduler(client) {
  checkReminders(client);
  setInterval(() => checkReminders(client), CHECK_INTERVAL_MS).unref();
}

module.exports = { startReminderScheduler };
