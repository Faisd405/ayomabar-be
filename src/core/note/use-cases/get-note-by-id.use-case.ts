import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class GetNoteByIdUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    const note = await this.prisma.note.findUnique({
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

    if (!note) {
      throw new Error(`Note with ID ${id} not found`);
    }

    return note;
  }
}