import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  findAll(@Query('status') status?: OrderStatus) {
    return this.orders.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orders.findOne(id);
  }

  @Post()
  create(@Body() input: CreateOrderDto) {
    return this.orders.create(input);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() input: UpdateOrderStatusDto,
  ) {
    return this.orders.updateStatus(id, input.status);
  }
}
