# Changelog

## v1.2.0 - Real-Time Home Front Command Alerts

Adds real-time Pikud Haoref (Home Front Command) alert broadcasting, an architecture diagram, and a mention-injection fix caught during testing.

### Alerts
- `/alerts` - configure real-time rocket/missile and other Home Front Command alert broadcasting per server: `toggle`, `channel`, `role`, `cities` (area filter), `status`, `test`
- `src/utils/alertScheduler.js` - polls the unofficial [pikud-haoref-api](https://github.com/eladnava/pikud-haoref-api) (by Elad Nava) every 5s and broadcasts new alerts to every configured server, with edge-triggered de-duplication so an ongoing alert isn't re-announced every poll
- Optional `PIKUD_HAOREF_PROXY` env var for bots hosted outside Israel, since the underlying API only responds to requests from within Israel
- New `alerts_config` table (per-guild channel, enabled flag, ping role, area filter)

### Documentation
- `docs/architecture.drawio` + `docs/architecture.svg` - an editable draw.io architecture diagram, embedded at the top of the README's Architecture section
- README credits [Elad Nava](https://github.com/eladnava) and pikud-haoref-api directly for the alerts data source

### Security fix
- Fixed a mass-ping path in `/alerts role`: Discord's role picker lists `@everyone` as a selectable role, and since `@everyone`'s role ID is the guild ID, selecting it produced a real `@everyone` ping on every future alert. `/alerts role` now rejects `@everyone` outright.

## v1.1.0 - Docker Release

Adds an official Docker deployment path alongside the existing plain-Node setup, plus real self-healing and two security fixes.

### Docker
- `docker/Dockerfile` - multi-stage build (native dependencies like `better-sqlite3` compile in a builder stage; the final image is a slim `node:20-slim` runtime with no leftover build tools)
- `docker/docker-compose.yml` - `data/` bind-mounted for persistence, `.env` wired in automatically, `restart: unless-stopped`
- Run with `docker compose -f docker/docker-compose.yml up -d --build`

### Self-healing
- `src/utils/heartbeat.js` - a watchdog that force-exits the process if it's been disconnected from Discord for more than ~3 minutes (normal reconnects don't trigger this), and writes a heartbeat file every 60s while healthy
- Docker `HEALTHCHECK` reads that heartbeat file to report container health
- `uncaughtException` / `unhandledRejection` now deliberately exit the process instead of limping on, since a supervisor (Docker's restart policy, or pm2) is now in place to bring up a clean process
- Non-Docker path gets the same guarantee via `ecosystem.config.js` (pm2, `autorestart: true`) - `npm run pm2:start`
- Verified live: repeatedly crashed the running container and confirmed Docker restarted it automatically each time (`RestartCount` incrementing, bot reconnecting cleanly)

### Security fixes
- Fixed a mention-injection issue where an admin-configured welcome message could ping `@everyone`/`@here`/roles even from a staff member who doesn't hold the Mention Everyone permission themselves - welcome messages now only ever mention the joining member
- Fixed a privilege-escalation path where `/reactionrole add` didn't check the granted role against the command-runner's own role hierarchy (unlike `/role add`, which already did) - a `ManageRoles` holder could previously bind a reaction to a role above their own and self-grant it

## v1.0.0 - Initial Release

Marshal-Bot's first public release: a free, open-source, multi-feature Discord bot covering administration, moderation, utility, engagement, and fun.

### Administration
- `/kick`, `/ban`, `/unban`, `/timeout`, `/untimeout`, `/purge`, `/slowmode`, `/lock`, `/unlock`, `/nickname`, `/role add|remove`
- `/config` - central configuration for logs, welcome messages, birthdays, tickets, starboard, suggestions, and per-module toggles

### Moderation & Safety
- `/warn`, `/warnings`, `/clearwarnings` - warning system with case history
- `/automod` - banned words, invite link blocking, mention spam, and caps spam filtering
- `/antiraid` - join-rate raid detection with new-account auto-kick
- Full server logging (message edits/deletes, joins/leaves, role/nickname changes, bans)

### Utility
- `/reactionrole`, `/customcommand`, `/remind`, `/poll`, `/giveaway`
- `/birthday` - birthday tracking with a generated congratulations card, announced automatically
- `/ticket panel` - button-based private support tickets

### Engagement
- `/rank`, `/leaderboard` - message-based XP/leveling
- `/balance`, `/daily`, `/pay`, `/shop` - virtual coin economy with a role-granting shop
- Starboard and `/suggest` / `/suggestion approve|deny`

### Fun
- `/trivia`, `/tictactoe`, `/hangman`
- `/8ball`, `/joke`, `/coinflip`, `/roll`, `/meme`

### Under the hood
- SQLite persistence (better-sqlite3) with self-healing schema migrations
- Centralized, secret-safe error handling - no stack traces or internal details ever reach a user
- Crash-hardened event loop (every listener promise is caught; global safety nets for unhandled rejections/exceptions)
- Per-guild module toggles and cooldowns
