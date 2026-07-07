const fs = require('node:fs');
const path = require('node:path');

const HEARTBEAT_PATH = path.join(__dirname, '..', '..', 'data', '.heartbeat');
const CHECK_INTERVAL_MS = 60_000;
const MAX_UNREADY_CHECKS = 3; // ~3 minutes disconnected before we force a restart

// Discord.js reconnects on its own for normal blips. This is a last-resort net:
// if the client stays unready for too long, exit so the process manager
// (Docker's `restart: unless-stopped`, or pm2) can bring up a fresh process.
function startHeartbeatMonitor(client) {
  let unreadyStreak = 0;

  setInterval(() => {
    if (client.isReady()) {
      unreadyStreak = 0;
      fs.writeFile(HEARTBEAT_PATH, String(Date.now()), () => {});
      return;
    }

    unreadyStreak += 1;
    console.warn(`Heartbeat check: client not ready (${unreadyStreak}/${MAX_UNREADY_CHECKS}).`);

    if (unreadyStreak >= MAX_UNREADY_CHECKS) {
      console.error('Client has been disconnected too long. Exiting so the process manager can restart it.');
      process.exit(1);
    }
  }, CHECK_INTERVAL_MS).unref();
}

module.exports = { startHeartbeatMonitor, HEARTBEAT_PATH };
