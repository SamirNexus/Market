import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, ProductStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findPublished(category?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        status: ProductStatus.ACTIVE,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => this.toPublicResponse(product));
  }

  async findPublishedCategories(): Promise<string[]> {
    const categories = await this.prisma.product.findMany({
      where: {
        isActive: true,
        status: ProductStatus.ACTIVE,
      },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return categories.map(({ category }) => category);
  }

  async findPublishedOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        isActive: true,
        status: ProductStatus.ACTIVE,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toPublicResponse(product);
  }

  async findAllForAdmin() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => this.toResponse(product));
  }

  async findAdminCategories(): Promise<string[]> {
    const categories = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return categories.map(({ category }) => category);
  }

  async findOneForAdmin(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toResponse(product);
  }

  async create(input: CreateProductDto, actorId: string) {
    const product = await this.prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          title: input.title,
          slug: input.slug,
          sku: input.sku,
          price: input.price,
          stock: input.stock ?? 0,
          description: input.description,
          category: input.category,
          image: input.image ?? null,
        },
      });

      await this.audit.recordWithClient(
        tx,
        actorId,
        'PRODUCT_CREATED',
        'Product',
        created.id,
        {
          sku: created.sku,
          title: created.title,
        },
      );

      return created;
    });

    return this.toResponse(product);
  }

  async update(id: string, input: UpdateProductDto, actorId: string) {
    const product = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existing) {
        throw new NotFoundException('Product not found');
      }

      const updated = await tx.product.update({
        where: { id },
        data: input,
      });

      await this.audit.recordWithClient(
        tx,
        actorId,
        'PRODUCT_UPDATED',
        'Product',
        id,
        {
          fields: Object.keys(input),
        },
      );

      return updated;
    });

    return this.toResponse(product);
  }

  async remove(id: string, actorId: string) {
    const product = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({
        where: { id },
        select: {
          id: true,
          sku: true,
        },
      });

      if (!existing) {
        throw new NotFoundException('Product not found');
      }

      const archived = await tx.product.update({
        where: { id },
        data: {
          isActive: false,
          status: ProductStatus.ARCHIVED,
        },
      });

      await this.audit.recordWithClient(
        tx,
        actorId,
        'PRODUCT_ARCHIVED',
        'Product',
        id,
        {
          sku: existing.sku,
        },
      );

      return archived;
    });

    return this.toResponse(product);
  }

  private toPublicResponse(product: Product) {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      sku: product.sku,
      price: Number(product.price),
      stock: product.stock,
      description: product.description,
      category: product.category,
      image: product.image ?? '',
      status: ProductStatus.ACTIVE,
    } as const;
  }

  private toResponse(product: Product) {
    return {
      ...product,
      price: Number(product.price),
    };
  }
}
