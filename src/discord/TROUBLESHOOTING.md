# Troubleshooting Guide - Discord Room Commands

## Common Issues and Solutions

### Issue 1: Commands Not Appearing in Discord

**Symptoms:**
- Slash commands don't show up when typing `/`
- No autocomplete suggestions for `/room`

**Possible Causes:**
1. Bot not properly invited to server
2. Application not running
3. Discord cache issue
4. Missing `applications.commands` scope

**Solutions:**

**A. Check Bot Invite URL**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=2147483648&scope=bot%20applications.commands
```
Make sure `applications.commands` is included in the scope.

**B. Restart Application**
```bash
# Stop the app
Ctrl+C

# Start again
pnpm start:dev
```

**C. Clear Discord Cache**
- Windows: Press `Ctrl + R` in Discord
- Or restart Discord completely

**D. Check Logs**
```bash
# Look for this in console:
[Necord] Successfully registered application commands
```

**E. Verify Environment Variables**
```env
# .env file
DISCORD_TOKEN=your_token_here
DISCORD_DEVELOPMENT_GUILD_ID=your_guild_id_here
```

---

### Issue 2: "Interaction Failed" Error

**Symptoms:**
- Command runs but shows "This interaction failed"
- Discord shows red error message

**Possible Causes:**
1. Response took longer than 3 seconds
2. Network timeout
3. Database connection issue
4. Unhandled exception

**Solutions:**

**A. Check Logs**
```bash
# Look for error messages in console
[RoomCommands] Error creating room: ...
```

**B. Verify Database Connection**
```bash
# Test Prisma connection
pnpm prisma studio

# Check database is running
# PostgreSQL/MySQL should be active
```

**C. Check Response Time**
The code already uses `deferReply()` to handle long operations:
```typescript
await interaction.deferReply(); // Gives 15 minutes instead of 3 seconds
```

**D. Network Issues**
- Check internet connection
- Verify Discord API is accessible
- Check firewall settings

---

### Issue 3: Game Not Found Error

**Symptoms:**
- `/room game_id:1` shows "❌ Game Not Found"
- Valid game ID returns error

**Solutions:**

**A. Check Database Has Games**
```bash
# Open Prisma Studio
pnpm prisma studio

# Check 'games' table has entries
```

**B. Seed Database**
```bash
# Run seed script
pnpm prisma db seed
```

**C. Verify Game ID**
```
# In Discord, run:
/games

# Note the IDs shown
# Use those IDs in /room command
```

**D. Check Game Service**
```typescript
// In room.commands.ts
console.log('Fetching game with ID:', options.gameId);
const game = await this.gameService.getGameById(options.gameId);
console.log('Game found:', game);
```

---

### Issue 4: Join Room Button Not Working

**Symptoms:**
- Click "Join Room" but nothing happens
- Button click doesn't register
- No response from bot

**Solutions:**

**A. Check Button Handler Registration**
Ensure the decorator is correct:
```typescript
@Button('join_room_:roomId')  // Correct format
async onJoinRoom(@Context() [interaction]: ButtonContext) { ... }
```

**B. Verify CustomId Format**
```typescript
// When creating button:
.setCustomId(`join_room_${room.id}`)  // Should match pattern

