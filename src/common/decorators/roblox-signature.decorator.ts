import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Decorator untuk mengekstrak Roblox signature headers dari request
 * Usage: @RobloxSignature() signature: RobloxSignatureData
 */
export const RobloxSignature = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-roblox-signature'] as
      | string
      | undefined;
    const timestampStr = request.headers['x-roblox-timestamp'] as
      | string
      | undefined;
    const userIdStr = request.headers['x-roblox-userid'] as string | undefined;

    return {
      signature,
      timestamp: timestampStr ? parseInt(timestampStr, 10) : undefined,
      userId: userIdStr ? parseInt(userIdStr, 10) : undefined,
    };
  },
);

export interface RobloxSignatureData {
  signature?: string;
  timestamp?: number;
  userId?: number;
}
