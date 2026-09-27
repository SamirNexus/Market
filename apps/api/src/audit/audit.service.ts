import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type AuditClient = Pick<Prisma.TransactionClient, 'auditLog'>;

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  record(
    actorId: string | null,
    action: string,
    entity: string,
    entityId: string | null,
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.recordWithClient(
      this.prisma,
      actorId,
      action,
      entity,
      entityId,
      metadata,
    );
  }

  recordWithClient(
    client: AuditClient,
    actorId: string | null,
    action: string,
    entity: string,
    entityId: string | null,
    metadata?: Prisma.InputJsonValue,
  ) {
    return client.auditLog.create({
      data: {
        actorId,
        action,
        entity,
        entityId,
        ...(metadata !== undefined ? { metadata } : {}),
      },
    });
  }
}
