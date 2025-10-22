import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';

@Injectable()
export class RobloxSecurityService {
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.ROBLOX_SECRET_KEY || 'default-secret-key';
  }

  /**
   * Validates request signature from Roblox
   * @param signature The signature from x-roblox-signature header
   * @param body The request body
   * @param timestamp The timestamp from x-roblox-timestamp header
   * @returns true if signature is valid
   */
  validateSignature(
    signature: string,
    body: Record<string, unknown>,
    timestamp: number,
  ): boolean {
    try {
      // Check timestamp is not too old (5 minutes)
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - timestamp) > 300) {
        return false;
      }

      // Generate expected signature
      const payload = JSON.stringify(body) + timestamp.toString();
      const expectedSignature = createHmac('sha256', this.secretKey)
        .update(payload)
        .digest('hex');

      return signature === expectedSignature;
    } catch {
      return false;
    }
  }

  /**
   * Validates Roblox User ID
   * For now, this is a placeholder. In production, you might want to:
   * - Check against Roblox API
   * - Validate user exists in your database
   * - Check user permissions
   * @param userId The Roblox user ID
   * @returns true if user ID is valid
   */
  validateRobloxUserId(userId: number): boolean {
    // Basic validation: userId must be positive integer
    if (!Number.isInteger(userId) || userId <= 0) {
      return false;
    }

    // TODO: Add additional validation logic here
    // - Check Roblox API
    // - Verify user exists in database
    // - Check user permissions/whitelist

    return true;
  }
}
