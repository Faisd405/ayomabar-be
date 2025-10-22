import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { CreateNoteDto } from '../dto/create-note.dto';

@Injectable()
export class CreateNoteUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: CreateNoteDto) {
    // Verify user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!userExists) {
      throw new Error(`User with ID ${data.userId} not found`);
    }

    return this.prisma.note.create({
      data: {
        content: data.content,
        userId: data.userId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }
}