import { NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const product = {
    id: 'product-1',
    title: 'Camera',
    slug: 'camera',
    description: 'Indoor camera',
    price: 100,
    category: 'electronics',
    image: 'https://example.com/camera.jpg',
    sku: 'CAM-001',
    stock: 5,
    status: ProductStatus.ACTIVE,
    isActive: true,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
  };

  const tx = {
    product: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const prisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const audit = {
    recordWithClient: jest.fn(),
  };

  let service: ProductsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );
    service = new ProductsService(prisma as never, audit as never);
  });

  it('returns active products ordered newest first', async () => {
    prisma.product.findMany.mockResolvedValue([product]);

    await expect(service.findAll()).resolves.toEqual([product]);
    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns distinct active categories', async () => {
    prisma.product.findMany.mockResolvedValue([
      { category: 'electronics' },
      { category: 'jewelery' },
    ]);

    await expect(service.findCategories()).resolves.toEqual([
      'electronics',
      'jewelery',
    ]);
  });

  it('throws when a product does not exist', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates a product and audit event in one transaction', async () => {
    tx.product.create.mockResolvedValue(product);

    await service.create(
      {
        title: 'Camera',
        slug: 'camera',
        sku: 'CAM-001',
        price: 100,
        stock: 5,
        description: 'Indoor camera',
        category: 'electronics',
        image: 'https://example.com/camera.jpg',
      },
      'staff-1',
    );

    expect(tx.product.create).toHaveBeenCalled();
    expect(audit.recordWithClient).toHaveBeenCalledWith(
      tx,
      'staff-1',
      'PRODUCT_CREATED',
      'Product',
      product.id,
      expect.objectContaining({ sku: product.sku }),
    );
  });

  it('soft-archives a product and records the actor', async () => {
    tx.product.findUnique.mockResolvedValue({
      id: product.id,
      sku: product.sku,
    });
    tx.product.update.mockResolvedValue({
      ...product,
      isActive: false,
      status: ProductStatus.ARCHIVED,
    });

    await service.remove(product.id, 'admin-1');

    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: product.id },
      data: {
        isActive: false,
        status: 'ARCHIVED',
      },
    });
    expect(audit.recordWithClient).toHaveBeenCalledWith(
      tx,
      'admin-1',
      'PRODUCT_ARCHIVED',
      'Product',
      product.id,
      { sku: product.sku },
    );
  });
});
