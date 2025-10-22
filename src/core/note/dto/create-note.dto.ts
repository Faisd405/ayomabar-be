import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateNoteSchema = z.object({
  content: z
    .string()
    .min(1, 'Note content cannot be empty')
    .max(1000, 'Note content must not exceed 1000 characters')
    .describe('The content of the note'),
  userId: z
    .number()
    .int()
    .positive('User ID must be a positive integer')
    .describe('The ID of the user who owns this note'),
});

export class CreateNoteDto extends createZodDto(CreateNoteSchema) {}