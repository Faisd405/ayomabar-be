import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { UpdateNoteDto } from '../dto/update-note.dto';

@Injectable()
export class UpdateNoteUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number, data: UpdateNoteDto) {
    // Check if note exists
    const existingNote = await this.prisma.note.findUnique({
      where: { id }
    });

    if (!existingNote) {
      throw new Error(`Note with ID ${id} not found`);
    }

    return this.prisma.note.update({
      where: { id },
      data: {
        content: data.content
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