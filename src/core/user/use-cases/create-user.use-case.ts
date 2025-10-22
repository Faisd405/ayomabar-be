import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: CreateUserDto) {
    // Check if user with email already exists
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if user with username already exists
    const existingUserByUsername = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUserByUsername) {
      throw new ConflictException('User with this username already exists');
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await argon2.hash(data.password);
    }

    // Create new user
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        password: hashedPassword,
        roles: data.roles || ['user'],
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
