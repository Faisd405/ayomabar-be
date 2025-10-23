import { Injectable } from '@nestjs/common';
import { RegisterDto, LoginDto } from './dto';
import {
  RegisterUseCase,
  ValidateUserUseCase,
  GenerateTokensUseCase,
  RefreshTokenUseCase,
} from './use-cases';
import { TokenResponse } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly validateUserUseCase: ValidateUserUseCase,
    private readonly generateTokensUseCase: GenerateTokensUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  async register(data: RegisterDto) {
    const user = await this.registerUseCase.execute(data);
    const tokens = await this.generateTokensUseCase.execute(user);

    return {
      user,
      ...tokens,
    };
  }

  async login(data: LoginDto): Promise<TokenResponse & { user: any }> {
    const user = await this.validateUserUseCase.execute(
      data.username,
      data.password,
    );
    const tokens = await this.generateTokensUseCase.execute(user);

    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return this.refreshTokenUseCase.execute(refreshToken);
  }

  async validateUser(username: string, password: string) {
    return this.validateUserUseCase.execute(username, password);
  }
}
