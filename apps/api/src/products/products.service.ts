import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
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

  async findAll() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => this.toResponse(product));
  }

  async findCategories(): Promise<string[]> {
    const categories = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return categories.map(({ category }) => category);
  }

  async findOne(id: string) {
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
          status: 'ARCHIVED',
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

  private toResponse(product: Product) {
    return {
      ...product,
      price: Number(product.price),
    };
  }
}
