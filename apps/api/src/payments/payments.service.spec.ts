import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { ManualPaymentProvider } from './manual-payment.provider';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const order = {
    id: 'order-1',
    orderNo: 'MKT-TEST',
    total: new Prisma.Decimal('232.50'),
    currency: 'USD',
    status: 'PENDING',
  };

  const payment = {
    id: 'payment-1',
    orderId: order.id,
    provider: 'manual',
    providerPaymentId: null,
    status: PaymentStatus.PENDING,
    amount: new Prisma.Decimal('232.50'),
    currency: 'USD',
    checkoutUrl: null,
    failureCode: null,
    failureMessage: null,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prisma = {
    order: {
      findUnique: jest.fn(),
    },
    payment: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  let service: PaymentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentsService(
      prisma as never,
      new ManualPaymentProvider(),
    );
  });

  it('creates a provider-neutral payment from the server order total', async () => {
    prisma.order.findUnique.mockResolvedValue(order);
    prisma.payment.findFirst.mockResolvedValue(null);
    prisma.payment.create.mockResolvedValue(payment);

    const result = await service.createForOrder(order.id);

    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: order.id,
        provider: 'manual',
        amount: 232.5,
        currency: 'USD',
        status: PaymentStatus.PENDING,
      }),
    });
    expect(result.amount).toBe(232.5);
  });

  it('returns an active payment instead of creating a duplicate', async () => {
    prisma.order.findUnique.mockResolvedValue(order);
    prisma.payment.findFirst.mockResolvedValue(payment);

    await service.createForOrder(order.id);

    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it('rejects unsupported providers', async () => {
    await expect(
      service.createForOrder(order.id, 'unknown'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a missing order', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(
      service.createForOrder('missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
