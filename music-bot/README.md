## Discord Music Bot (discord.js v14)

Quick start:

1. Copy `.env.example` to `.env` and fill `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, optionally `DISCORD_GUILD_ID` for faster registration.
2. Install deps:
```bash
npm i
```
3. Register slash commands:
```bash
npm run register
```
4. Start the bot:
```bash
npm start
```

Slash commands:
- /play <query>
- /skip
- /pause
- /stop
- /queue
- /nowplaying
- /volume <0-200>
- /shuffle
- /remove <index>

Component controls are available via /nowplaying and after /play; buttons allow pause/resume, skip, stop, shuffle.
