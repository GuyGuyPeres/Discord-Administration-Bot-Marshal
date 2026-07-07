<div align="center">

<img src="https://placehold.co/900x200/0d1117/ffffff?text=Marshal-Bot&font=montserrat" alt="Marshal-Bot banner" width="100%" />

# 🛡️ Marshal-Bot

### A free, open-source, all-in-one Discord bot - administration, moderation, utility, engagement, and fun in one install

![Node](https://img.shields.io/badge/node.js-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![SQLite](https://img.shields.io/badge/database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)

</div>

---

## 📖 Table of Contents

- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Usage](#-usage)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | ≥ 18 |
| Discord API wrapper | [discord.js](https://discord.js.org/) | ^14.26 |
| Database | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (embedded SQLite, no server required) | ^12.11 |
| Image generation | [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas) (prebuilt binaries, no native build tools) | ^1.0 |
| Config management | [dotenv](https://github.com/motdotla/dotenv) | ^17.4 |
| Command registration | Discord REST API (`discord.js` `REST` + `Routes`) | - |

---

## ✨ Key Features

- **Full administration toolkit** - `/kick`, `/ban`, `/unban`, `/timeout`, `/purge`, `/slowmode`, `/lock`/`unlock`, `/nickname`, and `/role add|remove`, each enforcing role-hierarchy and bot-permission checks before acting.
- **Automod & anti-raid** - filters banned words, invite links, mention spam, and excessive caps in real time; detects join-rate spikes and auto-kicks new accounts during a suspected raid.
- **Per-guild SQLite persistence** - every module (warnings, economy, levels, tickets, birthdays, etc.) reads/writes through a dedicated repository module in `src/database/`, with idempotent schema migrations so upgrades never lose data.
- **Per-guild module toggles** - server admins can independently enable/disable Moderation, Utility, Engagement, and Fun via `/config modules toggle`, enforced centrally in the interaction handler.
- **Generated image cards** - welcome messages and birthday announcements render a custom PNG card on the fly (avatar, gradient background, confetti) using `@napi-rs/canvas`, no external image API needed.
- **Interactive button-driven games** - Tic-Tac-Toe and Trivia run entirely on Discord message components with server-side game state, including win/draw detection and a coin-economy payout on correct trivia answers.
- **Centralized, secret-safe error handling** - every command and button interaction funnels through one error path that maps known Discord API failure codes to clean, professional messages and never leaks a stack trace or raw error to the user.
- **Crash-hardened event loop** - every event listener's promise is caught at the dispatch level, with `client.on('error')`, `unhandledRejection`, and `uncaughtException` handlers as a last line of defense, so a single bad interaction can't take the whole bot down.
- **Self-hosting first** - zero external services required: SQLite lives in a local file, Discord's native Poll API is used instead of a custom voting system, and the only network calls are to Discord's API and (optionally) the meme endpoint.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A [Discord account](https://discord.com/) and a registered [Discord Application](https://discord.com/developers/applications)
- `git` (to clone the repo)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GuyGuyPeres/Discord-Administartion-Bot.git
   cd Discord-Administartion-Bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a Discord Application**
   - Go to the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**.
   - Under **Bot**, enable **Server Members Intent** and **Message Content Intent** (required for moderation logging, leveling, automod, and custom commands), then copy the bot **Token**.
   - Under **General Information**, copy the **Application (Client) ID**.

4. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your values:
   ```env
   DISCORD_TOKEN=your-bot-token
   CLIENT_ID=your-application-id
   DEV_GUILD_ID=your-test-server-id
   ```

   > ⚠️ **Never commit your `.env` file.** It contains your bot's live token - treat it like a password. `.gitignore` already excludes it, but always double-check before pushing.

<details>
<summary>🩹 <strong>Troubleshooting</strong></summary>

| Symptom | Likely cause | Fix |
|---|---|---|
| `Used disallowed intents` on startup | Privileged intents not enabled in the portal | Enable **Server Members Intent** and **Message Content Intent** under the **Bot** tab |
| `Integration requires code grant` when inviting the bot | "Requires OAuth2 Code Grant" is enabled | Turn it off under the **Bot** tab, then reuse the invite link |
| Slash commands don't show up in Discord | Commands only registered globally (can take up to ~1 hour) | Set `DEV_GUILD_ID` in `.env` and re-run `npm run deploy-commands` for instant guild-scoped registration |
| `SQLITE_CANTOPEN` or missing `data/` folder | First run hasn't created the SQLite file yet | The bot creates `data/bot.sqlite` automatically on first launch - make sure the process has write access to the project folder |
| `DiscordAPIError: Missing Permissions` | The bot's role is below the target role, or lacks the permission | Move the bot's role higher in **Server Settings → Roles**, and re-check the invite's permission scope |
| `SqliteError: disk I/O error` / `SQLITE_IOERR_SHMOPEN` | Two bot processes (e.g. a local `npm start` and a Docker container) are both writing to the same `data/bot.sqlite` at once | Stop one of them - only ever run a single instance against the same `data/` folder |

</details>

### Run the App

1. Register slash commands (run again any time you add/change a command):
   ```bash
   npm run deploy-commands
   ```
2. Start the bot:
   ```bash
   npm start
   ```
   You should see `Logged in as <YourBot>#0000` in the console once it connects.

---

## 📦 Deployment

Marshal-Bot is self-healing at every layer: a crash-hardened event loop catches per-interaction errors without going down, a heartbeat watchdog force-restarts the process if it's ever disconnected from Discord for more than ~3 minutes, and both deployment options below auto-restart the process on exit.

### Option A: Plain Node + pm2 (no Docker)

[pm2](https://pm2.keymetrics.io/) keeps the bot running, restarts it if it crashes, and survives reboots.

```bash
npm install -g pm2
npm run pm2:start      # starts the bot via ecosystem.config.js
npm run pm2:logs       # tail logs
pm2 startup            # (optional) make pm2 itself survive a server reboot
pm2 save
```

### Option B: Docker

Everything Docker-related lives in [`docker/`](docker/). The image is a multi-stage build (compiles native dependencies like `better-sqlite3` in a builder stage, then ships a slim runtime image), and includes a `HEALTHCHECK` that reads the bot's heartbeat file.

```bash
docker compose -f docker/docker-compose.yml up -d --build
docker compose -f docker/docker-compose.yml logs -f   # tail logs
docker compose -f docker/docker-compose.yml down       # stop
```

The `data/` folder (SQLite database) is bind-mounted from the repo root, so it persists across container rebuilds. `restart: unless-stopped` in `docker/docker-compose.yml` means Docker restarts the container automatically if the process ever exits.

> ⚠️ Run the bot with **either** plain Node/pm2 **or** Docker at a time, not both simultaneously - two processes writing to the same SQLite file at once will corrupt its WAL state.

---

## 💡 Usage

Marshal-Bot is controlled entirely through Discord **slash commands** - there is no HTTP API. Type `/` in any server the bot is in to see the full, auto-completed command list.

#### Commands Overview

| Category | Command | Description |
|---|---|---|
| Administration | `/kick` | Kick a member |
| Administration | `/ban` | Ban a member, optionally deleting recent messages |
| Administration | `/unban` | Unban a user by ID |
| Administration | `/timeout` / `/untimeout` | Apply or remove a timed mute |
| Administration | `/purge` | Bulk-delete recent messages, optionally filtered by user |
| Administration | `/slowmode` | Set a channel's slowmode delay |
| Administration | `/lock` / `/unlock` | Prevent/allow `@everyone` from sending messages in a channel |
| Administration | `/nickname` | Change a member's nickname |
| Administration | `/role add\|remove` | Add or remove a role from a member |
| Administration | `/config` | Configure logs, welcome, birthday, ticket, starboard, suggestions channels and module toggles |
| Moderation | `/warn` / `/warnings` / `/clearwarnings` | Issue, view, or clear a member's warning history |
| Moderation | `/automod` | Configure banned words, invite blocking, mention/caps spam filters |
| Moderation | `/antiraid` | Configure join-rate raid detection and auto-kick |
| Utility | `/reactionrole add\|remove\|list` | Bind roles to message reactions |
| Utility | `/customcommand add\|remove\|list` | Add text auto-responders |
| Utility | `/remind` | Set a personal reminder |
| Utility | `/poll` | Create a native Discord poll |
| Utility | `/giveaway` | Start a timed giveaway with automatic winner selection |
| Utility | `/birthday set\|remove\|next` | Manage your birthday and view upcoming ones |
| Utility | `/ticket panel` | Post a button that opens private support ticket channels |
| Engagement | `/rank` / `/leaderboard` | View XP level/progress or the server leaderboard |
| Engagement | `/balance` / `/daily` / `/pay` | View coins, claim a daily reward, or send coins to another member |
| Engagement | `/shop list\|buy\|add\|remove` | Browse or manage the server's coin shop |
| Engagement | `/suggest` / `/suggestion approve\|deny` | Submit a suggestion or resolve one as staff |
| Fun | `/trivia` | Answer a trivia question for a coin reward |
| Fun | `/tictactoe` | Challenge another member to Tic-Tac-Toe |
| Fun | `/hangman` | Start a channel-wide hangman game |
| Fun | `/8ball` / `/joke` / `/coinflip` / `/roll` / `/meme` | Assorted fun commands |

#### Example: `/warn`

```
/warn user:@Someone reason:Spamming in #general
```

**Response**
```
**Someone#0001** has been warned. Reason: Spamming in #general (total warnings: 1)
```

#### Example: `/config modules toggle`

```
/config modules toggle module:Fun enabled:false
```

**Response**
```
The **fun** module is now **disabled**.
```

#### Example: `/rank`

```
/rank
```

**Response** - an embed showing current level, XP progress bar, and server-wide rank.

#### Error Responses

Errors never expose internal details (stack traces, database errors, etc.) - every failure is mapped to a clean, ephemeral message, for example:

```
I don't have permission to do that. Check my role's permissions and position and try again.
```

---

## 🏗 Architecture

#### Folder Structure

```text
.
├── 📁 docker/                  # Dockerfile + docker-compose.yml (see Deployment)
├── 📁 data/                    # SQLite database (created automatically, gitignored)
├── 📄 ecosystem.config.js     # pm2 process-manager config (non-Docker self-healing)
└── 📁 src/
    ├── 📁 commands/              # Slash commands, grouped by module - folder name = module category
    │   ├── 📁 administration/    #   ↳ /kick, /ban, /config, etc. (always enabled)
    │   ├── 📁 moderation/        #   ↳ /warn, /automod, /antiraid
    │   ├── 📁 utility/           #   ↳ /remind, /poll, /ticket, /birthday, etc.
    │   ├── 📁 engagement/        #   ↳ /rank, /balance, /suggest, etc.
    │   └── 📁 fun/                #   ↳ /trivia, /tictactoe, /hangman, /8ball, etc.
    ├── 📁 events/                 # discord.js event listeners (one file per event/concern)
    ├── 📁 database/               # db.js (schema + migrations) + one repository module per feature
    ├── 📁 utils/                  # Shared helpers: game logic, schedulers, error mapping, card rendering, heartbeat monitor
    ├── 📁 data/                    # Static content (trivia questions, jokes, word lists)
    ├── 📄 index.js                # Bot entry point - loads commands/events, logs in
    └── 📄 deploy-commands.js      # Registers slash commands with Discord's API
```

#### Interaction Flow

```
Discord Interaction → interactionCreate.js
                         ├─ module-toggle check (per-guild)
                         ├─ per-user cooldown check
                         └─ command.execute() ──▶ database/ repository ──▶ Discord response
                                  │
                                  └─ on error ──▶ getFriendlyErrorMessage() ──▶ safe ephemeral reply
```

Background schedulers (reminders, giveaways, birthdays) run on their own interval, independent of the interaction flow, each wrapped in its own error boundary so one failed job never blocks the rest.

---

## 🤝 Contributing

Issues and pull requests are welcome!

<details>
<summary>📐 <strong>Code Style Guidelines</strong></summary>

- **Commands** live in `src/commands/<category>/<name>.js` and export `{ data, execute }` - dropping a file in the right folder is enough; it's picked up automatically by `index.js`, no manual registration required (beyond running `npm run deploy-commands`).
- **Database access** goes through a repository module in `src/database/`, never raw SQL inline in a command file.
- **Error handling**: never send `error.message` or a stack trace to the user - add new Discord API error codes to `src/utils/errorMessages.js` instead.
- **Permissions**: use `setDefaultMemberPermissions` on the command builder for simple cases; for subcommand-level permission differences, check `interaction.memberPermissions.has(...)` manually inside `execute`.
- **Naming**: `camelCase` for functions/variables, files named after what they export.
- Keep functions focused - one command, one job; shared logic belongs in `src/utils/`.

</details>

---

<div align="center">

Made with ☕ and a healthy amount of `console.log` debugging.

⭐ **If this project helped you, consider giving it a star!** ⭐

Built with 💻 by [GuyGuyPeres](https://github.com/GuyGuyPeres)

</div>
