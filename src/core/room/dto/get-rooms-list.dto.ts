import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetRoomsListSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .describe('Page number for pagination'),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100))
    .describe('Number of items per page (max 100)'),
  gameId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().positive().optional())
    .describe('Filter rooms by game ID'),
  userId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().positive().optional())
    .describe('Filter rooms by user ID (creator)'),
  status: z
    .enum(['open', 'closed', 'in-progress', 'completed'])
    .optional()
    .describe('Filter rooms by status'),
  typePlay: z
    .enum(['casual', 'competitive', 'custom', 'tournament'])
    .optional()
    .describe('Filter rooms by type of gameplay'),
  roomType: z
    .enum(['public', 'private'])
    .optional()
    .describe('Filter rooms by room visibility type'),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'scheduledAt', 'status'])
    .optional()
    .default('createdAt')
    .describe('Field to sort by'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc')
    .describe('Sort order'),
});

export class GetRoomsListDto extends createZodDto(GetRoomsListSchema) {}
