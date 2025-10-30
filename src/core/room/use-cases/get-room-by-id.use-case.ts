import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class GetRoomByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    const room = await this.prisma.room.findFirst({
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
        RoomRequest: {
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

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return {
      ...room,
      participantsCount: room.RoomRequest.length,
      participants: room.RoomRequest,
    };
  }
}
