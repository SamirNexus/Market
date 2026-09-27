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

  const prisma = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: ProductsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService(prisma as never);
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

  it('creates a product with safe defaults', async () => {
    prisma.product.create.mockResolvedValue(product);

    await service.create({
      title: 'Camera',
      slug: 'camera',
      sku: 'CAM-001',
      price: 100,
      stock: 5,
      description: 'Indoor camera',
      category: 'electronics',
      image: 'https://example.com/camera.jpg',
    });

    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        title: 'Camera',
        slug: 'camera',
        sku: 'CAM-001',
        price: 100,
        stock: 5,
        description: 'Indoor camera',
        category: 'electronics',
        image: 'https://example.com/camera.jpg',
      },
    });
  });

  it('soft-archives a product rather than deleting it', async () => {
    prisma.product.findUnique.mockResolvedValue({ id: product.id });
    prisma.product.update.mockResolvedValue({
      ...product,
      isActive: false,
      status: ProductStatus.ARCHIVED,
    });

    await service.remove(product.id);

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: product.id },
      data: {
        isActive: false,
        status: 'ARCHIVED',
      },
    });
  });
});
