import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { GetMatchesListDto } from '../dto/get-matches-list.dto';
import { Prisma } from 'generated/prisma';

@Injectable()
export class GetMatchesListUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMatchesListDto) {
    const { page, limit, gameId, userId, status, sortBy, sortOrder } = query;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.MatchWhereInput = {
      deletedAt: null,
      ...(gameId && { gameId }),
      ...(userId && { userId }),
      ...(status && { status }),
    };

    // Build order by clause
    const orderBy: Prisma.MatchOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute queries
    const [matches, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        orderBy,
        skip,
        take,
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
          MatchRequest: {
            where: {
              deletedAt: null,
              status: 'accepted',
            },
            select: {
              id: true,
              userId: true,
              isHost: true,
            },
          },
        },
      }),
      this.prisma.match.count({ where }),
    ]);

    // Add participants count to each match
    const matchesWithCount = matches.map((match) => ({
      ...match,
      participantsCount: match.MatchRequest.length,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: matchesWithCount,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
