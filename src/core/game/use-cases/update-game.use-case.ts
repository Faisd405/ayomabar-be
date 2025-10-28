import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { UpdateGameDto } from '../dto/update-game.dto';

@Injectable()
export class UpdateGameUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number, data: UpdateGameDto) {
    // Check if game exists
    const existingGame = await this.prisma.game.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingGame) {
      throw new NotFoundException('Game not found');
    }

    // Update game
    return this.prisma.game.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.genre !== undefined && { genre: data.genre }),
        ...(data.platform !== undefined && { platform: data.platform }),
        ...(data.releaseDate !== undefined && {
          releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
        }),
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
