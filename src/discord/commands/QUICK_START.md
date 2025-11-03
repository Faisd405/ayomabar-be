# Discord Room Commands - Quick Start Guide

## Prerequisites

Before using the Discord room commands, ensure:

1. ✅ Discord bot is configured in `.env`:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   DISCORD_DEVELOPMENT_GUILD_ID=your_server_id_here
   ```

2. ✅ Bot has proper permissions in Discord server:
   - Send Messages
   - Embed Links
   - Use Slash Commands
   - Read Message History

3. ✅ Database is migrated and seeded with games:
   ```bash
   pnpm prisma migrate deploy
   pnpm prisma db seed
   ```

4. ✅ Application is running:
   ```bash
   pnpm start:dev
   ```

## Step 1: Check Available Games

Before creating a room, check which games are available:

```
/games
```

This will show a list of all games with their IDs. Note the `game_id` you want to use.

## Step 2: Create a Room

### Basic Room (Minimum Required)

```
/room game_id:1
```

This creates a room with default settings:
- Max Players: 4
- Min Players: 1
- Type: Casual
- Visibility: Public

### Customized Room

```
/room game_id:1 max_players:5 min_players:2 type_play:competitive
```

### Private Room with Schedule

```
/room game_id:1 room_type:private scheduled_at:2025-11-05T20:00:00Z
```

### Full Configuration

```
/room game_id:1 max_players:10 min_players:4 type_play:tournament room_type:public room_code:LOBBY-ABC123
```

## Step 3: Join a Room

After a room is created, you'll see an embed with two buttons:

1. **🎮 Join Room** - Click to join the room
2. **ℹ️ Room Info** - Click to view detailed information

### Join Room Button

- **Public Rooms**: Joins immediately
- **Private Rooms**: Sends join request to host
- **Full Rooms**: Button is disabled

### Room Info Button

Shows detailed information:
- Host name
- Current players
- Room settings
- Room code (if available)
- Scheduled time (if set)

## Step 4: Monitor Room Updates

The room embed updates automatically when:
- ✅ Players join
- ✅ Room becomes full
- ✅ Status changes

## Command Reference

### `/room` Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `game_id` | Number | ✅ Yes | - | The game ID (from `/games`) |
| `max_players` | Number | No | 4 | Maximum players (1-100) |
| `min_players` | Number | No | 1 | Minimum players (1-100) |
| `type_play` | Choice | No | casual | casual, competitive, custom, tournament |
| `room_type` | Choice | No | public | public, private |
| `room_code` | String | No | - | Room/lobby code (max 100 chars) |
| `scheduled_at` | String | No | - | ISO date: YYYY-MM-DDTHH:mm:ssZ |

## Examples by Use Case

### 1. Quick Match (Default Settings)

```
/room game_id:1
```

**Result:**
- Open to everyone
- 1-4 players
- Casual gameplay
- No schedule

### 2. Competitive 5v5

```
/room game_id:5 max_players:10 min_players:10 type_play:competitive
```

**Result:**
- Requires exactly 10 players
- Competitive mode
- Public visibility

### 3. Private Friend Game

```
/room game_id:3 max_players:6 room_type:private room_code:DISCORD-INV
```

**Result:**
- Private room (requires approval)
- Up to 6 players
- Has Discord invite code

### 4. Scheduled Tournament

```
/room game_id:8 max_players:16 min_players:8 type_play:tournament room_type:public scheduled_at:2025-11-10T18:00:00Z
```

**Result:**
- Tournament mode
- 8-16 players
- Scheduled for Nov 10, 2025 at 6 PM UTC
- Public visibility

### 5. Duo Queue

```
/room game_id:2 max_players:2 min_players:2 type_play:competitive
```

**Result:**
- Exactly 2 players
- Competitive mode
- Perfect for duo partners

## Testing Scenarios

### Scenario 1: Create and Join Room

1. User A: `/room game_id:1 max_players:3`
2. User B: Clicks "Join Room" button
3. User C: Clicks "Join Room" button
4. User D: Clicks "Join Room" button (Should see "Room Full")

**Expected:**
- Room shows "3/3" players
- "Join Room" button is disabled
- User D sees error message

### Scenario 2: Private Room Flow

1. Host: `/room game_id:1 room_type:private`
2. Player: Clicks "Join Room"
3. Player sees: "Join request sent to host"
4. Host needs to approve via `/room approve` (future feature)

### Scenario 3: Scheduled Game

1. Create: `/room game_id:1 scheduled_at:2025-11-05T20:00:00Z`
2. Room shows: "📅 Scheduled At: Tuesday, November 5, 2025 at 8:00 PM"
3. Players can join before scheduled time
4. Reminder notification sent (future feature)

### Scenario 4: Invalid Inputs

1. Try: `/room game_id:999` → "❌ Game Not Found"
2. Try: `/room game_id:1 min_players:10 max_players:5` → "❌ Invalid Player Count"
3. Try: Click "Join Room" after room deleted → "❌ Room Not Found"

## Troubleshooting

### Commands not appearing in Discord

**Solution:**
```bash
# Restart the application
pnpm start:dev
```

Discord should auto-register commands. If not, check:
- `DISCORD_DEVELOPMENT_GUILD_ID` is set correctly
- Bot is invited to the server with `applications.commands` scope

### "Interaction failed" error

**Cause:** Network timeout or database connection issue

**Solution:**
- Check database connection
- Check logs for error details
- Restart application

### Can't join room

**Possible causes:**
1. Room is full → Wait for slot or create new room
2. Room is private → Wait for host approval
3. Room was deleted → Create new room

**Check:** Click "Room Info" to see current status

### Player count not updating

**Solution:**
- Ensure bot has "Read Message History" permission
- Check console logs for errors
- Try clicking "Room Info" for latest data

## Development Tips

### Viewing Logs

```bash
# Watch logs in development
pnpm start:dev

# Look for:
[RoomCommands] Room 1 created by Discord user...
[RoomCommands] User joined room 1
```

### Database Inspection

```bash
# Open Prisma Studio
pnpm prisma studio

# Navigate to:
# - rooms table → See created rooms
# - room_requests table → See join requests
```

### Testing with Multiple Accounts

1. Create room with Account A
2. Join with Account B (different Discord account)
3. Check database to see both users

**Note:** Currently all Discord users map to User ID 1. For proper testing, implement Discord OAuth (see ROOM_COMMANDS.md).

## Next Steps

After successful testing:

1. ✅ Implement Discord OAuth authentication
2. ✅ Add leave room functionality
3. ✅ Add host controls (approve/reject/kick)
4. ✅ Create room list command (`/rooms`)
5. ✅ Add room notifications

See `ROOM_COMMANDS.md` for detailed implementation plans.

## Success Indicators

You've successfully implemented room commands if:

- ✅ `/room` command appears in Discord
- ✅ Room embed displays with game information
- ✅ "Join Room" button works
- ✅ "Room Info" button shows details
- ✅ Player count updates after joining
- ✅ Button disables when room is full
- ✅ Error messages display correctly

## Getting Help

If you encounter issues:

1. Check console logs for error messages
2. Review `ROOM_COMMANDS.md` for detailed architecture
3. Check Prisma schema matches expectations
4. Verify Discord bot permissions
5. Test with `/games` command first to ensure bot works

## Summary

Basic workflow:
```
1. /games                    → See available games
2. /room game_id:X          → Create room
3. Click "Join Room"        → Join the room
4. Click "Room Info"        → View details
```

That's it! You now have a fully functional Discord room system. 🎮🚀
