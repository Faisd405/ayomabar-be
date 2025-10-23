import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ValidateUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(username: string, password: string) {
    // Find user by username
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        password: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if password exists
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password with bcryptjs
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from return object
    const { password: _, ...result } = user;
    return result;
  }
}
