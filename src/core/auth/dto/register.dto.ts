import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must not exceed 100 characters')
    .describe('The full name of the user'),
  email: z
    .string()
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters')
    .describe('The email address of the user'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username must not exceed 50 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens',
    )
    .describe('The username of the user'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must not exceed 100 characters')
    .describe('The password of the user'),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