// When handling:
const roomId = parseInt(interaction.customId.split('_')[2]);
```

**C. Check Logs**
```bash
# Should see:
[RoomCommands] User <username> joined room <roomId>
```

**D. Test Button Expiry**
Buttons expire after 15 minutes of inactivity. Create a new room to test.

---

### Issue 5: Player Count Not Updating

**Symptoms:**
- Players join but count stays at "1/4"
- Original message doesn't update
- New players see old count

**Solutions:**

**A. Check Bot Permissions**
Bot needs:
- ✅ Read Message History
- ✅ Send Messages
- ✅ Embed Links

**B. Verify Message Edit Code**
```typescript
// This code updates the message:
await interaction.message.edit({
  embeds: [originalEmbed],
  components: [row],
});
```

**C. Check Database**
```bash
# In Prisma Studio, check room_requests table
# Should see entries with status: 'approved'
```

**D. Manual Refresh**
Click "Room Info" button to see current count.

---

### Issue 6: Room Full But Button Still Enabled

**Symptoms:**
- Room shows 4/4 players
- "Join Room" button still clickable
- Users can click but get error

**Solutions:**

**A. Check Button Disable Logic**
```typescript
// Should disable when currentPlayers >= room.maxSlot
if (currentPlayers >= room.maxSlot && components.length > 0) {
  const row = ActionRowBuilder.from<ButtonBuilder>(components[0]);
  const buttons = row.components.map(button => {
    if (button.data.custom_id?.startsWith('join_room_')) {
      return ButtonBuilder.from(button).setDisabled(true).setLabel('Room Full');
    }
    return button;
  });
  
  row.setComponents(buttons);
  
  await interaction.message.edit({
    embeds: [originalEmbed],
    components: [row],
  });
}
```

**B. Force Update**
Create a new room to test with fresh state.

---

### Issue 7: Authentication Issues

**Symptoms:**
- All users appear as same user
- Can't join own rooms (duplicate error)
- Wrong user shown as host

**Current Status:**
This is **expected behavior** in the current implementation.

**Explanation:**
```typescript
// Currently all Discord users map to User ID 1
this.discordUserMap.set('default', 1);
```

**Solutions:**

**For Development:**
Accept this limitation and test with one Discord account.

**For Production:**
Implement Discord OAuth2 authentication. See `ROOM_COMMANDS.md` section "Production Implementation" for details.

**Quick Fix for Testing:**
```typescript
// In room.commands.ts constructor
constructor(
  private readonly roomService: RoomService,
  private readonly gameService: GameService,
) {
  // Map different Discord IDs to different users (temporary)
  this.discordUserMap.set('discord_user_1_id', 1);
  this.discordUserMap.set('discord_user_2_id', 2);
  this.discordUserMap.set('default', 1);
}
```

---

### Issue 8: Invalid Date Format Error

**Symptoms:**
- `/room ... scheduled_at:2025-11-05` shows error
- Date validation fails
- "Invalid date format" message

**Solutions:**

**A. Use ISO 8601 Format**
```
✅ Correct: 2025-11-05T20:00:00Z
❌ Wrong: 2025-11-05
❌ Wrong: 11/05/2025
❌ Wrong: Nov 5, 2025
```

**B. Include Time Component**
```
/room game_id:1 scheduled_at:2025-11-05T20:00:00Z
                                      ^^^^^^^^^^
                                      Time + Timezone
```

**C. Use UTC Timezone**
Always use `Z` suffix or specify timezone:
```
2025-11-05T20:00:00Z        ✅ UTC
2025-11-05T20:00:00+07:00   ✅ UTC+7
2025-11-05T20:00:00         ❌ No timezone
```

---

### Issue 9: Min Players Greater Than Max Players

**Symptoms:**
- Error: "Minimum players cannot be greater than maximum players"
- Command validation fails

**Solutions:**

**A. Check Your Values**
```
❌ /room game_id:1 min_players:10 max_players:5
✅ /room game_id:1 min_players:5 max_players:10
✅ /room game_id:1 min_players:2 max_players:4
```

**B. Use Sensible Defaults**
```
# If unsure, use defaults:
/room game_id:1
# min_players: 1 (default)
# max_players: 4 (default)
```

**C. Common Configurations**
```
Solo: min_players:1 max_players:1
Duo: min_players:2 max_players:2
Squad: min_players:4 max_players:4
Team: min_players:5 max_players:5
Flexible: min_players:2 max_players:10
```

---

### Issue 10: Private Room Join Not Working

**Symptoms:**
- Join request sent but nothing happens
- Host doesn't receive notification
- Status stuck at "pending"

**Current Status:**
This is **expected behavior**. Host approval system is not yet implemented.

**Explanation:**
Join request is created in database with `status: 'pending'`, but there's no UI for host to approve/reject yet.

**Workaround:**
Use public rooms for now:
```
/room game_id:1 room_type:public
```

**Future Enhancement:**
Host approval system will be added. See `ROOM_COMMANDS.md` "Future Enhancements" section.

---

### Issue 11: TypeScript Compilation Errors

**Symptoms:**
- `pnpm run build` fails
- TypeScript errors in console
- Import errors

**Solutions:**

**A. Check Imports**
```typescript
// Ensure all imports are correct:
import { Injectable, Logger } from '@nestjs/common';
import { Context, Options, SlashCommand, Button, ButtonContext } from 'necord';
import type { SlashCommandContext } from 'necord';
import { RoomService } from 'src/core/room/room.service';
import { GameService } from 'src/core/game/game.service';
```

**B. Rebuild**
```bash
# Clean and rebuild
rm -rf dist
pnpm run build
```

**C. Check Dependencies**
```bash
# Ensure Necord is installed
pnpm list necord

