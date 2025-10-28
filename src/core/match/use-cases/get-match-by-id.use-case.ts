import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class GetMatchByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    const match = await this.prisma.match.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            genre: true,
            platform: true,
            releaseDate: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
            playstyle: true,
          },
        },
        MatchRequest: {
          where: {
            deletedAt: null,
            status: 'accepted',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return {
      ...match,
      participantsCount: match.MatchRequest.length,
      participants: match.MatchRequest,
    };
  }
}
