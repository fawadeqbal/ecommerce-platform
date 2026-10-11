import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { AuthTokens } from '@ecommerce/types';
import { Public } from '../../common/decorators/public.decorator';
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from './auth-cookies';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto } from './dto/auth.dto';

/**
 * Tokens are returned in the body (for API/mobile clients) AND set as HttpOnly cookies (for the web apps).
 */
@ApiTags('Auth')
@Public()
@Throttle({ default: { ttl: 60_000, limit: 10 } })
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens> {
    return this.withCookies(res, await this.authService.register(dto));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens> {
    return this.withCookies(res, await this.authService.login(dto));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens> {
    const token = dto.refreshToken ?? this.cookie(req, REFRESH_COOKIE);
    if (!token) throw new UnauthorizedException('Missing refresh token');
    return this.withCookies(res, await this.authService.refresh(token));
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const token = dto.refreshToken ?? this.cookie(req, REFRESH_COOKIE);
    if (token) await this.authService.logout(token);
    clearAuthCookies(res);
  }

  private withCookies(res: Response, tokens: AuthTokens): AuthTokens {
    setAuthCookies(res, tokens, this.config.get<number>('JWT_REFRESH_TTL_DAYS', 30));
    return tokens;
  }

  private cookie(req: Request, name: string): string | undefined {
    return (req.cookies as Record<string, string> | undefined)?.[name];
  }
}
