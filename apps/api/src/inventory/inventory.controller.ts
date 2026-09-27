import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get(':productId')
  getProductInventory(@Param('productId') productId: string) {
    return this.inventory.getProductInventory(productId);
  }

  @Get(':productId/movements')
  getMovements(
    @Param('productId') productId: string,
    @Query('take') take?: string,
  ) {
    const parsedTake = take ? Number(take) : 50;
    return this.inventory.getMovements(
      productId,
      Number.isFinite(parsedTake) ? parsedTake : 50,
    );
  }

  @Patch(':productId/adjust')
  adjust(
    @Param('productId') productId: string,
    @Body() input: AdjustInventoryDto,
  ) {
    return this.inventory.adjust(productId, input.quantity, input.reason);
  }
}
