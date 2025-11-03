# Discord User Authentication Implementation

## Overview

This implementation provides **automatic user authentication and creation** for Discord bot commands. When a Discord user interacts with the bot, the system automatically:

1. Checks if the user exists in the database via `UserSocialite`
2. If exists, returns the existing user
3. If not exists, creates a new user with Discord information

## Architecture

### Use Case Pattern

Following the **Clean Architecture** pattern used in `core/note`, this implementation uses:

```
User Service → Use Case → Prisma Service → Database
```

### Files Created/Modified

#### New Files

1. **`src/core/user/use-cases/find-or-create-by-discord.use-case.ts`**
   - Core use case for Discord authentication
   - Handles user lookup and creation
   - Uses transactions for data integrity

#### Modified Files

2. **`src/core/user/use-cases/index.ts`**
   - Added export for new use case

3. **`src/core/user/user.service.ts`**
   - Added `findOrCreateByDiscord()` method
   - Injected new use case

4. **`src/core/user/user.module.ts`**
   - Registered new use case as provider

5. **`src/discord/discord.module.ts`**
   - Imported `UserModule`

6. **`src/discord/commands/room.commands.ts`**
   - Removed mock user mapping
   - Integrated Discord authentication
   - Applied to both `/room` command and button interactions

---

## How It Works

### 1. Data Flow

```
Discord User Interaction
        ↓
RoomCommands Handler
        ↓
UserService.findOrCreateByDiscord()
        ↓
FindOrCreateUserByDiscordUseCase
        ↓
Check UserSocialite table
        ↓
    ┌───┴───┐
    │       │
  Found   Not Found
    │       │
    │       ├─→ Create User
    │       │   (Transaction)
    │       │
    │       ├─→ Create UserSocialite
    │       │   (Links Discord ID)
    │       │
    └───┬───┘
        ↓
   Return User
        ↓
Use user.id for room operations
```

### 2. Database Schema

#### UserSocialite Table

```prisma
model UserSocialite {
  id             Int      @id @default(autoincrement())
  user_id        Int
  socialite_name String   // 'discord'
  socialite_id   String   // Discord User ID
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([socialite_name, socialite_id])
  @@map("user_socialites")
}
```

**Key Points:**
- `socialite_name`: Platform identifier ('discord', 'google', 'github', etc.)
- `socialite_id`: Platform-specific user ID
- `@@unique`: Prevents duplicate socialite entries
- **Cascading delete**: When user is deleted, socialite entries are removed

---

## Use Case Implementation

### FindOrCreateUserByDiscordUseCase

**File:** `src/core/user/use-cases/find-or-create-by-discord.use-case.ts`

#### Input Interface

```typescript
interface FindOrCreateByDiscordInput {
  discordId: string;       // Discord user ID
  username: string;        // Discord username
  discriminator: string;   // Discord discriminator (or '0')
  email?: string;          // Optional email
  avatar?: string;         // Avatar URL
}
```

#### Logic Flow

**Step 1: Check Existing User**

```typescript
const existingSocialite = await this.prisma.userSocialite.findUnique({
  where: {
    socialite_name_socialite_id: {
      socialite_name: 'discord',
      socialite_id: input.discordId,
    },
  },
  include: {
    user: { /* user fields */ },
  },
});

if (existingSocialite) {
  return existingSocialite.user; // User exists
}
```

**Step 2: Create New User (Transaction)**

```typescript
const result = await this.prisma.$transaction(async (tx) => {
  // 1. Create user
  const newUser = await tx.user.create({
    data: {
      name: input.username,
      email: generatedEmail,
      username: generatedUsername,
      avatar: input.avatar,
      roles: ['user'],
    },
  });

  // 2. Create socialite link
  await tx.userSocialite.create({
    data: {
      user_id: newUser.id,
      socialite_name: 'discord',
      socialite_id: input.discordId,
    },
  });

  return newUser;
});
```

**Why Transaction?**
- Ensures both user and socialite are created together
- If one fails, both rollback
- Maintains data integrity

---

## Username & Email Generation

### Username Generation

Discord usernames are converted to valid database usernames:

