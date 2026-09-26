import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(input: CreateProductDto) {
    const product = await this.prisma.product.create({
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

    return this.toResponse(product);
  }

  async update(id: string, input: UpdateProductDto) {
    await this.assertExists(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: input,
    });

    return this.toResponse(product);
  }

  async remove(id: string) {
    await this.assertExists(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        isActive: false,
        status: 'ARCHIVED',
      },
    });

    return this.toResponse(product);
  }

  private async assertExists(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private toResponse(product: Product) {
    return {
      ...product,
      price: product.price.toNumber(),
    };
  }
}
