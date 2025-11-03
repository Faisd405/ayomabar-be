# Agent Guide: Necord DTOs for Discord Slash Commands

> **Audience**: AI Coding Agents, Developers, LLM Assistants
>
> **Purpose**: Step-by-step guide to create, use, and maintain DTOs for Discord slash commands using Necord

## What Are Necord DTOs?

Data Transfer Objects (DTOs) are TypeScript classes that:
- Define the structure and validation of Discord slash command options
- Provide type safety at compile-time and runtime
- Use Necord decorators to map to Discord API parameters
- Enable automatic validation and error handling

## Quick Reference: Existing DTOs

### 1. GamesListOptionsDto
**Location:** `games-list-options.dto.ts`  
**Command:** `/games`  
**Purpose:** List all games with optional filters

| Property | Type | Required | Validation | Description |
|----------|------|----------|------------|-------------|
| `page` | number | No | min: 1 | Page number for pagination |
| `search` | string | No | - | Search term to filter games by title |
| `genre` | string | No | - | Filter games by genre |
| `platform` | string | No | - | Filter games by platform |

**Discord Usage:**
```
/games
/games page:2
/games search:valorant
/games genre:FPS platform:PC
```

### 2. GameDetailOptionsDto
**Location:** `game-detail-options.dto.ts`  
**Command:** `/game`  
**Purpose:** Get details of a specific game

| Property | Type | Required | Validation | Description |
|----------|------|----------|------------|-------------|
| `id` | number | Yes | min: 1 | Game ID |

**Discord Usage:**
```
/game id:1
/game id:25
```

---

## Agent Instructions: Creating a New DTO

### Step 1: Analyze Requirements

Before creating a DTO, determine:
1. **Command name** - What will the slash command be called?
2. **Command purpose** - What does this command do?
3. **Required parameters** - What options MUST the user provide?
4. **Optional parameters** - What options CAN the user provide?
5. **Data types** - String, number, boolean, Discord entity (user/channel/role)?
6. **Validation rules** - Min/max values, length constraints, choices?

### Step 2: Create the DTO File

**File naming convention:** `{command-name}-options.dto.ts`

**Example:** For a `/room create` command → `room-create-options.dto.ts`

```typescript
// dto/room-create-options.dto.ts
import { StringOption, NumberOption, BooleanOption } from 'necord';

export class RoomCreateOptionsDto {
  @StringOption({
    name: 'name',
    description: 'The name of the room',
    required: true,
    min_length: 3,
    max_length: 50,
  })
  name: string;

  @NumberOption({
    name: 'max_players',
    description: 'Maximum number of players',
    required: false,
    min_value: 2,
    max_value: 10,
  })
  maxSlot?: number;

  @BooleanOption({
    name: 'private',
    description: 'Make the room private',
    required: false,
  })
  isPrivate?: boolean;
}
```

### Step 3: Export from Index

Add the export to `dto/index.ts`:

```typescript
export * from './games-list-options.dto';
export * from './game-detail-options.dto';
export * from './room-create-options.dto'; // Add this line
```

### Step 4: Use in Command Handler

```typescript
// commands/room.commands.ts
import { Injectable } from '@nestjs/common';
import { Context, Options, SlashCommand, SlashCommandContext } from 'necord';
import { RoomCreateOptionsDto } from '../dto';

@Injectable()
export class RoomCommands {
  @SlashCommand({
    name: 'room',
    description: 'Create a new game room',
  })
  async onCreate(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: RoomCreateOptionsDto,
  ) {
    // Access validated options
    const { name, maxSlot, isPrivate } = options;
    
    // maxSlot will be number | undefined
    const max = maxSlot ?? 4; // Default to 4
    
    await interaction.reply({
      content: `Room "${name}" created! Max players: ${max}, Private: ${isPrivate ?? false}`,
    });
  }
}
```

---

## Necord Decorator Reference

### String Options