# If missing:
pnpm install necord discord.js
```

**D. Verify TypeScript Config**
```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

---

### Issue 12: Discord Module Not Loading

**Symptoms:**
- Application starts but Discord features don't work
- No connection to Discord
- Commands not registering

**Solutions:**

**A. Check Module Import**
```typescript
// In app.module.ts
import { DiscordModule } from './discord/discord.module';

@Module({
  imports: [
    // ... other modules
    DiscordModule,  // Must be imported
  ],
})
export class AppModule {}
```

**B. Verify Discord Config**
```typescript
// src/config/discord.config.ts should exist
export default () => ({
  discord: {
    token: process.env.DISCORD_TOKEN,
    developmentGuildId: process.env.DISCORD_DEVELOPMENT_GUILD_ID,
  },
});
```

**C. Check Environment Variables**
```bash
# Print to verify
echo $DISCORD_TOKEN
echo $DISCORD_DEVELOPMENT_GUILD_ID

# Or in code:
console.log('Discord Token:', process.env.DISCORD_TOKEN?.substring(0, 10) + '...');
```

---

### Issue 13: Prisma Client Not Generated

**Symptoms:**
- Import errors for Prisma types
- `@prisma/client` not found
- Type errors for `room`, `game`, etc.

**Solutions:**

**A. Generate Prisma Client**
```bash
pnpm prisma generate
```

**B. Check Schema File**
```bash
# Ensure schema.prisma exists
ls prisma/schema.prisma
```

**C. Verify Generated Client**
```bash
# Check generated files
ls node_modules/.prisma/client
ls generated/prisma
```

**D. Rebuild After Generation**
```bash
pnpm prisma generate
pnpm run build
```

---

### Issue 14: Button Interaction Timeout

**Symptoms:**
- Click button after 15+ minutes
- "Unknown interaction" error
- Button doesn't respond

**Explanation:**
Discord button interactions expire after 15 minutes.

**Solutions:**

**A. Create New Room**
Old room messages with expired interactions need to be recreated:
```
/room game_id:1
```

**B. Future Enhancement**
Implement room expiry and auto-cleanup:
```typescript
// Automatically close rooms older than 24 hours
// Remove expired buttons
// Archive completed games
```

---

## Debugging Checklist

When something goes wrong, check these in order:

### 1. Environment ✅
- [ ] `.env` file exists
- [ ] `DISCORD_TOKEN` is set
- [ ] `DISCORD_DEVELOPMENT_GUILD_ID` is set
- [ ] Database connection string is correct

### 2. Dependencies ✅
- [ ] `pnpm install` completed successfully
- [ ] `necord` package is installed
- [ ] `discord.js` package is installed
- [ ] `@prisma/client` is generated

### 3. Database ✅
- [ ] Database is running (PostgreSQL/MySQL)
- [ ] Migrations are applied: `pnpm prisma migrate deploy`
- [ ] Games are seeded: `pnpm prisma db seed`
- [ ] Tables exist: `rooms`, `games`, `room_requests`, `users`

