import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class DeleteMatchUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number, matchId: number) {
    // Check if match exists
    const existingMatch = await this.prisma.match.findFirst({
      where: {
        id: matchId,
        deletedAt: null,
      },
    });

    if (!existingMatch) {
      throw new NotFoundException('Match not found');
    }

    // Check if user is the creator of the match
    if (existingMatch.userId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this match');
    }

    // Soft delete the match (and related match requests will be cascade deleted)
    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Match deleted successfully',
    };
  }
}
