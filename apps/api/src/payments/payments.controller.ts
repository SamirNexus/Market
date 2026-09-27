import {
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaymentsService } from './payments.service';

@Controller('orders/:orderId/payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Public()
  @Post()
  create(@Param('orderId') orderId: string) {
    return this.payments.createForOrder(orderId);
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.OWNER)
  @Get()
  list(@Param('orderId') orderId: string) {
    return this.payments.listForOrder(orderId);
  }
}
