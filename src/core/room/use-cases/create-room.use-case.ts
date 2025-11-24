import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { CreateRoomDto } from '../dto/create-room.dto';

@Injectable()
export class CreateRoomUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number, data: CreateRoomDto) {
    const now = new Date();

    // Check if user already has an ongoing room (open or in-progress)
    const existingRoom = await this.prisma.room.findFirst({
      where: {
        userId,
        status: {
          in: ['open', 'in-progress'],
        },
        deletedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      select: {
        id: true,
        status: true,
        game: {
          select: {
            title: true,
          },
        },
      },
    });

    if (existingRoom) {
      throw new BadRequestException(
        `You already have an ongoing room (Room #${existingRoom.id} - ${existingRoom.game.title}). Please close or complete it before creating a new one.`
      );
    }

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
