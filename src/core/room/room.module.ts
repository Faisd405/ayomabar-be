import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomControllerV1 } from './room.controller';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import {
  CreateRoomUseCase,
  UpdateRoomUseCase,
  GetRoomByIdUseCase,
  DeleteRoomUseCase,
  GetRoomsListUseCase,
} from './use-cases';

@Module({
  controllers: [RoomControllerV1],
  providers: [
    RoomService,
    PrismaService,
    CreateRoomUseCase,
    UpdateRoomUseCase,
    GetRoomByIdUseCase,
    DeleteRoomUseCase,
    GetRoomsListUseCase,
  ],
  exports: [RoomService],
})
export class RoomModule {}
