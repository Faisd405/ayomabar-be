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
import { MatchService } from './match.service';
import { successResponse } from 'src/utils/response.utils';
import {
  CreateMatchDto,
  UpdateMatchDto,
  GetMatchesListDto,
} from './dto';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/core/auth/decorators/current-user.decorator';

@ApiTags('match')
@Controller({ path: 'match', version: '1' })
export class MatchControllerV1 {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new match',
    description: 'Creates a new match with the provided information. Requires authentication.',
  })
  @ApiResponse({
    status: 201,
    description: 'Match created successfully',
    schema: {
      example: {
        success: true,
        message: 'Match created successfully',
        data: {
          id: 1,
          gameId: 1,
          userId: 1,
          maxPlayers: 4,
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
    @Body() createMatchDto: CreateMatchDto,
  ) {
    const match = await this.matchService.createMatch(user.id, createMatchDto);
    return successResponse(
      match,
      'Match created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get a list of matches',
    description: 'Retrieves a paginated list of matches with optional filtering and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Matches retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Matches retrieved successfully',
        data: {
          data: [
            {
              id: 1,
              gameId: 1,
              userId: 1,
              maxPlayers: 4,
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
  async findAll(@Query() query: GetMatchesListDto) {
    const matches = await this.matchService.getMatchesList(query);
    return successResponse(matches, 'Matches retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a match by ID',
    description: 'Retrieves detailed information about a specific match including participants.',
  })
  @ApiResponse({
    status: 200,
    description: 'Match retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Match retrieved successfully',
        data: {
          id: 1,
          gameId: 1,
          userId: 1,
          maxPlayers: 4,
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
              matchId: 1,
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
    description: 'Match not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const match = await this.matchService.getMatchById(id);
    return successResponse(match, 'Match retrieved successfully');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a match',
    description: 'Updates an existing match. Only the creator can update the match.',
  })
  @ApiResponse({
    status: 200,
    description: 'Match updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Match updated successfully',
        data: {
          id: 1,
          gameId: 1,
          userId: 1,
          maxPlayers: 6,
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
    description: 'Match not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only the match creator can update',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async update(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: UpdateMatchDto,
  ) {
    const match = await this.matchService.updateMatch(user.id, id, updateMatchDto);
    return successResponse(match, 'Match updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a match',
    description: 'Soft deletes a match from the system. Only the creator can delete the match.',
  })
  @ApiResponse({
    status: 200,
    description: 'Match deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Match deleted successfully',
        data: {
          message: 'Match deleted successfully',
        },
        statusCode: 200,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Match not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only the match creator can delete',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async remove(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.matchService.deleteMatch(user.id, id);
    return successResponse(result, 'Match deleted successfully');
  }
}
