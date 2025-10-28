import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import appConfig from './config/app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware, CorsMiddleware } from './common/middleware';
import { UserModule } from './core/user/user.module';
import { NoteModule } from './core/note/note.module';
import { AuthModule } from './core/auth/auth.module';
import { GameModule } from './core/game/game.module';
import { MatchModule } from './core/match/match.module';
import { HealthModule } from './health/health.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    AuthModule,
    UserModule,
    NoteModule,
    GameModule,
    MatchModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  static port: number;
  static appVersion: string;
  static appPrefix: string;
  static environment: string;
  constructor(private readonly configService: ConfigService) {
    AppModule.port = +this.configService.get('APP_PORT', '3333');
    AppModule.appVersion = this.configService.get('APP_VERSION', '1');
    AppModule.appPrefix = this.configService.get('APP_PREFIX', 'api');
    AppModule.environment = this.configService.get('NODE_ENV', 'development');
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, CorsMiddleware).forRoutes({
      path: '/*',
      method: RequestMethod.ALL,
    });
  }
}
