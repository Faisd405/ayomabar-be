import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class DeleteRoomUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number, roomId: number) {
    // Check if room exists
    const existingRoom = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        deletedAt: null,
      },
    });

    if (!existingRoom) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is the creator of the room
    if (existingRoom.userId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this room');
    }

    // Soft delete the room (and related room requests will be cascade deleted)
    await this.prisma.room.update({
      where: { id: roomId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Room deleted successfully',
    };
  }
}