### 4. Application ✅
- [ ] Application starts without errors
- [ ] Logs show "Nest application successfully started"
- [ ] Logs show "Successfully registered application commands"
- [ ] No TypeScript compilation errors

### 5. Discord Bot ✅
- [ ] Bot is online in Discord server
- [ ] Bot has required permissions
- [ ] Bot was invited with `applications.commands` scope
- [ ] Slash commands appear when typing `/`

### 6. Commands ✅
- [ ] `/games` command works
- [ ] `/room` command appears in autocomplete
- [ ] Room embed displays after command
- [ ] Buttons are clickable
- [ ] Button clicks trigger handlers

### 7. Logs ✅
- [ ] No errors in console
- [ ] Expected log messages appear
- [ ] Database queries execute successfully
- [ ] Discord interactions log properly

---

## Logging & Debugging

### Enable Verbose Logging

**A. In room.commands.ts**
```typescript
// Add more console.log statements
@SlashCommand({ name: 'room', description: 'Create a new game room' })
async onCreate(...) {
  console.log('=== CREATE ROOM DEBUG ===');
  console.log('User:', interaction.user.username);
  console.log('Options:', options);
  console.log('User ID:', userId);
  
  const game = await this.gameService.getGameById(options.gameId);
  console.log('Game found:', game?.title);
  
  const room = await this.roomService.createRoom(userId, roomData);
  console.log('Room created:', room.id);
  console.log('=== END DEBUG ===');
}
```

**B. Check Prisma Logs**
```typescript
// In prisma.service.ts
constructor() {
  super({
    log: ['query', 'info', 'warn', 'error'], // Enable all logs
  });
}
```

### Common Log Messages

**Success:**
```
[Necord] Successfully registered application commands
[RoomCommands] Room 123 created by Discord user John#1234
[RoomCommands] User Alice#5678 joined room 123
```

**Errors:**
```
[RoomCommands] Error creating room: Game with ID 999 not found
[RoomCommands] Error joining room: Room is full
[NestFactory] Error starting application: Database connection failed
```

---

## Getting Additional Help

### 1. Check Documentation
- `ROOM_COMMANDS.md` - Complete implementation guide
- `QUICK_START.md` - User guide
- `VISUAL_GUIDE.md` - Architecture diagrams
- `dto/README.md` - DTO guide

### 2. Check Logs
```bash
# Run with verbose logging
pnpm start:dev

# Watch for errors
```

### 3. Inspect Database
```bash
# Open Prisma Studio
pnpm prisma studio

# Check:
# - games table has entries
# - rooms table creates entries
# - room_requests table updates
# - users table has test users
```

### 4. Test Incrementally
```bash
# 1. Test database connection
pnpm prisma studio

# 2. Test application starts
pnpm start:dev

# 3. Test simple command
/games

# 4. Test room creation
/room game_id:1

# 5. Test button interaction
Click "Join Room"
```

### 5. Community Resources
- [Necord Documentation](https://necord.org/)
- [Discord.js Guide](https://discord.js.org/)
- [NestJS Documentation](https://nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## Emergency Reset

If everything is broken and you want to start fresh:

```bash
# 1. Stop the application
Ctrl+C

# 2. Reset database (CAUTION: Deletes all data)
pnpm prisma migrate reset

# 3. Clean build
rm -rf dist node_modules

# 4. Reinstall
pnpm install

# 5. Generate Prisma client
pnpm prisma generate

# 6. Rebuild
pnpm run build

# 7. Start fresh
pnpm start:dev
```

---

## Summary

Most issues can be resolved by:
1. ✅ Checking environment variables
2. ✅ Verifying database connection
3. ✅ Ensuring bot has correct permissions
4. ✅ Reading error messages carefully
5. ✅ Checking logs for details
6. ✅ Testing incrementally
7. ✅ Consulting documentation

**Still stuck? Check the logs first! They usually tell you exactly what's wrong. 🔍**
