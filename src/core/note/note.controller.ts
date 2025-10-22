import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  ParseIntPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { NoteService } from './note.service';
import { successResponse } from 'src/utils/response.utils';
import {
  CreateNoteDto,
  UpdateNoteDto,
  GetNotesListDto
} from './dto';

@ApiTags('note')
@Controller({ path: 'note', version: '1' })
export class NoteControllerV1 {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new note',
    description: 'Creates a new note for a specific user. The user must exist in the system.'
  })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    schema: {
      example: {
        success: true,
        message: 'Note created successfully',
        data: {
          id: 1,
          content: 'This is my first note',
          userId: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          user: {
            id: 1,
            username: 'john_doe'
          }
        }
      }
    }
  })
  async createNote(@Body() createNoteDto: CreateNoteDto) {
    try {
      const note = await this.noteService.createNote(createNoteDto);
      return successResponse(note, 'Note created successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get paginated list of notes',
    description: 'Retrieves a paginated list of notes with optional filtering by user and search functionality.'
  })
  @ApiResponse({
    status: 200,
    description: 'Notes retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Notes retrieved successfully',
        data: {
          notes: [
            {
              id: 1,
              content: 'This is my first note',
              userId: 1,
              createdAt: '2024-01-01T00:00:00.000Z',
              user: {
                id: 1,
                username: 'john_doe'
              }
            }
          ],
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3
        }
      }
    }
  })
  async getNotesList(@Query() query: GetNotesListDto) {
    const result = await this.noteService.getNotesList(query);
    return successResponse(result, 'Notes retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get note by ID',
    description: 'Retrieves a specific note by its ID including user information.'
  })
  @ApiResponse({
    status: 200,
    description: 'Note retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Note retrieved successfully',
        data: {
          id: 1,
          content: 'This is my first note',
          userId: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          user: {
            id: 1,
            username: 'john_doe'
          }
        }
      }
    }
  })
  async getNoteById(@Param('id', ParseIntPipe) id: number) {
    try {
      const note = await this.noteService.getNoteById(id);
      return successResponse(note, 'Note retrieved successfully');
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update note by ID',
    description: 'Updates an existing note content. Only the note content can be modified.'
  })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Note updated successfully',
        data: {
          id: 1,
          content: 'This is my updated note',
          userId: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          user: {
            id: 1,
            username: 'john_doe'
          }
        }
      }
    }
  })
  async updateNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoteDto: UpdateNoteDto
  ) {
    try {
      const note = await this.noteService.updateNote(id, updateNoteDto);
      return successResponse(note, 'Note updated successfully');
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete note by ID',
    description: 'Permanently deletes a note from the system. This action cannot be undone.'
  })
  @ApiResponse({
    status: 200,
    description: 'Note deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Note deleted successfully',
        data: {
          id: 1,
          content: 'This note was deleted',
          userId: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          user: {
            id: 1,
            username: 'john_doe'
          }
        }
      }
    }
  })
  async deleteNote(@Param('id', ParseIntPipe) id: number) {
    try {
      const deletedNote = await this.noteService.deleteNote(id);
      return successResponse(deletedNote, 'Note deleted successfully');
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}