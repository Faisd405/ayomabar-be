import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { GetRoomsListDto } from '../dto/get-rooms-list.dto';
import { Prisma } from 'generated/prisma';

@Injectable()
export class GetRoomsListUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetRoomsListDto) {
    const { page, limit, gameId, userId, status, typePlay, roomType, sortBy, sortOrder } = query;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.RoomWhereInput = {
      deletedAt: null,
      ...(gameId && { gameId }),
      ...(userId && { userId }),
      ...(status && { status }),
      ...(typePlay && { typePlay }),
      ...(roomType && { roomType }),
    };

    // Build order by clause
    const orderBy: Prisma.RoomOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute queries
    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
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
          RoomRequest: {
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
      this.prisma.room.count({ where }),
    ]);

    // Add participants count to each room
    const roomsWithCount = rooms.map((room) => ({
      ...room,
      participantsCount: room.RoomRequest.length,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: roomsWithCount,
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
