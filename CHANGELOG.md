# Changelog

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