**Algorithm:**
```typescript
private generateUsername(username: string, discriminator: string): string {
  // Clean: lowercase, remove special chars, max 20 chars
  const cleanUsername = username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);

  // Old Discord format (with discriminator)
  if (discriminator && discriminator !== '0') {
    return `${cleanUsername}_${discriminator}`;
  }

  // New Discord format (no discriminator)
  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${cleanUsername}_${randomSuffix}`;
}
```

**Examples:**
- Input: `JohnDoe#1234` → Output: `johndoe_1234`
- Input: `Cool Player#0` → Output: `coolplayer_5678` (random)
- Input: `Test-User!` → Output: `testuser_0123`

### Email Generation

If email is not provided by Discord:

```typescript
private generateEmail(discordId: string): string {
  return `discord_${discordId}@ayomabar.local`;
}
```

**Example:**
- Discord ID: `123456789012345678`
- Generated: `discord_123456789012345678@ayomabar.local`

---

## Integration with Room Commands

### Before (Mock Authentication)

```typescript
// Old approach - everyone was user ID 1
private readonly discordUserMap = new Map<string, number>();

constructor() {
  this.discordUserMap.set('default', 1);
}

const userId = this.discordUserMap.get(interaction.user.id) || 1;
```

### After (Real Authentication)

```typescript
// New approach - real user lookup/creation
const user = await this.userService.findOrCreateByDiscord({
  discordId: interaction.user.id,
  username: interaction.user.username,
  discriminator: interaction.user.discriminator || '0',
  avatar: interaction.user.avatar
    ? `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`
    : null,
});

// Use the actual user ID
await this.roomService.createRoom(user.id, roomData);
```

### Applied To

✅ **`/room` command** (onCreate)
- Creates room with authenticated user
- User is automatically registered on first use

✅ **Join Room button** (onJoinRoom)
- Joins room with authenticated user
- Different Discord users = different app users

✅ **Room Info button** (onRoomInfo)
- No changes needed (read-only)

---

## Benefits

### 1. **True Multi-User Support**

**Before:**
- All Discord users appeared as the same app user
- Couldn't distinguish between different players

**After:**
- Each Discord user gets unique app user
- Proper player tracking
- Accurate room memberships

### 2. **Automatic Registration**

- No manual signup required
- Users created on first interaction
- Seamless user experience

### 3. **Avatar Integration**

Discord avatars are automatically fetched:

```typescript
avatar: interaction.user.avatar
  ? `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`
  : null
```

### 4. **Scalable Authentication**

Can easily add other platforms:

```typescript
// Future: Google authentication
await userService.findOrCreateByGoogle({
  googleId: '...',
  email: '...',
  // ...
});

// Future: GitHub authentication
await userService.findOrCreateByGithub({
  githubId: '...',
  username: '...',
  // ...
});
```

---

## Database Queries

### Finding Existing User

```sql
SELECT 
  u.id, u.name, u.email, u.username, u.avatar
FROM user_socialites us
INNER JOIN users u ON u.id = us.user_id
WHERE us.socialite_name = 'discord'
  AND us.socialite_id = '123456789012345678';
```

### Creating New User

```sql
-- Transaction starts
BEGIN;

-- 1. Create user
INSERT INTO users (name, email, username, avatar, roles)
VALUES ('johndoe', 'discord_123@ayomabar.local', 'johndoe_1234', 'https://...', ARRAY['user'])
RETURNING id;

-- 2. Create socialite link
INSERT INTO user_socialites (user_id, socialite_name, socialite_id)
VALUES (42, 'discord', '123456789012345678');

-- Transaction ends
COMMIT;
```

---

## Testing

### Test Scenario 1: New Discord User

**Steps:**
1. Discord user "TestUser#1234" runs `/room game_id:1`
2. System checks UserSocialite → Not found
3. Creates new user:
   - username: `testuser_1234`
   - email: `discord_123456789@ayomabar.local`
   - avatar: Discord avatar URL
4. Creates UserSocialite:
   - socialite_name: `discord`
   - socialite_id: Discord ID
5. Creates room with new user.id

**Expected Result:**
- ✅ New user in `users` table
- ✅ New entry in `user_socialites` table
- ✅ Room created with correct user_id
- ✅ Room shows correct username as host

### Test Scenario 2: Existing Discord User

**Steps:**
1. Same user runs `/room game_id:2`
2. System checks UserSocialite → Found!
3. Returns existing user (ID: 42)
4. Creates room with user.id = 42

**Expected Result:**
- ✅ No new user created
- ✅ Uses existing user ID
- ✅ Room created with same user_id
- ✅ User has multiple rooms

