import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateMatchSchema = z.object({
  gameId: z
    .number()
    .int()
    .positive('Game ID must be a positive integer')
    .describe('The ID of the game'),
  maxPlayers: z
    .number()
    .int()
    .positive('Max players must be a positive integer')
    .min(1, 'Max players must be at least 1')
    .max(100, 'Max players must not exceed 100')
    .default(1)
    .optional()
    .describe('Maximum number of players allowed in the match'),
  status: z
    .enum(['open', 'closed', 'in-progress', 'completed'])
    .default('open')
    .optional()
    .describe('Status of the match'),
  scheduledAt: z
    .string()
    .datetime('Invalid date format')
    .optional()
    .describe('Scheduled date and time for the match'),
});

export class CreateMatchDto extends createZodDto(CreateMatchSchema) {}
