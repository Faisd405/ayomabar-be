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
  ReportPlayerDto,
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
          minSlot: 2,
          maxSlot: 4,
          rankMinId: null,
          rankMaxId: null,
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
              minSlot: 2,
              maxSlot: 4,
              rankMinId: null,
              rankMaxId: null,
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
          minSlot: 2,
          maxSlot: 4,
          rankMinId: null,
          rankMaxId: null,
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
          minSlot: 2,
          maxSlot: 6,
          rankMinId: 1,
          rankMaxId: 10,
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
  async remove(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.roomService.deleteRoom(user.id, id);
    return successResponse(result, 'Room deleted successfully');
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Join a room',
    description: 'Allows a user to join an open room. For public rooms, the request is auto-accepted. For private rooms, it requires host approval.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully joined the room or request sent',
    schema: {
      example: {
        success: true,
        message: 'Successfully joined the room',
        data: {
          id: 1,
          roomId: 1,
          userId: 2,
          status: 'accepted',
          isHost: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          user: {
            id: 2,
            name: 'Jane Doe',
            username: 'jane_doe',
            avatar: null,
          },
          room: {
            id: 1,
            gameId: 1,
            minSlot: 2,
            maxSlot: 4,
            typePlay: 'casual',
            roomType: 'public',
            status: 'open',
            scheduledAt: '2024-01-15T18:00:00.000Z',
            game: {
              id: 1,
              title: 'Valorant',
              genre: 'FPS',
              platform: 'PC',
            },
          },
          message: 'Successfully joined the room',
        },
        statusCode: 201,
      },
    },
  })
  async join(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.roomService.joinRoom(user.id, id);
    return successResponse(
      result,
      result.message || 'Successfully joined the room',
      HttpStatus.CREATED,
    );
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Leave a room',
    description: 'Allows a user to leave a room they have joined. Host cannot leave the room.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully left the room',
    schema: {
      example: {
        success: true,
        message: 'Successfully left the room',
        data: {
          message: 'Successfully left the room',
        },
        statusCode: 200,
      },
    },
  })
  async leave(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.roomService.leaveRoom(user.id, id);
    return successResponse(result, 'Successfully left the room');
  }

  @Get(':id/requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get room requests',
    description: 'Get all join requests for a room. Only the room host can view requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Room requests retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Room requests retrieved successfully',
        data: {
          roomId: 1,
          total: 5,
          pending: 2,
          accepted: 2,
          rejected: 1,
          requests: [
            {
              id: 1,
              roomId: 1,
              userId: 2,
              status: 'pending',
              isHost: false,
              createdAt: '2024-01-01T00:00:00.000Z',
              user: {
                id: 2,
                name: 'Jane Doe',
                username: 'jane_doe',
                avatar: null,
                bio: 'Casual gamer',
                playstyle: 'casual',
              },
            },
          ],
        },
        statusCode: 200,
      },
    },
  })
  async getRoomRequests(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.roomService.getRoomRequests(user.id, id);
    return successResponse(result, 'Room requests retrieved successfully');
  }

  @Put('request/:requestId/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Approve a room request',
    description: 'Approve a pending join request for a private room. Only the room host can approve. Public rooms auto-accept and do not need manual approval.',
  })
  @ApiResponse({
    status: 200,
    description: 'Room request approved successfully',
    schema: {
      example: {
        success: true,
        message: 'Room request approved successfully',
        data: {
          id: 1,
          roomId: 1,
          userId: 2,
          status: 'accepted',
          isHost: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          user: {
            id: 2,
            name: 'Jane Doe',
            username: 'jane_doe',
            avatar: null,
          },
          room: {
            id: 1,
            gameId: 1,
            minSlot: 2,
            maxSlot: 4,
            typePlay: 'competitive',
            roomType: 'private',
            status: 'open',
            scheduledAt: '2024-01-15T18:00:00.000Z',
            game: {
              id: 1,
              title: 'Valorant',
              genre: 'FPS',
              platform: 'PC',
            },
          },
          message: 'Room request approved successfully',
        },
        statusCode: 200,
      },
    },
  })
  async approveRequest(
    @CurrentUser() user: any,
    @Param('requestId', ParseIntPipe) requestId: number,
  ) {
    const result = await this.roomService.approveRoomRequest(user.id, requestId);
    return successResponse(
      result,
      result.message || 'Room request approved successfully',
    );
  }

  @Put('request/:requestId/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reject a room request',
    description: 'Reject a pending join request for a private room. Only the room host can reject. Public rooms auto-accept and do not need manual rejection.',
  })
  @ApiResponse({
    status: 200,
    description: 'Room request rejected successfully',
    schema: {
      example: {
        success: true,
        message: 'Room request rejected successfully',
        data: {
          id: 1,
          roomId: 1,
          userId: 2,
          status: 'rejected',
          isHost: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          user: {
            id: 2,
            name: 'Jane Doe',
            username: 'jane_doe',
            avatar: null,
          },
          room: {
            id: 1,
            gameId: 1,
            minSlot: 2,
            maxSlot: 4,
            typePlay: 'competitive',
            roomType: 'private',
            status: 'open',
            scheduledAt: '2024-01-15T18:00:00.000Z',
            game: {
              id: 1,
              title: 'Valorant',
              genre: 'FPS',
              platform: 'PC',
            },
          },
          message: 'Room request rejected successfully',
        },
        statusCode: 200,
      },
    },
  })
  async rejectRequest(
    @CurrentUser() user: any,
    @Param('requestId', ParseIntPipe) requestId: number,
  ) {
    const result = await this.roomService.rejectRoomRequest(user.id, requestId);
    return successResponse(
      result,
      result.message || 'Room request rejected successfully',
    );
  }

  @Delete(':id/kick/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kick a player from the room',
    description: 'Remove a player from the room. Only the room host can kick players. The host cannot kick themselves.',
  })
  @ApiResponse({
    status: 200,
    description: 'Player kicked successfully',
    schema: {
      example: {
        success: true,
        message: 'Successfully kicked player from the room',
        data: {
          message: 'Successfully kicked john_doe from the room',
          kickedUser: {
            id: 2,
            username: 'john_doe',
            name: 'John Doe',
          },
          room: {
            id: 1,
            gameTitle: 'Valorant',
          },
        },
        statusCode: 200,
      },
    },
  })
  async kickPlayer(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
  ) {
    const result = await this.roomService.kickPlayer(user.id, roomId, targetUserId);
    return successResponse(
      result,
      result.message || 'Successfully kicked player from the room',
    );
  }

  @Post(':id/report/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Report a player',
    description: 'Report a player for inappropriate behavior. Both the reporter and reported user must be/have been members of the room. Users cannot report themselves or report the same player multiple times in the same room.',
  })
  @ApiResponse({
    status: 201,
    description: 'Player reported successfully',
    schema: {
      example: {
        success: true,
        message: 'Successfully reported player',
        data: {
          message: 'Successfully reported john_doe',
          report: {
            id: 1,
            reason: 'Toxic behavior and harassment during the game',
            status: 'pending',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          reportedUser: {
            id: 2,
            username: 'john_doe',
            name: 'John Doe',
          },
          room: {
            id: 1,
            gameTitle: 'Valorant',
          },
        },
        statusCode: 201,
      },
    },
  })
  async reportPlayer(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) roomId: number,
    @Param('userId', ParseIntPipe) reportedUserId: number,
    @Body() reportPlayerDto: ReportPlayerDto,
  ) {
    const result = await this.roomService.reportPlayer(
      user.id,
      roomId,
      reportedUserId,
      reportPlayerDto,
    );
    return successResponse(
      result,
      result.message || 'Successfully reported player',
      HttpStatus.CREATED,
    );
  }
}
