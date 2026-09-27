import { NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const product = {
    id: 'product-1',
    title: 'Camera',
    slug: 'camera',
    description: 'Indoor camera',
    price: new Prisma.Decimal(100),
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
      findFirst: jest.fn(),
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

  it('returns only published products to the storefront', async () => {
    prisma.product.findMany.mockResolvedValue([product]);

    await expect(service.findPublished()).resolves.toEqual([
      expect.objectContaining({
        id: product.id,
        price: 100,
        status: ProductStatus.ACTIVE,
      }),
    ]);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        status: ProductStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('filters the public catalog by category on the server', async () => {
    prisma.product.findMany.mockResolvedValue([product]);

    await service.findPublished('electronics');

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        status: ProductStatus.ACTIVE,
        category: 'electronics',
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns distinct published categories', async () => {
    prisma.product.findMany.mockResolvedValue([
      { category: 'electronics' },
      { category: 'jewelery' },
    ]);

    await expect(service.findPublishedCategories()).resolves.toEqual([
      'electronics',
      'jewelery',
    ]);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        status: ProductStatus.ACTIVE,
      },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
  });

  it('does not expose draft or archived product details publicly', async () => {
    prisma.product.findFirst.mockResolvedValue(null);

    await expect(
      service.findPublishedOne('missing-or-unpublished'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.product.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'missing-or-unpublished',
        isActive: true,
        status: ProductStatus.ACTIVE,
      },
    });
  });

  it('returns active non-archived products to the admin catalog', async () => {
    prisma.product.findMany.mockResolvedValue([product]);

    await expect(service.findAllForAdmin()).resolves.toEqual([
      {
        ...product,
        price: 100,
      },
    ]);

    expect(prisma.product.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
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
        status: ProductStatus.ARCHIVED,
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
