import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { CreateRoomDto } from '../dto/create-room.dto';

@Injectable()
export class CreateRoomUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number, data: CreateRoomDto) {
    // Check if game exists
    const game = await this.prisma.game.findFirst({
      where: {
        id: data.gameId,
        deletedAt: null,
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Create new room
    const room = await this.prisma.room.create({
      data: {
        gameId: data.gameId,
        userId,
        minSlot: data.minSlot ?? 1,
        maxSlot: data.maxSlot ?? 1,
        rankMinId: data.rankMinId,
        rankMaxId: data.rankMaxId,
        typePlay: data.typePlay ?? 'casual',
        roomType: data.roomType ?? 'public',
        roomCode: data.roomCode,
        status: data.status ?? 'open',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
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

    // Automatically create a room request for the creator as host
    await this.prisma.roomRequest.create({
      data: {
        roomId: room.id,
        userId,
        status: 'accepted',
        isHost: true,
      },
    });

    return room;
  }
}
