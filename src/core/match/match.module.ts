import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchControllerV1 } from './match.controller';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import {
  CreateMatchUseCase,
  UpdateMatchUseCase,
  GetMatchByIdUseCase,
  DeleteMatchUseCase,
  GetMatchesListUseCase,
} from './use-cases';

@Module({
  controllers: [MatchControllerV1],
  providers: [
    MatchService,
    PrismaService,
    CreateMatchUseCase,
    UpdateMatchUseCase,
    GetMatchByIdUseCase,
    DeleteMatchUseCase,
    GetMatchesListUseCase,
  ],
  exports: [MatchService],
})
export class MatchModule {}
