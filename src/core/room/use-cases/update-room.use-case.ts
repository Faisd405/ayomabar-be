import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { UpdateRoomDto } from '../dto/update-room.dto';

@Injectable()
export class UpdateRoomUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number, roomId: number, data: UpdateRoomDto) {
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
      throw new ForbiddenException('You are not authorized to update this room');
    }

    // If gameId is being updated, check if the game exists
    if (data.gameId) {
      const game = await this.prisma.game.findFirst({
        where: {
          id: data.gameId,
          deletedAt: null,
        },
      });

      if (!game) {
        throw new NotFoundException('Game not found');
      }
    }

    // Update room
    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        ...(data.gameId && { gameId: data.gameId }),
        ...(data.minSlot !== undefined && { minSlot: data.minSlot }),
        ...(data.maxSlot !== undefined && { maxSlot: data.maxSlot }),
        ...(data.rankMinId !== undefined && { rankMinId: data.rankMinId }),
        ...(data.rankMaxId !== undefined && { rankMaxId: data.rankMaxId }),
        ...(data.typePlay && { typePlay: data.typePlay }),
        ...(data.roomType && { roomType: data.roomType }),
        ...(data.roomCode !== undefined && { roomCode: data.roomCode }),
        ...(data.status && { status: data.status }),
        ...(data.scheduledAt !== undefined && {
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        }),
      },
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
      },
    });
  }
}
