import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../security/password.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';

const STAFF_ROLES: UserRole[] = [
  UserRole.STAFF,
  UserRole.ADMIN,
  UserRole.OWNER,
];

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}

  findStaff() {
    return this.prisma.user.findMany({
      where: {
        role: { in: STAFF_ROLES },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { role: 'desc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async createStaff(input: CreateStaffUserDto, actor: AuthenticatedUser) {
    if (![UserRole.STAFF, UserRole.ADMIN].includes(input.role)) {
      throw new BadRequestException('Only STAFF or ADMIN accounts can be created');
    }

    if (input.role === UserRole.ADMIN && actor.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only an owner can create an admin account');
    }

    const email = input.email.trim().toLowerCase();
    const passwordHash = await this.passwords.hash(input.password);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            firstName: input.firstName?.trim() || null,
            lastName: input.lastName?.trim() || null,
            role: input.role,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: 'USER_CREATED',
            entity: 'User',
            entityId: user.id,
            metadata: {
              role: user.role,
              email: user.email,
            },
          },
        });

        return user;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError
        && error.code === 'P2002'
      ) {
        throw new ConflictException('A user with this email already exists');
      }

      throw error;
    }
  }

  async deactivate(id: string, actor: AuthenticatedUser) {
    if (id === actor.id) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    const target = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (target.role === UserRole.OWNER) {
      throw new ForbiddenException('Owner accounts cannot be deactivated here');
    }

    if (target.role === UserRole.ADMIN && actor.role !== UserRole.OWNER) {
      throw new ForbiddenException('Only an owner can deactivate an admin');
    }

    if (!target.isActive) {
      return { success: true };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { isActive: false },
      });

      await tx.session.updateMany({
        where: {
          userId: id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: 'USER_DEACTIVATED',
          entity: 'User',
          entityId: id,
          metadata: {
            role: target.role,
            email: target.email,
          },
        },
      });
    });

    return { success: true };
  }
}
