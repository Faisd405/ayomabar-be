import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import {
  CreateGameUseCase,
  UpdateGameUseCase,
  GetGameByIdUseCase,
  DeleteGameUseCase,
  GetGamesListUseCase,
} from './use-cases';
import {
  CreateGameDto,
  UpdateGameDto,
  GetGamesListDto,
} from './dto';

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createGameUseCase: CreateGameUseCase,
    private readonly updateGameUseCase: UpdateGameUseCase,
    private readonly getGameByIdUseCase: GetGameByIdUseCase,
    private readonly deleteGameUseCase: DeleteGameUseCase,
    private readonly getGamesListUseCase: GetGamesListUseCase,
  ) {}

  async createGame(data: CreateGameDto) {
    return this.createGameUseCase.execute(data);
  }

  async updateGame(id: number, data: UpdateGameDto) {
    return this.updateGameUseCase.execute(id, data);
  }

  async getGameById(id: number) {
    return this.getGameByIdUseCase.execute(id);
  }

  async deleteGame(id: number) {
    return this.deleteGameUseCase.execute(id);
  }

  async getGamesList(query: GetGamesListDto) {
    return this.getGamesListUseCase.execute(query);
  }
}