```typescript
@StringOption({
  name: 'text',
  description: 'Some text input',
  required: true,
  min_length: 1,
  max_length: 100,
  // Optional: predefined choices
  choices: [
    { name: 'Option 1', value: 'opt1' },
    { name: 'Option 2', value: 'opt2' },
  ],
  // Optional: enable autocomplete
  autocomplete: true,
})
text: string;
```

### Number Options

```typescript
@NumberOption({
  name: 'count',
  description: 'A number',
  required: false,
  min_value: 1,
  max_value: 100,
})
count?: number;
```

### Integer Options (Whole numbers only)

```typescript
@IntegerOption({
  name: 'age',
  description: 'Your age',
  required: true,
  min_value: 1,
  max_value: 120,
})
age: number;
```

### Boolean Options

```typescript
@BooleanOption({
  name: 'enabled',
  description: 'Enable feature',
  required: false,
})
enabled?: boolean;
```

### Discord Entity Options

```typescript
// User selection
@UserOption({
  name: 'user',
  description: 'Select a user',
  required: true,
})
user: User;

// Channel selection
@ChannelOption({
  name: 'channel',
  description: 'Select a channel',
  required: false,
})
channel?: GuildChannel;

// Role selection
@RoleOption({
  name: 'role',
  description: 'Select a role',
  required: false,
})
role?: Role;
```

### Attachment Options

```typescript
@AttachmentOption({
  name: 'file',
  description: 'Upload a file',
  required: false,
})
file?: Attachment;
```

---

## Decision Tree: Choosing the Right Decorator

```
Is it text input?
├─ Yes → @StringOption()
│  ├─ Need predefined choices? → Add choices: []
│  └─ Need dynamic suggestions? → Add autocomplete: true
│
Is it a number?
├─ Yes → Must be whole number?
│  ├─ Yes → @IntegerOption()
│  └─ No → @NumberOption()
│
Is it true/false?
├─ Yes → @BooleanOption()
│
Is it a Discord entity?
├─ User? → @UserOption()
├─ Channel? → @ChannelOption()
├─ Role? → @RoleOption()
└─ User or Role? → @MentionableOption()
│
Is it a file?
└─ Yes → @AttachmentOption()
```

---

## Validation Rules

### Common Validations

| Validation | Applies To | Description |
|------------|------------|-------------|
| `required` | All | Option must be provided |
| `min_value` | Number, Integer | Minimum numeric value |
| `max_value` | Number, Integer | Maximum numeric value |
| `min_length` | String | Minimum character count |
| `max_length` | String | Maximum character count |
| `choices` | String, Number | Predefined valid values |
| `autocomplete` | String, Number | Enable autocomplete handler |

### TypeScript Type Safety

```typescript
// Required option
@StringOption({ required: true })
name: string; // Type: string

// Optional option
@StringOption({ required: false })
name?: string; // Type: string | undefined

// Optional with default
@NumberOption({ required: false })
count?: number; // Use: count ?? defaultValue
```

---

## Agent Workflow: Complete Example

**Task:** Create `/profile view` command to view user profiles

### 1. Analyze Requirements
- Command: `/profile view`
- Required: User ID
- Optional: Show private info (admin only)

### 2. Create DTO

```typescript
// dto/profile-view-options.dto.ts
import { NumberOption, BooleanOption } from 'necord';

export class ProfileViewOptionsDto {
  @NumberOption({
    name: 'user_id',
    description: 'The ID of the user to view',
    required: true,
    min_value: 1,
  })
  userId: number;

  @BooleanOption({
    name: 'show_private',
    description: 'Show private information (admin only)',
    required: false,
  })
  showPrivate?: boolean;
}
```

### 3. Export

```typescript
// dto/index.ts
export * from './profile-view-options.dto';
```

### 4. Implement Command

