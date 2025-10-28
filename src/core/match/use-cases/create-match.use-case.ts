import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { CreateMatchDto } from '../dto/create-match.dto';

@Injectable()
export class CreateMatchUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number, data: CreateMatchDto) {
    // Check if game exists
    const game = await this.prisma.game.findFirst({
      where: {
        id: data.gameId,
        deletedAt: null,
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Create new match
    const match = await this.prisma.match.create({
      data: {
        gameId: data.gameId,
        userId,
        maxPlayers: data.maxPlayers ?? 1,
        status: data.status ?? 'open',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
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

    // Automatically create a match request for the creator as host
    await this.prisma.matchRequest.create({
      data: {
        matchId: match.id,
        userId,
        status: 'accepted',
        isHost: true,
      },
    });

    return match;
  }
}
