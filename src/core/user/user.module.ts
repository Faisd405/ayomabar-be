import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserControllerV1 } from './user.controller';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import {
  CreateUserUseCase,
  UpdateUserUseCase,
  GetUserByIdUseCase,
  DeleteUserUseCase,
  GetUsersListUseCase,
  FindOrCreateUserByDiscordUseCase,
} from './use-cases';

@Module({
  controllers: [UserControllerV1],
  providers: [
    UserService,
    PrismaService,
    CreateUserUseCase,
    UpdateUserUseCase,
    GetUserByIdUseCase,
    DeleteUserUseCase,
    GetUsersListUseCase,
    FindOrCreateUserByDiscordUseCase,
  ],
  exports: [UserService],
})
export class UserModule {}
