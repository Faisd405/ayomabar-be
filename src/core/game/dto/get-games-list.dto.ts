import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetGamesListSchema = z.object({
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
  search: z
    .string()
    .optional()
    .describe('Search term to filter games by title'),
  genre: z
    .string()
    .optional()
    .describe('Filter games by genre'),
  platform: z
    .string()
    .optional()
    .describe('Filter games by platform'),
  sortBy: z
    .enum(['title', 'createdAt', 'updatedAt', 'releaseDate'])
    .optional()
    .default('createdAt')
    .describe('Field to sort by'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc')
    .describe('Sort order'),
});

export class GetGamesListDto extends createZodDto(GetGamesListSchema) {}
