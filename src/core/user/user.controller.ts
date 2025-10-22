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
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { successResponse } from 'src/utils/response.utils';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersListDto,
} from './dto';

@ApiTags('user')
@Controller({ path: 'user', version: '1' })
export class UserControllerV1 {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user with the provided information.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        success: true,
        message: 'User created successfully',
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          username: 'john_doe',
          roles: ['user'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          _count: {
            notes: 0,
          },
        },
      },
    },
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    return successResponse(user, 'User created successfully', HttpStatus.CREATED);
  }

  @Get('list')
  @ApiOperation({
    summary: 'Get paginated list of users',
    description:
      'Retrieves a paginated list of users with optional search functionality.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: [
            {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              username: 'john_doe',
              roles: ['user'],
              createdAt: '2024-01-01T00:00:00.000Z',
              _count: {
                notes: 5,
              },
            },
          ],
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      },
    },
  })
  async getUsersList(@Query() query: GetUsersListDto) {
    const result = await this.userService.getUsersList(query);
    return successResponse(result, 'Users retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves detailed information about a user by their ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'User retrieved successfully',
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          username: 'john_doe',
          roles: ['user'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          notes: [],
          _count: {
            notes: 0,
          },
        },
      },
    },
  })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getUserById(id);
    return successResponse(user, 'User retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a user',
    description: 'Updates an existing user by their ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        success: true,
        message: 'User updated successfully',
        data: {
          id: 1,
          name: 'John Doe Updated',
          email: 'john@example.com',
          username: 'john_doe',
          roles: ['user', 'admin'],
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
          _count: {
            notes: 5,
          },
        },
      },
    },
  })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUser(id, updateUserDto);
    return successResponse(user, 'User updated successfully');
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Deletes a user by their ID. This will also delete all related notes.',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'User deleted successfully',
        data: {
          id: 1,
          message: 'User deleted successfully',
        },
      },
    },
  })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const result = await this.userService.deleteUser(id);
    return successResponse(result, 'User deleted successfully');
  }
}
