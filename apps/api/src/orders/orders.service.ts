import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  Prisma,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { AuditService } from '../audit/audit.service';
import { InventoryService } from '../inventory/inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

const ORDER_INCLUDE = {
  items: true,
  customer: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
  payments: {
    orderBy: { createdAt: 'desc' },
  },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: {
    status?: OrderStatus;
    from?: string;
    to?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.OrderWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from
                ? { gte: this.dateBoundary(query.from, false) }
                : {}),
              ...(query.to
                ? { lte: this.dateBoundary(query.to, true) }
                : {}),
            },
          }
        : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: orders.map((order) => this.serialize(order)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.serialize(order);
  }

  async create(input: CreateOrderDto) {
    const items = this.aggregateItems(input.items);

    return this.prisma.$transaction(
      async (tx) => {
        const merchantSettings = await tx.merchantSettings.findUnique({
          where: { id: 'default' },
          select: {
            currency: true,
            taxRate: true,
            shippingFee: true,
            freeShippingThreshold: true,
          },
        });
        const currency = merchantSettings?.currency ?? 'USD';

        const products = await tx.product.findMany({
          where: {
            id: { in: items.map((item) => item.productId) },
          },
        });

        if (products.length !== items.length) {
          throw new BadRequestException('One or more products were not found');
        }

        const productMap = new Map(
          products.map((product) => [product.id, product]),
        );

        const subtotal = items.reduce((sum, item) => {
          const product = productMap.get(item.productId);

          if (!product) {
            throw new BadRequestException('Product not found');
          }

          return sum + Number(product.price) * item.quantity;
        }, 0);

        const taxRate = Number(merchantSettings?.taxRate ?? 0);
        const configuredShipping = Number(
          merchantSettings?.shippingFee ?? 0,
        );
        const freeShippingThreshold =
          merchantSettings?.freeShippingThreshold === null
          || merchantSettings?.freeShippingThreshold === undefined
            ? null
            : Number(merchantSettings.freeShippingThreshold);
        const shipping =
          freeShippingThreshold !== null
          && subtotal >= freeShippingThreshold
            ? 0
            : configuredShipping;
        const tax = this.roundMoney(subtotal * taxRate);
        const total = this.roundMoney(subtotal + shipping + tax);

        const order = await tx.order.create({
          data: {
            orderNo: this.createOrderNumber(),
            customerId: null,
            subtotal,
            shipping,
            tax,
            total,
            currency,
          },
        });

        for (const item of items) {
          const product = productMap.get(item.productId);

          if (!product) {
            throw new BadRequestException('Product not found');
          }

          await this.inventory.decrementForOrder(
            tx,
            product.id,
            item.quantity,
            order.id,
          );

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: product.id,
              title: product.title,
              sku: product.sku,
              unitPrice: product.price,
              quantity: item.quantity,
            },
          });
        }

        await this.audit.recordWithClient(
          tx,
          null,
          'ORDER_CREATED',
          'Order',
          order.id,
          {
            orderNo: order.orderNo,
            total,
            currency,
          },
        );

        const created = await tx.order.findUnique({
          where: { id: order.id },
          include: ORDER_INCLUDE,
        });

        if (!created) {
          throw new ConflictException(
            'Order could not be loaded after creation',
          );
        }

        return this.serialize(created);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async updateStatus(
    id: string,
    target: OrderStatus,
    actorId: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === target) {
      return this.findOne(id);
    }

    this.assertTransitionAllowed(order.status, target);

    await this.prisma.$transaction(
      async (tx) => {
        const transitioned = await tx.order.updateMany({
          where: {
            id,
            status: order.status,
          },
          data: {
            status: target,
          },
        });

        if (transitioned.count !== 1) {
          throw new ConflictException(
            'Order status changed concurrently; reload and try again',
          );
        }

        if (target === OrderStatus.CANCELLED) {
          await this.inventory.restockForCancelledOrder(
            tx,
            order.id,
            order.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          );
        }

        await this.audit.recordWithClient(
          tx,
          actorId,
          'ORDER_STATUS_CHANGED',
          'Order',
          id,
          {
            from: order.status,
            to: target,
          },
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return this.findOne(id);
  }

  private aggregateItems(items: CreateOrderDto['items']) {
    const quantities = new Map<string, number>();

    for (const item of items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
    }

    return [...quantities.entries()].map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
  }

  private assertTransitionAllowed(
    current: OrderStatus,
    target: OrderStatus,
  ): void {
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      SHIPPED: [OrderStatus.DELIVERED],
      DELIVERED: [OrderStatus.REFUNDED],
      CANCELLED: [],
      REFUNDED: [],
    };

    if (!allowed[current].includes(target)) {
      throw new ConflictException(
        `Order cannot transition from ${current} to ${target}`,
      );
    }
  }

  private createOrderNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    return `MKT-${date}-${randomUUID().slice(0, 8).toUpperCase()}`;
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private dateBoundary(value: string, endOfDay: boolean): Date {
    const date = new Date(value);

    if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      date.setUTCHours(23, 59, 59, 999);
    }

    return date;
  }

  private serialize<T extends {
    subtotal: Prisma.Decimal;
    shipping: Prisma.Decimal;
    tax: Prisma.Decimal;
    total: Prisma.Decimal;
    items: Array<{ unitPrice: Prisma.Decimal }>;
    payments: Array<{ amount: Prisma.Decimal }>;
  }>(order: T) {
    return {
      ...order,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
      })),
      payments: order.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    };
  }
}
