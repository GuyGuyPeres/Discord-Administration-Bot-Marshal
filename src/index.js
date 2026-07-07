require('dotenv').config({ quiet: true });
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

client.on(Events.Error, (error) => {
  console.error('Client error:', error);
});

const commandsPath = path.join(__dirname, 'commands');
for (const category of fs.readdirSync(commandsPath)) {
  const categoryPath = path.join(commandsPath, category);
  for (const file of fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'))) {
    const command = require(path.join(categoryPath, file));
    if (command?.data && command?.execute) {
      command.category = category;
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`[WARN] Command at ${category}/${file} is missing "data" or "execute".`);
    }
  }
}

function safeExecute(event, args) {
  Promise.resolve(event.execute(...args, client)).catch((error) => {
    console.error(`Unhandled error in event "${event.name}":`, error);
  });
}

const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => safeExecute(event, args));
  } else {
    client.on(event.name, (...args) => safeExecute(event, args));
  }
}

// Both handlers below exit deliberately: after an unhandled rejection or uncaught
// exception, process state is unreliable. It's safer to fail fast and let the
// process manager (Docker's `restart: unless-stopped`, or pm2) start a clean
// process than to keep running in an unknown state.
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

client.login(process.env.DISCORD_TOKEN);
