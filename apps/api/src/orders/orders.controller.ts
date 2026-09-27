import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  findAll(@Query() query: ListOrdersQueryDto) {
    return this.orders.findAll(query.status);
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