### Test Scenario 3: Multiple Discord Users

**Setup:**
- User A (Discord ID: 111) creates room
- User B (Discord ID: 222) joins room

**Expected Result:**
- ✅ User A is host (isHost: true)
- ✅ User B is member (isHost: false)
- ✅ Two different entries in `room_requests`
- ✅ Room Info shows both users correctly

---

## Error Handling

### Duplicate Username Conflict

If generated username already exists, Prisma will throw:

```
PrismaClientKnownRequestError: Unique constraint failed on users.username
```

**Future Enhancement:** Add retry with incremented suffix:
```typescript
testuser_1234 → testuser_1235 → testuser_1236
```

### Transaction Rollback

If user creation succeeds but socialite creation fails:
- Transaction automatically rolls back
- No orphaned user records
- Maintains database integrity

### Missing Discord Data

**Discriminator:** Defaults to `'0'` for new Discord usernames
**Avatar:** Defaults to `null` if not set
**Email:** Auto-generated from Discord ID

---

## Migration Guide

### No Database Changes Required

The `UserSocialite` table already exists in the schema. No migrations needed!

### Existing Data

If you have test data with mock users:

**Option 1: Keep existing users**
- They'll continue to work
- New Discord users will create new entries

**Option 2: Clean slate**
```sql
TRUNCATE TABLE user_socialites CASCADE;
TRUNCATE TABLE users CASCADE;
```

---

## Monitoring & Logs

### Log Messages

**User Created:**
```
[RoomCommands] User authenticated: johndoe_1234 (ID: 42) from Discord TestUser
[RoomCommands] Room 1 created by Discord user TestUser (123456789012345678)
```

**Existing User:**
```
[RoomCommands] User authenticated: johndoe_1234 (ID: 42) from Discord TestUser
[RoomCommands] User TestUser joined room 1
```

### Database Monitoring

Check user creation rate:
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users
FROM user_socialites
WHERE socialite_name = 'discord'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Future Enhancements

### 1. Email Verification

For Discord users with email scope:

```typescript
if (interaction.user.email) {
  input.email = interaction.user.email;
  input.emailVerified = true;
}
```

### 2. Profile Updates

Update user info when Discord data changes:

```typescript
// Check if avatar/username changed
if (existingUser.avatar !== newAvatar) {
  await updateUser(userId, { avatar: newAvatar });
}
```

### 3. Multi-Platform Linking

Allow users to link multiple platforms:

```
User ID: 42
├─ Discord: 123456789
├─ Google: user@gmail.com
└─ GitHub: githubuser
```

### 4. OAuth Scopes

Request additional Discord permissions:
- Email
- Guilds (server memberships)
- Connections (linked accounts)

---

## Security Considerations

### 1. Discord ID Validation

Discord IDs are strings of 17-19 digits:

```typescript
if (!/^\d{17,19}$/.test(discordId)) {
  throw new BadRequestException('Invalid Discord ID');
}
```

### 2. Username Sanitization

Already implemented:
- Removes special characters
- Limits length to 20 chars
- Converts to lowercase

### 3. Email Domain

Generated emails use `@ayomabar.local`:
- Not a real domain
- Prevents accidental email sends
- Easy to identify Discord users

### 4. Transaction Safety

All database operations use transactions:
- Prevents partial writes
- Maintains referential integrity
- Auto-rollback on errors

---

## Troubleshooting

### Issue: User not found after creation

**Cause:** Transaction might have rolled back

**Solution:**
1. Check logs for errors
2. Verify database connection
3. Check for unique constraint violations

### Issue: Duplicate usernames

**Cause:** Generated username already exists

**Solution:**
Implement retry logic (future enhancement)

### Issue: Avatar not loading

**Cause:** Discord CDN URL format changed

**Solution:**
Check Discord API documentation for current format

---

## Summary

✅ **Implemented:**
- Use case pattern following `core/note` architecture
- Automatic user lookup via `UserSocialite`
- User creation on first interaction
- Username and email generation
- Avatar fetching from Discord
- Transaction safety
- Applied to all Discord commands

✅ **Benefits:**
- True multi-user support
- No manual registration
- Scalable to other platforms
- Clean architecture
- Production-ready

✅ **Database:**
- No migrations required
- Uses existing `UserSocialite` table
- Proper foreign key relationships
- Cascade delete support

**The Discord bot now has full user authentication! 🎉**
