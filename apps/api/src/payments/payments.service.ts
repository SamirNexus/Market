import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ManualPaymentProvider } from './manual-payment.provider';
import { PaymentProvider } from './payment-provider';
import { StripePaymentProvider } from './stripe-payment.provider';

@Injectable()
export class PaymentsService {
  private readonly providers: Map<string, PaymentProvider>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    manualProvider: ManualPaymentProvider,
    stripeProvider: StripePaymentProvider,
  ) {
    this.providers = new Map([
      [manualProvider.name, manualProvider],
      [stripeProvider.name, stripeProvider],
    ]);
  }

  async createForOrder(orderId: string, providerName?: string) {
    const selectedProvider = providerName
      ?? this.config.get<string>('PAYMENT_PROVIDER', 'manual');
    const provider = this.providers.get(selectedProvider);

    if (!provider) {
      throw new BadRequestException('Payment provider is not configured');
    }

    if (
      provider instanceof StripePaymentProvider
      && !provider.configured
    ) {
      throw new BadRequestException(
        'Stripe is not configured for this environment',
      );
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

  async applyStripeEvent(event: {
    id: string;
    type: string;
    data?: {
      object?: {
        id?: string;
        payment_status?: string;
        status?: string;
        metadata?: Record<string, string>;
      };
    };
  }) {
    const object = event.data?.object;
    const providerPaymentId = object?.id;

    if (!providerPaymentId) {
      return { received: true, ignored: true };
    }

    const payment = await this.prisma.payment.findFirst({
      where: {
        provider: 'stripe',
        providerPaymentId,
      },
    });

    if (!payment) {
      return { received: true, ignored: true };
    }

    const target = this.stripeStatus(event.type, object);

    if (!target || payment.status === target) {
      return { received: true, duplicate: payment.status === target };
    }

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.payment.updateMany({
        where: {
          id: payment.id,
          status: payment.status,
        },
        data: {
          status: target,
          failureCode:
            target === PaymentStatus.FAILED ? event.type : null,
          failureMessage:
            target === PaymentStatus.FAILED
              ? 'The payment provider reported an unsuccessful checkout.'
              : null,
          metadata: {
            stripeEventId: event.id,
            stripeEventType: event.type,
          },
        },
      });

      if (updated.count !== 1) {
        return;
      }

      if (target === PaymentStatus.SUCCEEDED) {
        await tx.order.updateMany({
          where: {
            id: payment.orderId,
            status: 'PENDING',
          },
          data: {
            status: 'CONFIRMED',
          },
        });
      }
    });

    return { received: true };
  }

  private stripeStatus(
    eventType: string,
    object: { payment_status?: string; status?: string },
  ): PaymentStatus | null {
    if (
      eventType === 'checkout.session.completed'
      && object.payment_status === 'paid'
    ) {
      return PaymentStatus.SUCCEEDED;
    }

    if (eventType === 'checkout.session.expired') {
      return PaymentStatus.CANCELLED;
    }

    if (eventType === 'checkout.session.async_payment_failed') {
      return PaymentStatus.FAILED;
    }

    if (eventType === 'checkout.session.async_payment_succeeded') {
      return PaymentStatus.SUCCEEDED;
    }

    return null;
  }

  private serialize<T extends { amount: Prisma.Decimal }>(payment: T) {
    return {
      ...payment,
      amount: Number(payment.amount),
    };
  }
}
