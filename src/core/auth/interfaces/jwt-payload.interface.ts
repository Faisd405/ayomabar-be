export interface JwtPayload {
  sub: number; // User ID
  username: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
