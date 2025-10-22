import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import {
  CreateUserUseCase,
  UpdateUserUseCase,
  GetUserByIdUseCase,
  DeleteUserUseCase,
  GetUsersListUseCase,
} from './use-cases';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersListDto,
} from './dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getUsersListUseCase: GetUsersListUseCase,
  ) {}

  async createUser(data: CreateUserDto) {
    return this.createUserUseCase.execute(data);
  }

  async updateUser(id: number, data: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, data);
  }

  async getUserById(id: number) {
    return this.getUserByIdUseCase.execute(id);
  }

  async deleteUser(id: number) {
    return this.deleteUserUseCase.execute(id);
  }

  async getUsersList(query: GetUsersListDto) {
    return this.getUsersListUseCase.execute(query);
  }
}
