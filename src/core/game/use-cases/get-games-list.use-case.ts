import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { GetGamesListDto } from '../dto/get-games-list.dto';
import { Prisma } from 'generated/prisma';

@Injectable()
export class GetGamesListUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetGamesListDto) {
    const {
      page = 1,
      limit = 10,
      search,
      genre,
      platform,
      sortBy = 'title',
      sortOrder = 'asc',
    } = query;

    const pageNumber = Number(query.page) || 1;
    const limitNumber = Number(query.limit) || 10;

    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const where: Prisma.GameWhereInput = {
      deletedAt: null,
    };

    if (search && typeof search === 'string' && search.trim() !== '') {
      where.title = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    if (genre && typeof genre === 'string' && genre.trim() !== '') {
      where.genre = {
        contains: genre.trim(),
        mode: 'insensitive',
      };
    }

    if (platform && typeof platform === 'string' && platform.trim() !== '') {
      where.platform = {
        contains: platform.trim(),
        mode: 'insensitive',
      };
    }

    const orderBy: Prisma.GameOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

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

    const totalPages = Math.ceil(total / take);

    return {
      data: games,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
