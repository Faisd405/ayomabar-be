import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetUsersListSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, 'Page must be at least 1')
    .default(1)
    .optional()
    .describe('Page number for pagination'),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .default(10)
    .optional()
    .describe('Number of items per page'),
  search: z
    .string()
    .max(50, 'Search term must not exceed 50 characters')
    .optional()
    .describe('Search users by username (case-insensitive)'),
});

export class GetUsersListDto extends createZodDto(GetUsersListSchema) {}
