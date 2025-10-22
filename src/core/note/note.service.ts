import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import {
  CreateNoteUseCase,
  UpdateNoteUseCase,
  GetNotesListUseCase,
  GetNoteByIdUseCase,
  DeleteNoteUseCase
} from './use-cases';
import {
  CreateNoteDto,
  UpdateNoteDto,
  GetNotesListDto
} from './dto';

@Injectable()
export class NoteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createNoteUseCase: CreateNoteUseCase,
    private readonly updateNoteUseCase: UpdateNoteUseCase,
    private readonly getNotesListUseCase: GetNotesListUseCase,
    private readonly getNoteByIdUseCase: GetNoteByIdUseCase,
    private readonly deleteNoteUseCase: DeleteNoteUseCase,
  ) {}

  async createNote(data: CreateNoteDto) {
    return this.createNoteUseCase.execute(data);
  }

  async updateNote(id: number, data: UpdateNoteDto) {
    return this.updateNoteUseCase.execute(id, data);
  }

  async getNotesList(query: GetNotesListDto) {
    return this.getNotesListUseCase.execute(query);
  }

  async getNoteById(id: number) {
    return this.getNoteByIdUseCase.execute(id);
  }

  async deleteNote(id: number) {
    return this.deleteNoteUseCase.execute(id);
  }
}