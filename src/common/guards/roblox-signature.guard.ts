import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { RobloxSecurityService } from '../services/roblox-security/roblox-security.service';

interface RobloxRequest extends Request {
  robloxData?: {
    userId: number;
    timestamp: number;
    validated: boolean;
  };
}

/**
 * Guard untuk validasi request signature dari Roblox game
 * Memastikan request berasal dari game yang valid dengan signature yang benar
 *
 * Usage: @UseGuards(RobloxSignatureGuard)
 */
@Injectable()
export class RobloxSignatureGuard implements CanActivate {
  constructor(private readonly robloxSecurity: RobloxSecurityService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RobloxRequest>();

    // Extract signature headers
    const signature = request.headers['x-roblox-signature'] as
      | string
      | undefined;
    const timestampStr = request.headers['x-roblox-timestamp'] as
      | string
      | undefined;
    const userIdStr = request.headers['x-roblox-userid'] as string | undefined;

    // Validate headers exist
    if (!signature || !timestampStr || !userIdStr) {
      throw new UnauthorizedException(
        'Missing Roblox signature headers (x-roblox-signature, x-roblox-timestamp, x-roblox-userid)',
      );
    }

    // Parse values
    const timestamp = parseInt(timestampStr, 10);
    const userId = parseInt(userIdStr, 10);

    if (isNaN(timestamp) || isNaN(userId)) {
      throw new UnauthorizedException('Invalid timestamp or userId format');
    }

    // Validate signature
    const isValid = this.robloxSecurity.validateSignature(
      signature,
      request.body as Record<string, unknown>,
      timestamp,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid Roblox signature');
    }

    // Validate Roblox User ID
    const isValidUser = this.robloxSecurity.validateRobloxUserId(userId);
    if (!isValidUser) {
      throw new UnauthorizedException('Invalid Roblox User ID');
    }

    // Attach validated data to request
    request.robloxData = {
      userId,
      timestamp,
      validated: true,
    };

    return true;
  }
}
