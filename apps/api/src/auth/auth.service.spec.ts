import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { createHash } from 'node:crypto';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const user = {
    id: 'user-1',
    email: 'owner@example.com',
    passwordHash: 'stored-password',
    firstName: 'Market',
    lastName: 'Owner',
    role: UserRole.OWNER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const session = {
    id: 'session-1',
    userId: user.id,
    refreshTokenHash: '',
    expiresAt: new Date(Date.now() + 86_400_000),
    revokedAt: null,
    lastUsedAt: null,
    createdAt: new Date(),
    user,
  };

  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const passwords = {
    verify: jest.fn(),
  };

  const jwt = {
    signAsync: jest.fn(),
  };

  const config = {
    get: jest.fn((key: string, fallback: unknown) => {
      const values: Record<string, unknown> = {
        REFRESH_TOKEN_DAYS: 30,
        JWT_ACCESS_TTL_SECONDS: 900,
      };

      return values[key] ?? fallback;
    }),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    jwt.signAsync.mockResolvedValue('access-token');
    prisma.session.updateMany.mockResolvedValue({ count: 1 });
    service = new AuthService(
      prisma as never,
      passwords as never,
      jwt as never,
      config as never,
    );
  });

  it('creates a revocable session after valid login', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    passwords.verify.mockResolvedValue(true);
    prisma.session.create.mockResolvedValue({ id: session.id });

    const result = await service.login({
      email: ' OWNER@EXAMPLE.COM ',
      password: 'correct password',
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
    });
    expect(prisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: user.id,
        refreshTokenHash: expect.any(String),
        expiresAt: expect.any(Date),
      }),
      select: { id: true },
    });
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken.startsWith(`${session.id}.`)).toBe(true);
    expect(result.user).toEqual({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
  });

  it('uses one generic error for invalid login credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    passwords.verify.mockResolvedValue(false);

    await expect(
      service.login({
        email: user.email,
        password: 'wrong password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rotates a valid refresh token atomically', async () => {
    const secret = 'refresh-secret-value';
    const hash = createHash('sha256').update(secret).digest('hex');

    prisma.session.findUnique.mockResolvedValue({
      ...session,
      refreshTokenHash: hash,
    });

    const result = await service.refresh(`${session.id}.${secret}`);

    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: {
        id: session.id,
        refreshTokenHash: hash,
        revokedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      data: expect.objectContaining({
        refreshTokenHash: expect.any(String),
        expiresAt: expect.any(Date),
        lastUsedAt: expect.any(Date),
      }),
    });
    expect(result.refreshToken).not.toBe(`${session.id}.${secret}`);
  });

  it('revokes a session when a reused refresh secret is detected', async () => {
    prisma.session.findUnique.mockResolvedValue({
      ...session,
      refreshTokenHash: createHash('sha256')
        .update('different-secret')
        .digest('hex'),
    });

    await expect(
      service.refresh(`${session.id}.stolen-old-token`),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: {
        id: session.id,
        revokedAt: null,
      },
      data: {
        revokedAt: expect.any(Date),
      },
    });
  });

  it('revokes the session if concurrent refresh rotation loses the race', async () => {
    const secret = 'refresh-secret-value';
    const hash = createHash('sha256').update(secret).digest('hex');

    prisma.session.findUnique.mockResolvedValue({
      ...session,
      refreshTokenHash: hash,
    });
    prisma.session.updateMany
      .mockResolvedValueOnce({ count: 0 })
      .mockResolvedValueOnce({ count: 1 });

    await expect(
      service.refresh(`${session.id}.${secret}`),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prisma.session.updateMany).toHaveBeenCalledTimes(2);
  });
});
