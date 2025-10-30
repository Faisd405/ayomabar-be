import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateRoomSchema = z.object({
  gameId: z
    .number()
    .int()
    .positive('Game ID must be a positive integer')
    .optional()
    .describe('The ID of the game'),
  minPlayers: z
    .number()
    .int()
    .positive('Min players must be a positive integer')
    .min(1, 'Min players must be at least 1')
    .max(100, 'Min players must not exceed 100')
    .optional()
    .describe('Minimum number of players required'),
  maxPlayers: z
    .number()
    .int()
    .positive('Max players must be a positive integer')
    .min(1, 'Max players must be at least 1')
    .max(100, 'Max players must not exceed 100')
    .optional()
    .describe('Maximum number of players allowed in the room'),
  rankMin: z
    .number()
    .int()
    .positive('Rank min must be a positive integer')
    .optional()
    .describe('Minimum rank required (Rank ID)'),
  rankMax: z
    .number()
    .int()
    .positive('Rank max must be a positive integer')
    .optional()
    .describe('Maximum rank allowed (Rank ID)'),
  typePlay: z
    .enum(['casual', 'competitive', 'custom', 'tournament'])
    .optional()
    .describe('Type of gameplay'),
  roomType: z
    .enum(['public', 'private'])
    .optional()
    .describe('Room visibility type'),
  roomCode: z
    .string()
    .max(100, 'Room code must not exceed 100 characters')
    .optional()
    .describe('Room code or link for joining (e.g., Discord link, game code)'),
  status: z
    .enum(['open', 'closed', 'in-progress', 'completed'])
    .optional()
    .describe('Status of the room'),
  scheduledAt: z
    .string()
    .datetime('Invalid date format')
    .optional()
    .describe('Scheduled date and time for the room'),
});

export class UpdateRoomDto extends createZodDto(UpdateRoomSchema) {}
