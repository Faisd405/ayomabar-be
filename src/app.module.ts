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
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    AuthModule,
    UserModule,
    NoteModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
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
