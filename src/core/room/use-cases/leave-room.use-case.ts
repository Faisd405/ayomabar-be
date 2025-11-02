import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class LeaveRoomUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number, roomId: number) {
    // Find the room request
    const roomRequest = await this.prisma.roomRequest.findFirst({
      where: {
        roomId,
        userId,
        deletedAt: null,
      },
    });

    if (!roomRequest) {
      throw new NotFoundException('You are not a member of this room');
    }

    // Check if user is the host
    if (roomRequest.isHost) {
      throw new ForbiddenException('Host cannot leave the room. Please delete the room instead.');
    }

    // Soft delete the room request
    await this.prisma.roomRequest.update({
      where: {
        id: roomRequest.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Successfully left the room',
    };
  }
}
