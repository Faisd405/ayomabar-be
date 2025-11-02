import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class JoinRoomUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number, roomId: number) {
    // Check if room exists and is open
    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            RoomRequest: {
              where: {
                status: 'accepted',
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if room status is open
    if (room.status !== 'open') {
      throw new BadRequestException('Room is not open for joining');
    }

    // Check if room is full
    const currentParticipants = room._count.RoomRequest;
    if (currentParticipants >= room.maxPlayers) {
      throw new BadRequestException('Room is full');
    }

    // Check if user already has a request for this room
    const existingRequest = await this.prisma.roomRequest.findFirst({
      where: {
        roomId,
        userId,
        deletedAt: null,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('You have already requested to join this room');
    }

    // For open rooms, auto-accept the request
    const roomRequest = await this.prisma.roomRequest.create({
      data: {
        roomId,
        userId,
        status: room.roomType === 'public' ? 'accepted' : 'pending',
        isHost: false,
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
        room: {
          select: {
            id: true,
            gameId: true,
            minPlayers: true,
            maxPlayers: true,
            typePlay: true,
            roomType: true,
            status: true,
            scheduledAt: true,
            game: {
              select: {
                id: true,
                title: true,
                genre: true,
                platform: true,
              },
            },
          },
        },
      },
    });

    return {
      ...roomRequest,
      message: room.roomType === 'public' 
        ? 'Successfully joined the room' 
        : 'Join request sent, waiting for host approval',
    };
  }
}
