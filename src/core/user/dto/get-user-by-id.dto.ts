import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetUserByIdSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive('User ID must be a positive integer')
    .describe('The unique identifier of the user'),
});

export class GetUserByIdDto extends createZodDto(GetUserByIdSchema) {}
