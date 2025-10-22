import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Delete user (cascade will delete related notes)
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      id,
      message: 'User deleted successfully',
    };
  }
}
