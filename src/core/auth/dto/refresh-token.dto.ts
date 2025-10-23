import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RefreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token is required')
    .describe('The refresh token to generate a new access token'),
});

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}
