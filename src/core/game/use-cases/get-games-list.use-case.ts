import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { GetGamesListDto } from '../dto/get-games-list.dto';
import { Prisma } from 'generated/prisma';

@Injectable()
export class GetGamesListUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetGamesListDto) {
    const { page, limit, search, genre, platform, sortBy, sortOrder } = query;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.GameWhereInput = {
      deletedAt: null,
      ...(search && {
        title: {
          contains: search,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
      ...(genre && {
        genre: {
          contains: genre,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
      ...(platform && {
        platform: {
          contains: platform,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      }),
    };

    // Build order by clause
    const orderBy: Prisma.GameOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute queries
    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          title: true,
          genre: true,
          platform: true,
          releaseDate: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.game.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: games,
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
