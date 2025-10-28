import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { UpdateMatchDto } from '../dto/update-match.dto';

@Injectable()
export class UpdateMatchUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number, matchId: number, data: UpdateMatchDto) {
    // Check if match exists
    const existingMatch = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        deletedAt: null,
      },
    });

    if (!existingMatch) {
      throw new NotFoundException('Match not found');
    }

    // Check if user is the creator of the match
    if (existingMatch.userId !== userId) {
      throw new ForbiddenException('You are not authorized to update this match');
    }

    // If gameId is being updated, check if the game exists
    if (data.gameId) {
      const game = await this.prisma.game.findFirst({
        where: {
          id: data.gameId,
          deletedAt: null,
        },
      });

      if (!game) {
        throw new NotFoundException('Game not found');
      }
    }

    // Update match
    return this.prisma.match.update({
      where: { id: matchId },
      data: {
        ...(data.gameId && { gameId: data.gameId }),
        ...(data.maxPlayers !== undefined && { maxPlayers: data.maxPlayers }),
        ...(data.status && { status: data.status }),
        ...(data.scheduledAt !== undefined && {
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        }),
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            genre: true,
            platform: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }
}