```typescript
// commands/profile.commands.ts
import { Injectable } from '@nestjs/common';
import { Context, Options, SlashCommand, SlashCommandContext } from 'necord';
import { ProfileViewOptionsDto } from '../dto';
import { UserService } from '@/core/user/user.service';

@Injectable()
export class ProfileCommands {
  constructor(private readonly userService: UserService) {}

  @SlashCommand({
    name: 'profile',
    description: 'View a user profile',
  })
  async onView(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: ProfileViewOptionsDto,
  ) {
    const { userId, showPrivate } = options;
    
    // Fetch user
    const user = await this.userService.findById(userId);
    
    if (!user) {
      return interaction.reply({
        content: '❌ User not found',
        ephemeral: true,
      });
    }
    
    // Check permissions for private info
    const canViewPrivate = showPrivate && interaction.member.permissions.has('Administrator');
    
    const embed = {
      title: `Profile: ${user.username}`,
      fields: [
        { name: 'ID', value: user.id.toString() },
        { name: 'Email', value: canViewPrivate ? user.email : '🔒 Hidden' },
      ],
    };
    
    await interaction.reply({ embeds: [embed] });
  }
}
```

### 5. Test

```bash
# In Discord
/profile view user_id:1
/profile view user_id:1 show_private:true
```

---

## Advanced Patterns

### Pattern 1: Choices (Predefined Options)

```typescript
@StringOption({
  name: 'difficulty',
  description: 'Game difficulty',
  required: true,
  choices: [
    { name: 'Easy', value: 'easy' },
    { name: 'Normal', value: 'normal' },
    { name: 'Hard', value: 'hard' },
    { name: 'Expert', value: 'expert' },
  ],
})
difficulty: 'easy' | 'normal' | 'hard' | 'expert';
```

### Pattern 2: Autocomplete (Dynamic Suggestions)

```typescript
// In DTO
@StringOption({
  name: 'game',
  description: 'Select a game',
  required: true,
  autocomplete: true,
})
game: string;

// In Command Handler
import { AutocompleteInteraction } from 'discord.js';
import { AutocompleteInterceptor } from 'necord';

@Injectable()
export class GameCommands {
  @UseInterceptors(AutocompleteInterceptor)
  @SlashCommand({ name: 'play', description: 'Play a game' })
  async onPlay(
    @Context() [interaction]: SlashCommandContext,
    @Options() { game }: PlayGameOptionsDto,
  ) {
    await interaction.reply(`Starting ${game}...`);
  }

  @On('interactionCreate')
  async onAutocomplete(interaction: AutocompleteInteraction) {
    if (!interaction.isAutocomplete()) return;
    
    const focusedValue = interaction.options.getFocused();
    const games = await this.gameService.search(focusedValue);
    
    await interaction.respond(
      games.map(game => ({ name: game.title, value: game.id.toString() }))
    );
  }
}
```

### Pattern 3: Multiple DTOs for Subcommands

```typescript
// dto/room-create-options.dto.ts
export class RoomCreateOptionsDto { /* ... */ }

// dto/room-join-options.dto.ts
export class RoomJoinOptionsDto {
  @StringOption({
    name: 'room_code',
    description: 'The room code to join',
    required: true,
    min_length: 6,
    max_length: 6,
  })
  roomCode: string;
}

// commands/room.commands.ts
@Injectable()
export class RoomCommands {
  @Subcommand({
    name: 'create',
    description: 'Create a room',
  })
  async onCreate(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: RoomCreateOptionsDto,
  ) { /* ... */ }

  @Subcommand({
    name: 'join',
    description: 'Join a room',
  })
  async onJoin(
    @Context() [interaction]: SlashCommandContext,
    @Options() options: RoomJoinOptionsDto,
  ) { /* ... */ }
}
```

---

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Forgetting to Export DTO

**Problem:**
```typescript
// dto/my-options.dto.ts created
// But not exported in dto/index.ts
```

**Solution:**
```typescript
// dto/index.ts
export * from './my-options.dto'; // Add this
```

### ❌ Pitfall 2: Wrong Type for Optional Fields

**Problem:**
```typescript
@NumberOption({ required: false })
count: number; // Should be number | undefined
```

**Solution:**
```typescript
@NumberOption({ required: false })
count?: number; // Add ? for optional
```

### ❌ Pitfall 3: Validation Not Matching Business Logic

