# Discord Bot Integration

This project includes Discord bot integration using [Necord](https://necord.org/) - a NestJS module for creating Discord bots.

## Setup

### 1. Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section in the left sidebar
4. Click "Add Bot"
5. Under "Privileged Gateway Intents", enable:
   - Message Content Intent
   - Server Members Intent (optional, for advanced features)
6. Copy the Bot Token

### 2. Get Your Guild ID (for Development)

1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on your server and click "Copy ID"

### 3. Configure Environment Variables

Add these variables to your `.env` file:

```env
DISCORD_BOT_TOKEN=your-discord-bot-token-here
DISCORD_DEVELOPMENT_GUILD_ID=your-guild-id-for-testing
```

**Note:** The `DISCORD_DEVELOPMENT_GUILD_ID` is optional but recommended for development. It makes slash commands register instantly in your test server instead of taking up to 1 hour globally.

### 4. Invite the Bot to Your Server

1. Go to the "OAuth2" > "URL Generator" section
2. Select scopes:
   - `bot`
   - `applications.commands`
3. Select bot permissions:
   - Send Messages
   - Embed Links
   - Use Slash Commands
4. Copy the generated URL and open it in your browser
5. Select your server and authorize

### 5. Start the Application

```bash
pnpm run start:dev
```

The bot will automatically connect and register slash commands.

## Available Commands

### `/games` - List Games

Lists all available games with pagination and filtering options.

**Options:**
- `page` (optional): Page number (default: 1)
- `search` (optional): Search games by title
- `genre` (optional): Filter by genre
- `platform` (optional): Filter by platform

**Example:**
```
/games page:1 search:valorant
```

### `/game` - Get Game Details

Get detailed information about a specific game.

**Options:**
- `id` (required): Game ID

**Example:**
```
/game id:1
```

## Project Structure

```
src/discord/
├── commands/
│   ├── game.commands.ts    # Game-related Discord commands
│   └── index.ts            # Command exports
├── discord.module.ts       # Discord module configuration
└── README.md              # This file
```

## Adding New Commands

To add new Discord commands:

1. Create a new file in `src/discord/commands/`
2. Use the `@SlashCommand()` decorator from Necord
3. Register the command in `discord.module.ts` providers
4. Export from `commands/index.ts`

Example:

```typescript
import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';

@Injectable()
export class MyCommands {
  @SlashCommand({
    name: 'hello',
    description: 'Say hello',
  })
  async onHello(@Context() [interaction]: SlashCommandContext) {
    return interaction.reply('Hello from Discord bot!');
  }
}
```

## Debugging

If commands don't appear:

1. Check that `DISCORD_BOT_TOKEN` is set correctly
2. Check that the bot has proper permissions in your server
3. If using `DISCORD_DEVELOPMENT_GUILD_ID`, make sure it's the correct guild ID
4. Check application logs for errors
5. Try restarting the application

## Resources

- [Necord Documentation](https://necord.org/)
- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
