import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { CreateGameDto } from '../dto/create-game.dto';

@Injectable()
export class CreateGameUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: CreateGameDto) {
    // Check if game with the same title already exists
    const existingGame = await this.prisma.game.findFirst({
      where: {
        title: data.title,
        deletedAt: null,
      },
    });

    if (existingGame) {
      throw new ConflictException('Game with this title already exists');
    }

    // Create new game
    return this.prisma.game.create({
      data: {
        title: data.title,
        genre: data.genre,
        platform: data.platform,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
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
  }
}
