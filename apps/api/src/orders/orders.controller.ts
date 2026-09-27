import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.OWNER)
  @Get()
  findAll(@Query() query: ListOrdersQueryDto) {
    return this.orders.findAll(query);
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.OWNER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orders.findOne(id);
  }

  @Public()
  @Post()
  create(@Body() input: CreateOrderDto) {
    return this.orders.create(input);
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.OWNER)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() input: UpdateOrderStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.orders.updateStatus(id, input.status, actor.id);
  }
}
