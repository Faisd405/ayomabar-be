import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { GetUsersListDto } from '../dto/get-users-list.dto';

@Injectable()
export class GetUsersListUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUsersListDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
      ? {
          username: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    // Get users with pagination
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              notes: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
