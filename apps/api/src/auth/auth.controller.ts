import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from './auth.types';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

const REFRESH_COOKIE = 'market_refresh';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.login(input);
    this.setRefreshCookie(response, result.refreshToken);

    const { refreshToken: _refreshToken, ...safeResponse } = result;
    return safeResponse;
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.readCookie(request, REFRESH_COOKIE);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh session is missing');
    }

    const result = await this.auth.refresh(refreshToken);
    this.setRefreshCookie(response, result.refreshToken);

    const { refreshToken: _refreshToken, ...safeResponse } = result;
    return safeResponse;
  }

  @Public()
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.readCookie(request, REFRESH_COOKIE);

    if (refreshToken) {
      await this.auth.logout(refreshToken);
    }

    response.clearCookie(REFRESH_COOKIE, this.cookieOptions());
    return { success: true };
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  private setRefreshCookie(response: Response, token: string): void {
    response.cookie(REFRESH_COOKIE, token, {
      ...this.cookieOptions(),
      maxAge: this.refreshTokenMaxAgeMs(),
    });
  }

  private cookieOptions() {
    const configured = this.config.get<string>(
      'REFRESH_COOKIE_SAME_SITE',
      'lax',
    );

    const sameSite =
      configured === 'strict' || configured === 'none'
        ? configured
        : 'lax';

    const secure =
      this.config.get<string>('NODE_ENV', 'development') === 'production'
      || sameSite === 'none';

    return {
      httpOnly: true,
      secure,
      sameSite: sameSite as 'lax' | 'strict' | 'none',
      path: '/api/v1/auth',
    };
  }

  private refreshTokenMaxAgeMs(): number {
    const days = this.config.get<number>('REFRESH_TOKEN_DAYS', 30);
    return days * 24 * 60 * 60 * 1000;
  }

  private readCookie(request: Request, name: string): string | null {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return null;
    }

    for (const part of cookieHeader.split(';')) {
      const separator = part.indexOf('=');
      if (separator <= 0) continue;

      const key = part.slice(0, separator).trim();
      if (key !== name) continue;

      const value = part.slice(separator + 1).trim();

      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }

    return null;
  }
}
