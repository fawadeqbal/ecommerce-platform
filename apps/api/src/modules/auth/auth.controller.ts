import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { AuthProviders, AuthTokens } from '@ecommerce/types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from './auth-cookies';
import { newToken, safeNext } from './auth-tokens';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  OtpRequestDto,
  OtpVerifyDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';

const OAUTH_COOKIE = 'oauth_state';

/**
 * Tokens are returned in the body (for API/mobile clients) AND set as HttpOnly cookies (for the web apps).
 */
@ApiTags('Auth')
@Public()
@Throttle({ default: { ttl: 60_000, limit: 10 } })
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

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

  // ---------------------------------------------------------------- providers

  @Get('providers')
  providers(): AuthProviders {
    return this.authService.providers();
  }

  // ---------------------------------------------------------------- verification & reset

  @Post('verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  verifyEmail(@Body() dto: VerifyEmailDto): Promise<void> {
    return this.authService.verifyEmail(dto.token);
  }

  /** Signed-in users only (the route is public so the guard just attaches the user when present). */
  @Post('verify-email/resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  resendVerification(@CurrentUser('sub') userId: string | undefined): Promise<void> {
    if (!userId) throw new UnauthorizedException('Sign in first');
    return this.authService.sendVerification(userId);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    clearAuthCookies(res);
    return this.authService.resetPassword(dto.token, dto.password);
  }

  // ---------------------------------------------------------------- email code

  @Post('otp/request')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  requestOtp(@Body() dto: OtpRequestDto): Promise<void> {
    return this.authService.requestOtp(dto.email);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: OtpVerifyDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens> {
    return this.withCookies(res, await this.authService.verifyOtp(dto.email, dto.code));
  }

  // ---------------------------------------------------------------- Google

  @Get('google')
  google(@Query('next') next: string | undefined, @Res() res: Response): void {
    const state = newToken();
    res.cookie(OAUTH_COOKIE, `${state}|${safeNext(next)}`, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60_000,
      path: '/',
    });
    res.redirect(this.authService.googleStartUrl(state));
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const site = this.authService.siteUrl();
    const [expected, next] = (this.cookie(req, OAUTH_COOKIE) ?? '').split('|');
    res.clearCookie(OAUTH_COOKIE, { path: '/' });
    if (!code || !state || !expected || state !== expected) {
      res.redirect(`${site}/login?error=google`);
      return;
    }
    try {
      this.withCookies(res, await this.authService.googleCallback(code));
      res.redirect(`${site}${safeNext(next)}`);
    } catch (error) {
      this.logger.warn(`Google sign-in failed: ${String(error)}`);
      res.redirect(`${site}/login?error=google`);
    }
  }

  // ---------------------------------------------------------------- helpers

  private withCookies(res: Response, tokens: AuthTokens): AuthTokens {
    setAuthCookies(res, tokens, this.config.get<number>('JWT_REFRESH_TTL_DAYS', 30));
    return tokens;
  }

  private cookie(req: Request, name: string): string | undefined {
    return (req.cookies as Record<string, string> | undefined)?.[name];
  }
}
