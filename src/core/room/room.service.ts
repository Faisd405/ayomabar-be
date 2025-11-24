import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import {
  CreateRoomUseCase,
  UpdateRoomUseCase,
  GetRoomByIdUseCase,
  DeleteRoomUseCase,
  GetRoomsListUseCase,
  JoinRoomUseCase,
  LeaveRoomUseCase,
  ApproveRoomRequestUseCase,
  RejectRoomRequestUseCase,
  GetRoomRequestsUseCase,
  KickPlayerUseCase,
  ReportPlayerUseCase,
} from './use-cases';
import {
  CreateRoomDto,
  UpdateRoomDto,
  GetRoomsListDto,
  ReportPlayerDto,
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
    private readonly joinRoomUseCase: JoinRoomUseCase,
    private readonly leaveRoomUseCase: LeaveRoomUseCase,
    private readonly approveRoomRequestUseCase: ApproveRoomRequestUseCase,
    private readonly rejectRoomRequestUseCase: RejectRoomRequestUseCase,
    private readonly getRoomRequestsUseCase: GetRoomRequestsUseCase,
    private readonly kickPlayerUseCase: KickPlayerUseCase,
    private readonly reportPlayerUseCase: ReportPlayerUseCase,
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

  async joinRoom(userId: number, roomId: number) {
    return this.joinRoomUseCase.execute(userId, roomId);
  }

  async leaveRoom(userId: number, roomId: number) {
    return this.leaveRoomUseCase.execute(userId, roomId);
  }

  async approveRoomRequest(hostUserId: number, requestId: number) {
    return this.approveRoomRequestUseCase.execute(hostUserId, requestId);
  }

  async rejectRoomRequest(hostUserId: number, requestId: number) {
    return this.rejectRoomRequestUseCase.execute(hostUserId, requestId);
  }

  async getRoomRequests(hostUserId: number, roomId: number) {
    return this.getRoomRequestsUseCase.execute(hostUserId, roomId);
  }

  async kickPlayer(hostUserId: number, roomId: number, targetUserId: number) {
    return this.kickPlayerUseCase.execute(hostUserId, roomId, targetUserId);
  }

  async reportPlayer(reporterId: number, roomId: number, reportedUserId: number, data: ReportPlayerDto) {
    return this.reportPlayerUseCase.execute(reporterId, roomId, reportedUserId, data);
  }
}
