import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .describe('The username or email of the user'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .describe('The password of the user'),
});

export class LoginDto extends createZodDto(LoginSchema) {}
