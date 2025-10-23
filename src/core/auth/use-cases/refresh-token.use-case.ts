import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { JwtPayload, TokenResponse } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(refreshToken: string): Promise<TokenResponse> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret:
            this.configService.get<string>('JWT_REFRESH_SECRET') ||
            'your-refresh-secret-key',
        },
      );

      // Get user from database to ensure they still exist
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          username: true,
          email: true,
          roles: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const newPayload: JwtPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, {
        secret:
          this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      });

      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'your-refresh-secret-key',
        expiresIn: '7d',
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900, // 15 minutes in seconds
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
