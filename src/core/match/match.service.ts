import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import {
  CreateMatchUseCase,
  UpdateMatchUseCase,
  GetMatchByIdUseCase,
  DeleteMatchUseCase,
  GetMatchesListUseCase,
} from './use-cases';
import {
  CreateMatchDto,
  UpdateMatchDto,
  GetMatchesListDto,
} from './dto';

@Injectable()
export class MatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createMatchUseCase: CreateMatchUseCase,
    private readonly updateMatchUseCase: UpdateMatchUseCase,
    private readonly getMatchByIdUseCase: GetMatchByIdUseCase,
    private readonly deleteMatchUseCase: DeleteMatchUseCase,
    private readonly getMatchesListUseCase: GetMatchesListUseCase,
  ) {}

  async createMatch(userId: number, data: CreateMatchDto) {
    return this.createMatchUseCase.execute(userId, data);
  }

  async updateMatch(userId: number, matchId: number, data: UpdateMatchDto) {
    return this.updateMatchUseCase.execute(userId, matchId, data);
  }

  async getMatchById(id: number) {
    return this.getMatchByIdUseCase.execute(id);
  }

  async deleteMatch(userId: number, matchId: number) {
    return this.deleteMatchUseCase.execute(userId, matchId);
  }

  async getMatchesList(query: GetMatchesListDto) {
    return this.getMatchesListUseCase.execute(query);
  }
}
