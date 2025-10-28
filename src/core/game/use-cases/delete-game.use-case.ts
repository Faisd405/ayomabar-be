import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class DeleteGameUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
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

    // Soft delete the game
    await this.prisma.game.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Game deleted successfully',
    };
  }
}
