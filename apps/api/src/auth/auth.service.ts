import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../security/password.service';
import { AccessTokenPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(input: LoginDto) {
    const email = input.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (
      !user
      || !user.isActive
      || !user.passwordHash
      || !(await this.passwords.verify(input.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createAuthenticatedSession({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
  }

  async refresh(refreshToken: string) {
    const parsed = this.parseRefreshToken(refreshToken);

    if (!parsed) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: parsed.sessionId },
      include: { user: true },
    });

    if (
      !session
      || session.revokedAt
      || session.expiresAt <= new Date()
      || !session.user.isActive
    ) {
      throw new UnauthorizedException('Refresh session is no longer valid');
    }

    const presentedHash = this.hashRefreshSecret(parsed.secret);

    if (!this.safeCompare(session.refreshTokenHash, presentedHash)) {
      await this.prisma.session.updateMany({
        where: {
          id: session.id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const nextSecret = this.createRefreshSecret();
    const nextHash = this.hashRefreshSecret(nextSecret);
    const expiresAt = this.createRefreshExpiry();

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: nextHash,
        expiresAt,
        lastUsedAt: new Date(),
      },
    });

    return this.buildAuthResponse(
      {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        role: session.user.role,
      },
      session.id,
      nextSecret,
    );
  }

  async logout(refreshToken: string): Promise<{ success: true }> {
    const parsed = this.parseRefreshToken(refreshToken);

    if (parsed) {
      await this.prisma.session.updateMany({
        where: {
          id: parsed.sessionId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    return { success: true };
  }

  private async createAuthenticatedSession(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
  }) {
    const secret = this.createRefreshSecret();
    const expiresAt = this.createRefreshExpiry();

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: this.hashRefreshSecret(secret),
        expiresAt,
      },
      select: { id: true },
    });

    return this.buildAuthResponse(user, session.id, secret);
  }

  private async buildAuthResponse(
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: UserRole;
    },
    sessionId: string,
    refreshSecret: string,
  ) {
    const expiresIn = this.getAccessTokenTtlSeconds();
    const payload: AccessTokenPayload = {
      sub: user.id,
      sid: sessionId,
      role: user.role,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn,
    });

    return {
      accessToken,
      refreshToken: `${sessionId}.${refreshSecret}`,
      tokenType: 'Bearer',
      expiresIn,
      user,
    };
  }

  private createRefreshSecret(): string {
    return randomBytes(48).toString('base64url');
  }

  private hashRefreshSecret(secret: string): string {
    return createHash('sha256').update(secret).digest('hex');
  }

  private safeCompare(first: string, second: string): boolean {
    const left = Buffer.from(first);
    const right = Buffer.from(second);

    return left.length === right.length && timingSafeEqual(left, right);
  }

  private parseRefreshToken(
    token: string,
  ): { sessionId: string; secret: string } | null {
    const separator = token.indexOf('.');

    if (separator <= 0 || separator === token.length - 1) {
      return null;
    }

    return {
      sessionId: token.slice(0, separator),
      secret: token.slice(separator + 1),
    };
  }

  private createRefreshExpiry(): Date {
    const days = this.config.get<number>('REFRESH_TOKEN_DAYS', 30);

    if (!Number.isFinite(days) || days <= 0) {
      throw new Error('REFRESH_TOKEN_DAYS must be a positive number');
    }

    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private getAccessTokenTtlSeconds(): number {
    const seconds = this.config.get<number>('JWT_ACCESS_TTL_SECONDS', 900);

    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new Error('JWT_ACCESS_TTL_SECONDS must be a positive number');
    }

    return seconds;
  }
}
