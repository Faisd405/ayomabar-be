# Quick Start Guide - Discord Bot

## 🚀 Getting Started in 5 Minutes

### Step 1: Create Discord Bot (2 minutes)

1. Go to https://discord.com/developers/applications
2. Click **"New Application"** → Give it a name (e.g., "AyomaBar Bot")
3. Go to **"Bot"** tab on the left → Click **"Add Bot"**
4. Under **"Privileged Gateway Intents"**, enable:
   - ✅ Message Content Intent
5. Click **"Reset Token"** → Copy the token (you'll need this!)

### Step 2: Configure Environment (30 seconds)

Add these to your `.env` file:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN="your-discord-bot-token-here"
DISCORD_DEVELOPMENT_GUILD_ID="your-development-guild-id-here"
```

**How to get Guild ID:**
1. Enable Developer Mode in Discord: `User Settings` → `Advanced` → `Developer Mode` (ON)
2. Right-click your server → `Copy ID`

### Step 3: Invite Bot to Server (1 minute)

1. Go back to Discord Developer Portal → Your application
2. Click **"OAuth2"** → **"URL Generator"**
3. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
4. Select bot permissions:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Use Slash Commands
5. Copy the generated URL at the bottom
6. Open it in browser → Select your server → Authorize

### Step 4: Start the Bot (30 seconds)

```bash
# Make sure dependencies are installed
pnpm install

# Start the application
pnpm run start:dev
```

You should see logs like:
```
[Nest] INFO [NecordService] Bot logged in as: YourBotName#1234
[Nest] INFO [NecordService] Successfully registered application commands
```

### Step 5: Test It! (1 minute)

Go to your Discord server and type:

```
/games
```

You should see a beautiful embed with all available games! 🎉

Try other commands:
```
/games search:valorant
/games page:2
/game id:1
```

## 🎮 Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/games` | List all games with filters | `/games search:valorant` |
| `/game <id>` | Get game details | `/game id:1` |

## 🔧 Troubleshooting

### Commands don't appear?
- Wait 10-30 seconds after bot starts
- Make sure bot is online (green status)
- Check `DISCORD_DEVELOPMENT_GUILD_ID` is correct
- Try `/` in Discord chat - they should appear

### Bot offline?
- Check `DISCORD_BOT_TOKEN` is correct
- Check application logs for errors
- Make sure bot is invited to your server

### "Interaction failed" error?
- Check application is running
- Check database connection is working
- Look at application logs for errors

## 📝 Next Steps

✅ Bot is working!

**What you can do now:**
- Test all commands
- Customize embed colors in `game.commands.ts`
- Add more commands (rooms, users, etc.)
- Share with your gaming community!

**Optional enhancements:**
- Add pagination buttons
- Create room management commands
- Add user profile commands
- Implement Discord notifications

## 📚 Documentation

- Full docs: `src/discord/README.md`
- Implementation details: `docs/DISCORD_IMPLEMENTATION.md`

---

**Need help?** Check the logs or see detailed documentation in the files above.
