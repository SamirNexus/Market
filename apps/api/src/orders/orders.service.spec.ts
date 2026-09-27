import {
  ConflictException,
} from '@nestjs/common';
import {
  OrderStatus,
  ProductStatus,
  Prisma,
} from '@prisma/client';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const product = {
    id: 'product-1',
    title: 'Camera',
    slug: 'camera',
    description: 'Indoor camera',
    price: new Prisma.Decimal(100),
    category: 'electronics',
    image: null,
    sku: 'CAM-001',
    stock: 10,
    status: ProductStatus.ACTIVE,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const order = {
    id: 'order-1',
    orderNo: 'MKT-TEST',
    customerId: null,
    status: OrderStatus.PENDING,
    subtotal: new Prisma.Decimal(200),
    shipping: new Prisma.Decimal(0),
    tax: new Prisma.Decimal(0),
    total: new Prisma.Decimal(200),
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createdOrder = {
    ...order,
    items: [
      {
        id: 'item-1',
        orderId: order.id,
        productId: product.id,
        title: product.title,
        sku: product.sku,
        unitPrice: new Prisma.Decimal(100),
        quantity: 2,
      },
    ],
    customer: null,
  };

  const tx = {
    merchantSettings: {
      findUnique: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
    },
  };

  const prisma = {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const inventory = {
    decrementForOrder: jest.fn(),
    restockForCancelledOrder: jest.fn(),
  };

  const audit = {
    recordWithClient: jest.fn(),
  };

  let service: OrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    tx.merchantSettings.findUnique.mockReset();
    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.merchantSettings.findUnique.mockResolvedValue({
      currency: 'USD',
      taxRate: new Prisma.Decimal(0),
      shippingFee: new Prisma.Decimal(0),
      freeShippingThreshold: null,
    });
    prisma.$transaction.mockImplementation(
      async (input: unknown) => {
        if (Array.isArray(input)) {
          return Promise.all(input);
        }

        return (input as (client: typeof tx) => unknown)(tx);
      },
    );
    service = new OrdersService(
      prisma as never,
      inventory as never,
      audit as never,
    );
  });

  it('aggregates duplicate lines and calculates price on the server', async () => {
    tx.product.findMany.mockResolvedValue([product]);
    tx.order.create.mockResolvedValue(order);
    tx.orderItem.create.mockResolvedValue(createdOrder.items[0]);
    tx.order.findUnique.mockResolvedValue(createdOrder);

    const result = await service.create({
      items: [
        { productId: product.id, quantity: 1 },
        { productId: product.id, quantity: 1 },
      ],
    });

    expect(tx.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        subtotal: 200,
        total: 200,
        currency: 'USD',
      }),
    });
    expect(inventory.decrementForOrder).toHaveBeenCalledWith(
      tx,
      product.id,
      2,
      order.id,
    );
    expect(tx.orderItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        quantity: 2,
        unitPrice: product.price,
      }),
    });
    expect(result.total).toBe(200);
    expect(audit.recordWithClient).toHaveBeenCalledWith(
      tx,
      null,
      'ORDER_CREATED',
      'Order',
      order.id,
      expect.objectContaining({
        orderNo: order.orderNo,
        total: 200,
        currency: 'USD',
      }),
    );
  });

  it('calculates configured tax and shipping on the server', async () => {
    tx.product.findMany.mockResolvedValue([product]);
    tx.merchantSettings.findUnique.mockReset();
    tx.merchantSettings.findUnique.mockResolvedValue({
      currency: 'USD',
      taxRate: new Prisma.Decimal('0.10'),
      shippingFee: new Prisma.Decimal('12.50'),
      freeShippingThreshold: new Prisma.Decimal('500'),
    });
    tx.order.create.mockImplementation(async ({ data }: { data: object }) => ({
      ...order,
      ...data,
    }));
    tx.orderItem.create.mockResolvedValue(createdOrder.items[0]);
    tx.order.findUnique.mockResolvedValue({
      ...createdOrder,
      shipping: new Prisma.Decimal('12.50'),
      tax: new Prisma.Decimal('20'),
      total: new Prisma.Decimal('232.50'),
    });

    const result = await service.create({
      items: [{ productId: product.id, quantity: 2 }],
    });

    expect(tx.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        subtotal: 200,
        shipping: 12.5,
        tax: 20,
        total: 232.5,
        currency: 'USD',
      }),
    });
    expect(result.total).toBe(232.5);
  });

  it('waives shipping at the configured threshold', async () => {
    tx.product.findMany.mockResolvedValue([product]);
    tx.merchantSettings.findUnique.mockReset();
    tx.merchantSettings.findUnique.mockResolvedValue({
      currency: 'USD',
      taxRate: new Prisma.Decimal(0),
      shippingFee: new Prisma.Decimal(12),
      freeShippingThreshold: new Prisma.Decimal(200),
    });
    tx.order.create.mockImplementation(async ({ data }: { data: object }) => ({
      ...order,
      ...data,
    }));
    tx.orderItem.create.mockResolvedValue(createdOrder.items[0]);
    tx.order.findUnique.mockResolvedValue(createdOrder);

    await service.create({
      items: [{ productId: product.id, quantity: 2 }],
    });

    expect(tx.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        shipping: 0,
        total: 200,
      }),
    });
  });

  it('restocks once when a cancellable order is cancelled', async () => {
    prisma.order.findUnique
      .mockResolvedValueOnce({
        ...order,
        status: OrderStatus.CONFIRMED,
        items: [{ productId: product.id, quantity: 2 }],
      })
      .mockResolvedValueOnce({
        ...createdOrder,
        status: OrderStatus.CANCELLED,
      });

    await service.updateStatus(
      order.id,
      OrderStatus.CANCELLED,
      'staff-1',
    );

    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: order.id,
        status: OrderStatus.CONFIRMED,
      },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });
    expect(inventory.restockForCancelledOrder).toHaveBeenCalledWith(
      tx,
      order.id,
      [{ productId: product.id, quantity: 2 }],
    );
    expect(audit.recordWithClient).toHaveBeenCalledWith(
      tx,
      'staff-1',
      'ORDER_STATUS_CHANGED',
      'Order',
      order.id,
      {
        from: OrderStatus.CONFIRMED,
        to: OrderStatus.CANCELLED,
      },
    );
  });

  it('rejects a concurrent status transition before restocking', async () => {
    prisma.order.findUnique.mockResolvedValue({
      ...order,
      status: OrderStatus.CONFIRMED,
      items: [{ productId: product.id, quantity: 2 }],
    });
    tx.order.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.updateStatus(
        order.id,
        OrderStatus.CANCELLED,
        'staff-1',
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(inventory.restockForCancelledOrder).not.toHaveBeenCalled();
  });

  it('rejects invalid order status transitions', async () => {
    prisma.order.findUnique.mockResolvedValue({
      ...order,
      status: OrderStatus.SHIPPED,
      items: [],
    });

    await expect(
      service.updateStatus(
        order.id,
        OrderStatus.CANCELLED,
        'staff-1',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
