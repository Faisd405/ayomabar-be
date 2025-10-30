import {
  Controller,
  Body,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoomService } from './room.service';
import { successResponse } from 'src/utils/response.utils';
import {
  CreateRoomDto,
  UpdateRoomDto,
  GetRoomsListDto,
} from './dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/core/auth/decorators/current-user.decorator';

@ApiTags('room')
@Controller({ path: 'room', version: '1' })
export class RoomControllerV1 {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new room',
    description: 'Creates a new room with the provided information. Requires authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    schema: {
      example: {
        success: true,
        message: 'Room created successfully',
        data: {
          id: 1,
          gameId: 1,
          userId: 1,
          minPlayers: 2,
          maxPlayers: 4,
          rankMin: null,
          rankMax: null,
          typePlay: 'casual',
          roomType: 'public',
          status: 'open',
          scheduledAt: '2024-01-15T18:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          game: {
            id: 1,
            title: 'The Legend of Zelda: Breath of the Wild',
            genre: 'Action-adventure',
            platform: 'Nintendo Switch',
          },
          user: {
            id: 1,
            name: 'John Doe',
            username: 'john_doe',
            avatar: null,
          },
        },
        statusCode: 201,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Game not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @CurrentUser() user: any,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    const room = await this.roomService.createRoom(user.id, createRoomDto);
    return successResponse(
      room,
      'Room created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get a list of rooms',
    description: 'Retrieves a paginated list of rooms with optional filtering and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rooms retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Rooms retrieved successfully',
        data: {
          data: [
            {
              id: 1,
              gameId: 1,
              userId: 1,
              minPlayers: 2,
              maxPlayers: 4,
              rankMin: null,
              rankMax: null,
              typePlay: 'casual',
              roomType: 'public',
              status: 'open',
              scheduledAt: '2024-01-15T18:00:00.000Z',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
              game: {
                id: 1,
                title: 'The Legend of Zelda: Breath of the Wild',
                genre: 'Action-adventure',
                platform: 'Nintendo Switch',
              },
              user: {
                id: 1,
                name: 'John Doe',
                username: 'john_doe',
                avatar: null,
              },
              participantsCount: 2,
            },
          ],
          meta: {
            total: 50,
            page: 1,
            limit: 10,
            totalPages: 5,
            hasNextPage: true,
            hasPreviousPage: false,
          },
        },
        statusCode: 200,
      },
    },
  })
  async findAll(@Query() query: GetRoomsListDto) {
    const rooms = await this.roomService.getRoomsList(query);
    return successResponse(rooms, 'Rooms retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a room by ID',
    description: 'Retrieves detailed information about a specific room including participants.',
  })
  @ApiResponse({
    status: 200,
    description: 'Room retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Room retrieved successfully',
        data: {
          id: 1,
          gameId: 1,
          userId: 1,
          minPlayers: 2,
          maxPlayers: 4,
          rankMin: null,
          rankMax: null,
          typePlay: 'casual',
          roomType: 'public',
          status: 'open',
          scheduledAt: '2024-01-15T18:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          game: {
            id: 1,
            title: 'The Legend of Zelda: Breath of the Wild',
            genre: 'Action-adventure',
            platform: 'Nintendo Switch',
            releaseDate: '2017-03-03T00:00:00.000Z',
          },
          user: {
            id: 1,
            name: 'John Doe',
            username: 'john_doe',
            avatar: null,
            bio: 'Gamer',
            playstyle: 'casual',
          },
          participantsCount: 2,
          participants: [
            {
              id: 1,
              roomId: 1,
              userId: 1,
              status: 'accepted',
              isHost: true,
              user: {
                id: 1,
                name: 'John Doe',
                username: 'john_doe',
                avatar: null,
              },
            },
          ],
        },
        statusCode: 200,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Room not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const room = await this.roomService.getRoomById(id);
    return successResponse(room, 'Room retrieved successfully');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a room',
    description: 'Updates an existing room. Only the creator can update the room.',
  })
  @ApiResponse({
    status: 200,
    description: 'Room updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Room updated successfully',
        data: {
          id: 1,
          gameId: 1,
          userId: 1,
          minPlayers: 2,
          maxPlayers: 6,
          rankMin: 1,
          rankMax: 10,
          typePlay: 'competitive',
          roomType: 'public',
          status: 'in-progress',
          scheduledAt: '2024-01-15T18:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          game: {
            id: 1,
            title: 'The Legend of Zelda: Breath of the Wild',
            genre: 'Action-adventure',
            platform: 'Nintendo Switch',
          },
          user: {
            id: 1,
            name: 'John Doe',
            username: 'john_doe',
            avatar: null,
          },
        },
        statusCode: 200,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Room not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only the room creator can update',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async update(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    const room = await this.roomService.updateRoom(user.id, id, updateRoomDto);
    return successResponse(room, 'Room updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a room',
    description: 'Soft deletes a room from the system. Only the creator can delete the room.',
  })
  @ApiResponse({
    status: 200,
    description: 'Room deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Room deleted successfully',
        data: {
          message: 'Room deleted successfully',
        },
        statusCode: 200,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Room not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only the room creator can delete',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async remove(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.roomService.deleteRoom(user.id, id);
    return successResponse(result, 'Room deleted successfully');
  }
}
