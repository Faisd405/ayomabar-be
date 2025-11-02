import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const JoinRoomSchema = z.object({
  roomId: z.number().int().positive(),
});

export class JoinRoomDto extends createZodDto(JoinRoomSchema) {}
