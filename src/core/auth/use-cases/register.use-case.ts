import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RegisterUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: RegisterDto) {
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

    // Hash password with bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        password: hashedPassword,
        roles: ['user'],
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}
