import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteControllerV1 } from './note.controller';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import {
  CreateNoteUseCase,
  UpdateNoteUseCase,
  GetNotesListUseCase,
  GetNoteByIdUseCase,
  DeleteNoteUseCase
} from './use-cases';

@Module({
  controllers: [NoteControllerV1],
  providers: [
    NoteService,
    PrismaService,
    CreateNoteUseCase,
    UpdateNoteUseCase,
    GetNotesListUseCase,
    GetNoteByIdUseCase,
    DeleteNoteUseCase
  ],
  exports: [NoteService]
})
export class NoteModule {}