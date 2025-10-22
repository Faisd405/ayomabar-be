import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { GetNotesListDto } from '../dto/get-notes-list.dto';

@Injectable()
export class GetNotesListUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetNotesListDto) {
    const { page = 1, limit = 10, userId, search } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (search) {
      where.content = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get notes with pagination
    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          }
        }
      }),
      this.prisma.note.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      notes,
      total,
      page,
      limit,
      totalPages
    };
  }
}