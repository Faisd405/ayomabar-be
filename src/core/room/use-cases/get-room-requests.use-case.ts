import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class GetRoomRequestsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(hostUserId: number, roomId: number) {
    // Check if room exists and user is the host
    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        deletedAt: null,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.userId !== hostUserId) {
      throw new ForbiddenException('Only the room host can view room requests');
    }

    // Get all room requests for this room
    const requests = await this.prisma.roomRequest.findMany({
      where: {
        roomId,
        deletedAt: null,
      },
      include: {
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      roomId,
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      accepted: requests.filter((r) => r.status === 'accepted').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      requests,
    };
  }
}
