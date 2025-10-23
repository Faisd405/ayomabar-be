import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthControllerV1 } from './auth.controller';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import {
  RegisterUseCase,
  ValidateUserUseCase,
  GenerateTokensUseCase,
  RefreshTokenUseCase,
} from './use-cases';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '15m';
        return {
          secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthControllerV1],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    JwtAuthGuard,
    RegisterUseCase,
    ValidateUserUseCase,
    GenerateTokensUseCase,
    RefreshTokenUseCase,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
