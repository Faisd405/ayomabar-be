import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number, data: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if new email conflicts with another user
    if (data.email && data.email !== existingUser.email) {
      const emailConflict = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailConflict) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Check if new username conflicts with another user
    if (data.username && data.username !== existingUser.username) {
      const usernameConflict = await this.prisma.user.findUnique({
        where: { username: data.username },
      });

      if (usernameConflict) {
        throw new ConflictException('User with this username already exists');
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (data.password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(data.password, saltRounds);
    }

    // Update user
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.username && { username: data.username }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(data.roles && { roles: data.roles }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            notes: true,
          },
        },
      },
    });
  }
}
