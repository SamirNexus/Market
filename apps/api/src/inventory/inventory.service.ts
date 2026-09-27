import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InventoryMovementType,
  Prisma,
  ProductStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getProductInventory(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        sku: true,
        title: true,
        stock: true,
        status: true,
        isActive: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getMovements(productId: string, take = 50) {
    await this.assertProductExists(productId);

    return this.prisma.inventoryMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(take, 1), 100),
    });
  }

  async adjust(
    productId: string,
    quantity: number,
    reason: string | undefined,
    actorId: string,
  ) {
    if (!Number.isInteger(quantity) || quantity === 0) {
      throw new BadRequestException('Inventory adjustment must be a non-zero integer');
    }

    return this.prisma.$transaction(
      async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            stock: true,
            status: true,
            isActive: true,
          },
        });

        if (!product) {
          throw new NotFoundException('Product not found');
        }

        if (!product.isActive || product.status === ProductStatus.ARCHIVED) {
          throw new ConflictException('Archived products cannot receive inventory adjustments');
        }

        const nextStock = product.stock + quantity;

        if (nextStock < 0) {
          throw new ConflictException('Inventory adjustment would make stock negative');
        }

        const updated = await tx.product.update({
          where: { id: productId },
          data: { stock: nextStock },
        });

        await tx.inventoryMovement.create({
          data: {
            productId,
            type: InventoryMovementType.ADJUSTMENT,
            quantity,
            stockBefore: product.stock,
            stockAfter: nextStock,
            reason: reason?.trim() || null,
          },
        });

        await this.audit.recordWithClient(
          tx,
          actorId,
          'INVENTORY_ADJUSTED',
          'Product',
          productId,
          {
            quantity,
            stockBefore: product.stock,
            stockAfter: nextStock,
            reason: reason?.trim() || null,
          },
        );

        return {
          productId,
          stock: updated.stock,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async decrementForOrder(
    tx: Prisma.TransactionClient,
    productId: string,
    quantity: number,
    orderId: string,
  ) {
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive || product.status !== ProductStatus.ACTIVE) {
      throw new ConflictException('Product is not available for sale');
    }

    const result = await tx.product.updateMany({
      where: {
        id: productId,
        stock: { gte: quantity },
        isActive: true,
        status: ProductStatus.ACTIVE,
      },
      data: {
        stock: { decrement: quantity },
      },
    });

    if (result.count !== 1) {
      throw new ConflictException(`Insufficient stock for ${product.title}`);
    }

    const stockAfter = product.stock - quantity;

    await tx.inventoryMovement.create({
      data: {
        productId,
        orderId,
        type: InventoryMovementType.SALE,
        quantity: -quantity,
        stockBefore: product.stock,
        stockAfter,
        reason: 'Order placed',
      },
    });

    return {
      product,
      stockAfter,
    };
  }

  async restockForCancelledOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<void> {
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { id: true, stock: true },
      });

      if (!product) {
        throw new NotFoundException('Product not found during order restock');
      }

      const stockAfter = product.stock + item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: stockAfter },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          orderId,
          type: InventoryMovementType.RESTOCK,
          quantity: item.quantity,
          stockBefore: product.stock,
          stockAfter,
          reason: 'Order cancelled',
        },
      });
    }
  }

  private async assertProductExists(productId: string): Promise<void> {
    const count = await this.prisma.product.count({
      where: { id: productId },
    });

    if (count === 0) {
      throw new NotFoundException('Product not found');
    }
  }
}
