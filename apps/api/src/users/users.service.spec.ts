import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const owner = {
    id: 'owner-1',
    email: 'owner@example.com',
    firstName: null,
    lastName: null,
    role: UserRole.OWNER,
    sessionId: 'session-owner',
  };

  const admin = {
    ...owner,
    id: 'admin-1',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const tx = {
    user: {
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const prisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const passwords = {
    hash: jest.fn(),
  };

  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );
    passwords.hash.mockResolvedValue('password-hash');
    service = new UsersService(prisma as never, passwords as never);
  });

  it('allows the owner to create an admin and records an audit event', async () => {
    tx.user.create.mockResolvedValue({
      id: 'new-admin',
      email: 'new-admin@example.com',
      firstName: null,
      lastName: null,
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
    });

    await service.createStaff(
      {
        email: 'NEW-ADMIN@example.com',
        password: 'very secure password',
        role: UserRole.ADMIN,
      },
      owner,
    );

    expect(tx.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'new-admin@example.com',
        role: UserRole.ADMIN,
        passwordHash: 'password-hash',
      }),
      select: expect.any(Object),
    });
    expect(tx.auditLog.create).toHaveBeenCalled();
  });

  it('prevents an admin from creating another admin', async () => {
    await expect(
      service.createStaff(
        {
          email: 'other-admin@example.com',
          password: 'very secure password',
          role: UserRole.ADMIN,
        },
        admin,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('prevents self-deactivation', async () => {
    await expect(service.deactivate(owner.id, owner)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('deactivates staff and revokes active sessions atomically', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'staff-1',
      email: 'staff@example.com',
      role: UserRole.STAFF,
      isActive: true,
    });

    await service.deactivate('staff-1', admin);

    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'staff-1' },
      data: { isActive: false },
    });
    expect(tx.session.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'staff-1',
        revokedAt: null,
      },
      data: {
        revokedAt: expect.any(Date),
      },
    });
    expect(tx.auditLog.create).toHaveBeenCalled();
  });
});
