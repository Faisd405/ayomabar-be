import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { ReportPlayerDto } from '../dto/report-player.dto';

@Injectable()
export class ReportPlayerUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(reporterId: number, roomId: number, reportedUserId: number, data: ReportPlayerDto) {
    // Check if room exists
    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        deletedAt: null,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Prevent self-reporting
    if (reporterId === reportedUserId) {
      throw new BadRequestException('You cannot report yourself');
    }

    // Verify that the reporter is/was in the room
    const reporterRequest = await this.prisma.roomRequest.findFirst({
      where: {
        roomId,
        userId: reporterId,
      },
    });

    if (!reporterRequest) {
      throw new BadRequestException('You must be a member of this room to report players');
    }

    // Verify that the reported user is/was in the room
    const reportedUserRequest = await this.prisma.roomRequest.findFirst({
      where: {
        roomId,
        userId: reportedUserId,
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

    if (!reportedUserRequest) {
      throw new NotFoundException('The reported user is not in this room');
    }

    // Check if user has already reported this player in this room
    const existingReport = await this.prisma.playerReport.findFirst({
      where: {
        roomId,
        reporterId,
        reportedUserId,
      },
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this player in this room');
    }

    // Create the report
    const report = await this.prisma.playerReport.create({
      data: {
        roomId,
        reporterId,
        reportedUserId,
        reason: data.reason,
        status: 'pending',
      },
    });

    return {
      message: `Successfully reported ${reportedUserRequest.user.username}`,
      report: {
        id: report.id,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
      },
      reportedUser: {
        id: reportedUserRequest.user.id,
        username: reportedUserRequest.user.username,
        name: reportedUserRequest.user.name,
      },
      room: {
        id: room.id,
        gameTitle: room.game.title,
      },
    };
  }
}
