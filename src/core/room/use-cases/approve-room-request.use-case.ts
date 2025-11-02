import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class ApproveRoomRequestUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(hostUserId: number, requestId: number) {
    // Find the room request with room details
    const roomRequest = await this.prisma.roomRequest.findFirst({
      where: {
        id: requestId,
        deletedAt: null,
      },
      include: {
        room: {
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
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!roomRequest) {
      throw new NotFoundException('Room request not found');
    }

    // Check if the user is the host of the room
    if (roomRequest.room.userId !== hostUserId) {
      throw new ForbiddenException('Only the room host can approve requests');
    }

    // Check if room is public (public rooms auto-accept, no manual approval needed)
    if (roomRequest.room.roomType === 'public') {
      throw new BadRequestException('Public rooms do not require manual approval');
    }

    // Check if request is already processed
    if (roomRequest.status === 'accepted') {
      throw new BadRequestException('This request has already been accepted');
    }

    if (roomRequest.status === 'rejected') {
      throw new BadRequestException('This request has already been rejected');
    }

    // Check if room is full
    const currentParticipants = roomRequest.room._count.RoomRequest;
    if (currentParticipants >= roomRequest.room.maxPlayers) {
      throw new BadRequestException('Room is full, cannot accept more players');
    }

    // Approve the request
    const updatedRequest = await this.prisma.roomRequest.update({
      where: {
        id: requestId,
      },
      data: {
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
      ...updatedRequest,
      message: 'Room request approved successfully',
    };
  }
}
