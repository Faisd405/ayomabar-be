import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import {
  CreateRoomUseCase,
  UpdateRoomUseCase,
  GetRoomByIdUseCase,
  DeleteRoomUseCase,
  GetRoomsListUseCase,
} from './use-cases';
import {
  CreateRoomDto,
  UpdateRoomDto,
  GetRoomsListDto,
} from './dto';

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly updateRoomUseCase: UpdateRoomUseCase,
    private readonly getRoomByIdUseCase: GetRoomByIdUseCase,
    private readonly deleteRoomUseCase: DeleteRoomUseCase,
    private readonly getRoomsListUseCase: GetRoomsListUseCase,
  ) {}

  async createRoom(userId: number, data: CreateRoomDto) {
    return this.createRoomUseCase.execute(userId, data);
  }

  async updateRoom(userId: number, roomId: number, data: UpdateRoomDto) {
    return this.updateRoomUseCase.execute(userId, roomId, data);
  }

  async getRoomById(id: number) {
    return this.getRoomByIdUseCase.execute(id);
  }

  async deleteRoom(userId: number, roomId: number) {
    return this.deleteRoomUseCase.execute(userId, roomId);
  }

  async getRoomsList(query: GetRoomsListDto) {
    return this.getRoomsListUseCase.execute(query);
  }
}
