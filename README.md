# Marshal-Bot

A free, open-source, multi-feature Discord bot covering administration, moderation, utility, engagement, and fun — built with [discord.js](https://discord.js.org/) v14 and SQLite.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)

## Features

### 🛡️ Administration
`/kick` `/ban` `/unban` `/timeout` `/untimeout` `/purge` `/slowmode` `/lock` `/unlock` `/nickname` `/role add|remove` `/config` (see [Configuration](#configuration))

### 🚨 Moderation & Safety
- `/warn`, `/warnings`, `/clearwarnings` — warning system with per-user case history
- `/automod` — filters banned words, invite links, mention spam, and excessive caps
- `/antiraid` — auto-detects join spikes and kicks new accounts during a suspected raid
- Full server logging (message edits/deletes, joins/leaves, role/nickname changes, bans) posted to a configurable log channel

### 🧰 Utility
- `/reactionrole add|remove|list` — self-assignable roles via message reactions
- `/customcommand add|remove|list` — auto-responders triggered by exact text match
- `/remind` — personal reminders that survive restarts
- `/poll` — native Discord polls
- `/giveaway` — timed giveaways with automatic winner selection
- `/birthday set|remove|next` — birthday tracking with a generated congratulations card, announced automatically
- `/ticket panel` — button-based private support ticket channels

### 📈 Engagement
- `/rank`, `/leaderboard` — message-based leveling/XP system
- `/balance`, `/daily`, `/pay`, `/shop list|buy|add|remove` — a virtual coin economy, including a shop that can grant roles
- Starboard — messages that cross a ⭐ threshold get cross-posted to a starboard channel
- `/suggest`, `/suggestion approve|deny` — a suggestion box with voting and mod resolution

### 🎉 Fun
- `/trivia` — button-based trivia with a coin reward for correct answers
- `/tictactoe` — full two-player Tic-Tac-Toe over buttons
- `/hangman` — classic hangman, guessed letter-by-letter in chat
- `/8ball`, `/joke`, `/coinflip`, `/roll`, `/meme`

Every module (Moderation, Utility, Engagement, Fun) can be toggled on/off per server — see [Configuration](#configuration). Administration is always available.

## Requirements

- [Node.js](https://nodejs.org/) 18 or later
- A Discord account and a registered [Discord Application](https://discord.com/developers/applications)

## Setup

1. **Clone and install dependencies**
   ```
   git clone https://github.com/GuyGuyPeres/Discord-Administartion-Bot.git
   cd Discord-Administartion-Bot
   npm install
   ```

2. **Create a Discord Application**
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**.
   - Under **Bot**, enable these **Privileged Gateway Intents**: `Server Members Intent` and `Message Content Intent` (required for moderation logging, leveling, automod, and custom commands). Copy the bot **Token**.
   - Under **General Information**, copy the **Application (Client) ID**.

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in the values:
   ```
   DISCORD_TOKEN=your-bot-token
   CLIENT_ID=your-application-id
   DEV_GUILD_ID=your-test-server-id   # optional, but registers commands instantly instead of waiting ~1hr for global sync
   ```

4. **Invite the bot to your server**

   Build an invite URL (replace `CLIENT_ID`):
   ```
   https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot%20applications.commands
   ```
   `permissions=8` is Administrator, the simplest option to get started. You can scope this down to only the permissions the commands you plan to use actually need.

5. **Register slash commands and start the bot**
   ```
   npm run deploy-commands
   npm start
   ```

## Configuration

Server admins configure the bot per-guild with `/config` (requires the **Manage Server** permission):

| Subcommand | Purpose |
|---|---|
| `/config logs channel` | Where moderation/server logs are posted |
| `/config welcome channel` / `message` | Welcome channel and message template (`{user}`, `{server}`) |
| `/config birthday channel` | Where birthday announcements are posted |
| `/config ticket category` / `supportrole` | Category new ticket channels are created under, and who can see them |
| `/config starboard channel` / `threshold` | Starboard channel and ⭐ count required |
| `/config suggestions channel` | Where `/suggest` posts go |
| `/config modules toggle` | Enable/disable the Moderation, Utility, Engagement, or Fun modules for this server |

## Tech Stack

- **[discord.js](https://discord.js.org/) v14** — Discord API wrapper
- **[better-sqlite3](https://github.com/WiseLibs/better-sqlite3)** — synchronous, embedded SQLite database (no external DB server needed; data is stored in `data/bot.sqlite`, created automatically)
- **[@napi-rs/canvas](https://github.com/Brooooooklyn/canvas)** — generates welcome/birthday card images without native build tools

## Project Structure

```
src/
  commands/<category>/   slash commands, grouped by module
  events/                 discord.js event listeners
  database/               SQLite schema + per-feature repositories
  utils/                  shared helpers (game logic, schedulers, error mapping, etc.)
  index.js                bot entry point
  deploy-commands.js      registers slash commands with Discord
```

## Contributing

Issues and pull requests are welcome. If you're adding a new command, follow the existing pattern: drop a file in the right `src/commands/<category>/` folder exporting `{ data, execute }`, and it's picked up automatically — no manual registration needed beyond running `npm run deploy-commands`.

## License

[MIT](LICENSE) — free to use, modify, and self-host.
