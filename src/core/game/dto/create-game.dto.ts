import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateGameSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .describe('The title of the game'),
  genre: z
    .string()
    .max(100, 'Genre must not exceed 100 characters')
    .optional()
    .describe('The genre of the game'),
  platform: z
    .string()
    .max(100, 'Platform must not exceed 100 characters')
    .optional()
    .describe('The platform of the game'),
  releaseDate: z
    .string()
    .datetime('Invalid date format')
    .optional()
    .describe('The release date of the game'),
});

export class CreateGameDto extends createZodDto(CreateGameSchema) {}
