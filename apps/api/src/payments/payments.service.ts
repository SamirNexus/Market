import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ManualPaymentProvider } from './manual-payment.provider';
import { PaymentProvider } from './payment-provider';

@Injectable()
export class PaymentsService {
  private readonly providers: Map<string, PaymentProvider>;

  constructor(
    private readonly prisma: PrismaService,
    manualProvider: ManualPaymentProvider,
  ) {
    this.providers = new Map([[manualProvider.name, manualProvider]]);
  }

  async createForOrder(orderId: string, providerName = 'manual') {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new BadRequestException('Payment provider is not configured');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNo: true,
        total: true,
        currency: true,
        status: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
      throw new BadRequestException(
        'Payment cannot be started for this order state',
      );
    }

    const existing = await this.prisma.payment.findFirst({
      where: {
        orderId,
        provider: provider.name,
        status: {
          in: [
            PaymentStatus.PENDING,
            PaymentStatus.REQUIRES_ACTION,
            PaymentStatus.SUCCEEDED,
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return this.serialize(existing);
    }

    const amount = Number(order.total);
    const result = await provider.createPayment({
      orderId: order.id,
      orderNo: order.orderNo,
      amount,
      currency: order.currency,
    });

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: provider.name,
        providerPaymentId: result.providerPaymentId,
        status: result.status as PaymentStatus,
        amount,
        currency: order.currency,
        checkoutUrl: result.checkoutUrl,
        metadata: result.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return this.serialize(payment);
  }

  async listForOrder(orderId: string) {
    const exists = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('Order not found');
    }

    const payments = await this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((payment) => this.serialize(payment));
  }

  private serialize<T extends { amount: Prisma.Decimal }>(payment: T) {
    return {
      ...payment,
      amount: Number(payment.amount),
    };
  }
}
