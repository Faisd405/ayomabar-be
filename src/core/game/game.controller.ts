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
import { GameService } from './game.service';
import { successResponse } from 'src/utils/response.utils';
import {
  CreateGameDto,
  UpdateGameDto,
  GetGamesListDto,
} from './dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('game')
@Controller({ path: 'game', version: '1' })
export class GameControllerV1 {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new game (Admin only)',
    description: 'Creates a new game with the provided information. Only accessible by admin users.',
  })
  @ApiResponse({
    status: 201,
    description: 'Game created successfully',
    schema: {
      example: {
        success: true,
        message: 'Game created successfully',
        data: {
          id: 1,
          title: 'The Legend of Zelda: Breath of the Wild',
          genre: 'Action-adventure',
          platform: 'Nintendo Switch',
          releaseDate: '2017-03-03T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        statusCode: 201,
      },
    },
  })
  async create(@Body() createGameDto: CreateGameDto) {
    const game = await this.gameService.createGame(createGameDto);
    return successResponse(
      game,
      'Game created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get a list of games',
    description: 'Retrieves a paginated list of games with optional filtering and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Games retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Games retrieved successfully',
        data: {
          data: [
            {
              id: 1,
              title: 'The Legend of Zelda: Breath of the Wild',
              genre: 'Action-adventure',
              platform: 'Nintendo Switch',
              releaseDate: '2017-03-03T00:00:00.000Z',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          ],
          meta: {
            total: 100,
            page: 1,
            limit: 10,
            totalPages: 10,
            hasNextPage: true,
            hasPreviousPage: false,
          },
        },
        statusCode: 200,
      },
    },
  })
  async findAll(@Query() query: GetGamesListDto) {
    const games = await this.gameService.getGamesList(query);
    return successResponse(games, 'Games retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a game by ID',
    description: 'Retrieves detailed information about a specific game.',
  })
  @ApiResponse({
    status: 200,
    description: 'Game retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Game retrieved successfully',
        data: {
          id: 1,
          title: 'The Legend of Zelda: Breath of the Wild',
          genre: 'Action-adventure',
          platform: 'Nintendo Switch',
          releaseDate: '2017-03-03T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        statusCode: 200,
      },
    },
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const game = await this.gameService.getGameById(id);
    return successResponse(game, 'Game retrieved successfully');
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a game (Admin only)',
    description: 'Updates an existing game with the provided information. Only accessible by admin users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Game updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Game updated successfully',
        data: {
          id: 1,
          title: 'The Legend of Zelda: Breath of the Wild',
          genre: 'Action-adventure',
          platform: 'Nintendo Switch',
          releaseDate: '2017-03-03T00:00:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        statusCode: 200,
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    const game = await this.gameService.updateGame(id, updateGameDto);
    return successResponse(game, 'Game updated successfully');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a game (Admin only)',
    description: 'Soft deletes a game from the system. Only accessible by admin users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Game deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Game deleted successfully',
        data: {
          message: 'Game deleted successfully',
        },
        statusCode: 200,
      },
    },
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.gameService.deleteGame(id);
    return successResponse(result, 'Game deleted successfully');
  }
}
