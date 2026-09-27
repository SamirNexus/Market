import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  const product = {
    id: 'product-1',
    stock: 10,
    status: ProductStatus.ACTIVE,
    isActive: true,
  };

  const tx = {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    inventoryMovement: {
      create: jest.fn(),
    },
  };

  const prisma = {
    product: {
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    inventoryMovement: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const audit = {
    recordWithClient: jest.fn(),
  };

  let service: InventoryService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );
    service = new InventoryService(prisma as never, audit as never);
  });

  it('rejects an adjustment for an unknown product', async () => {
    tx.product.findUnique.mockResolvedValue(null);

    await expect(service.adjust('missing', 2, 'stock count', 'staff-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('prevents negative stock through manual adjustment', async () => {
    tx.product.findUnique.mockResolvedValue(product);

    await expect(service.adjust(product.id, -11, undefined, 'staff-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('records a successful inventory adjustment', async () => {
    tx.product.findUnique.mockResolvedValue(product);
    tx.product.update.mockResolvedValue({ ...product, stock: 15 });

    await expect(
      service.adjust(product.id, 5, 'delivery received', 'staff-1'),
    ).resolves.toEqual({
      productId: product.id,
      stock: 15,
    });

    expect(tx.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: product.id,
        quantity: 5,
        stockBefore: 10,
        stockAfter: 15,
        reason: 'delivery received',
      }),
    });
    expect(audit.recordWithClient).toHaveBeenCalledWith(
      tx,
      'staff-1',
      'INVENTORY_ADJUSTED',
      'Product',
      product.id,
      expect.objectContaining({
        quantity: 5,
        stockBefore: 10,
        stockAfter: 15,
      }),
    );
  });

  it('atomically refuses an order when stock cannot be decremented', async () => {
    tx.product.findUnique.mockResolvedValue({
      ...product,
      title: 'Camera',
    });
    tx.product.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.decrementForOrder(tx as never, product.id, 20, 'order-1'),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(tx.inventoryMovement.create).not.toHaveBeenCalled();
  });
});