**Problem:**
```typescript
@NumberOption({
  name: 'players',
  min_value: 1,
  max_value: 100, // But your game only supports 10 players
})
```

**Solution:**
```typescript
@NumberOption({
  name: 'players',
  min_value: 2,
  max_value: 10, // Match your actual limit
})
```

### ❌ Pitfall 4: Not Handling Undefined Optional Values

**Problem:**
```typescript
const maxSlot = options.maxSlot * 2; // Error if undefined
```

**Solution:**
```typescript
const maxSlot = (options.maxSlot ?? 4) * 2; // Use nullish coalescing
```

---

## Testing DTOs

### Manual Testing in Discord

```bash
# Test required fields
/command               # Should show error
/command field:value   # Should work

# Test validation
/command number:0      # Should fail if min_value: 1
/command number:-5     # Should fail if min_value: 1

# Test optional fields
/command field1:value1
/command field1:value1 field2:value2

# Test edge cases
/command text:""                    # Empty string
/command number:999999999999        # Very large number
/command text:"very long text..."   # Max length
```

### Unit Testing (Optional)

```typescript
// dto/my-options.dto.spec.ts
import { validate } from 'class-validator';
import { MyOptionsDto } from './my-options.dto';

describe('MyOptionsDto', () => {
  it('should validate correct input', async () => {
    const dto = new MyOptionsDto();
    dto.name = 'Test';
    dto.count = 5;
    
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
```

---

## Best Practices for AI Agents

### ✅ DO:
1. **Analyze existing DTOs** before creating new ones for pattern consistency
2. **Use descriptive names** that clearly indicate the command and purpose
3. **Add comprehensive descriptions** for every option (users see these in Discord)
4. **Set appropriate validation** rules (min/max values, length constraints)
5. **Use TypeScript optional types** (`?`) for non-required fields
6. **Export all DTOs** from `dto/index.ts`
7. **Document complex validation** logic in comments
8. **Test edge cases** (empty, very large, negative values)

### ❌ DON'T:
1. **Don't skip validation** - Always add min/max constraints where applicable
2. **Don't use vague names** - `options.dto.ts` is bad, `game-create-options.dto.ts` is good
3. **Don't forget nullish coalescing** - Handle undefined optional values
4. **Don't duplicate DTOs** - Reuse if the same options are needed
5. **Don't expose internal field names** - Use user-friendly Discord option names
6. **Don't mix concerns** - One DTO per command or subcommand

---

## Checklist for Creating DTOs

```
□ Analyzed command requirements
□ Determined required vs optional parameters
□ Chosen appropriate Necord decorators
□ Added validation rules (min/max, length, choices)
□ Used correct TypeScript types (string, number, ?, etc.)
□ Added clear descriptions for each option
□ Created DTO file with correct naming convention
□ Exported DTO from dto/index.ts
□ Implemented command handler using the DTO
□ Tested in Discord with various inputs
□ Tested edge cases and validation
□ Documented any complex logic
```

---

## Resources & References

- **Necord Documentation**: [https://necord.org/](https://necord.org/)
- **Discord.js Guide**: [https://discord.js.org/](https://discord.js.org/)
- **Discord API - Slash Commands**: [https://discord.com/developers/docs/interactions/application-commands](https://discord.com/developers/docs/interactions/application-commands)
- **TypeScript Handbook**: [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)

---

## Quick Command Reference

```bash
# Install dependencies
pnpm install

# Generate Prisma client (if DTOs use database models)
pnpm prisma generate

# Run development server
pnpm start:dev

# Test Discord bot
# Use Discord Developer Portal → OAuth2 → URL Generator
# Select bot and applications.commands scopes
```

---

## Summary

**Necord DTOs provide:**
- ✅ Type safety for Discord commands
- ✅ Automatic validation
- ✅ Clear, maintainable code
- ✅ Better developer experience
- ✅ Automatic Discord integration

**Key takeaway for agents:** Always create a DTO for each Discord slash command. It's the foundation of type-safe, validated, and maintainable Discord bot commands.
