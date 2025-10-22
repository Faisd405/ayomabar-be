import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateNoteSchema = z.object({
  content: z
    .string()
    .min(1, 'Note content cannot be empty')
    .max(1000, 'Note content must not exceed 1000 characters')
    .describe('The updated content of the note'),
});

export class UpdateNoteDto extends createZodDto(UpdateNoteSchema) {}