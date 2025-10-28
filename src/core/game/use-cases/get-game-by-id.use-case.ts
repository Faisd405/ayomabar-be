import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class GetGameByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    const game = await this.prisma.game.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        genre: true,
        platform: true,
        releaseDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }
}
