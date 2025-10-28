import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameControllerV1 } from './game.controller';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import {
  CreateGameUseCase,
  UpdateGameUseCase,
  GetGameByIdUseCase,
  DeleteGameUseCase,
  GetGamesListUseCase,
} from './use-cases';

@Module({
  controllers: [GameControllerV1],
  providers: [
    GameService,
    PrismaService,
    CreateGameUseCase,
    UpdateGameUseCase,
    GetGameByIdUseCase,
    DeleteGameUseCase,
    GetGamesListUseCase,
  ],
  exports: [GameService],
})
export class GameModule {}
