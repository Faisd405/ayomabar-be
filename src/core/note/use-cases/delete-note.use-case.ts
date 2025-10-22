import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class DeleteNoteUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    // Check if note exists
    const existingNote = await this.prisma.note.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!existingNote) {
      throw new Error(`Note with ID ${id} not found`);
    }

    await this.prisma.note.delete({
      where: { id }
    });

    return existingNote;
  }
}