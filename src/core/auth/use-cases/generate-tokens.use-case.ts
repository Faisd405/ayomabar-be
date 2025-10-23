import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, TokenResponse } from '../interfaces/jwt-payload.interface';

@Injectable()
export class GenerateTokensUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(user: {
    id: number;
    username: string;
    email: string;
    roles: string[];
  }): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };

    // Generate access token (short-lived)
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });

    // Generate refresh token (long-lived)
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'your-refresh-secret-key',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
