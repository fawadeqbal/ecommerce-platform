import type { Role } from './enums';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: Role[];
  vendorId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
