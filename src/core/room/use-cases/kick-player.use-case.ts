import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class KickPlayerUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(hostUserId: number, roomId: number, targetUserId: number) {
    // Check if room exists
    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        deletedAt: null,
      },
      include: {
        game: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Verify that the requesting user is the host
    if (room.userId !== hostUserId) {
      throw new ForbiddenException('Only the room host can kick players');
    }

    // Prevent host from kicking themselves
    if (targetUserId === hostUserId) {
      throw new BadRequestException('You cannot kick yourself from your own room');
    }

    // Find the target user's room request
    const roomRequest = await this.prisma.roomRequest.findFirst({
      where: {
        roomId,
        userId: targetUserId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    if (!roomRequest) {
      throw new NotFoundException('User is not in this room');
    }

    // Check if target is also a host (shouldn't be possible, but safety check)
    if (roomRequest.isHost) {
      throw new ForbiddenException('Cannot kick another host from the room');
    }

    // Soft delete the room request (kick the player)
    await this.prisma.roomRequest.update({
      where: {
        id: roomRequest.id,
      },
      data: {
        deletedAt: new Date(),
        status: 'rejected', // Mark as rejected to indicate they were kicked
      },
    });

    return {
      message: `Successfully kicked ${roomRequest.user.username} from the room`,
      kickedUser: {
        id: roomRequest.user.id,
        username: roomRequest.user.username,
        name: roomRequest.user.name,
      },
      room: {
        id: room.id,
        gameTitle: room.game.title,
      },
    };
  }
}
