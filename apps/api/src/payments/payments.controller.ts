import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';
import { StripeWebhookService } from './stripe-webhook.service';

@Controller()
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly stripeWebhook: StripeWebhookService,
  ) {}

  @Public()
  @Post('orders/:orderId/payments')
  create(
    @Param('orderId') orderId: string,
    @Body() input: CreatePaymentDto,
  ) {
    return this.payments.createForOrder(orderId, input.provider);
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.OWNER)
  @Get('orders/:orderId/payments')
  list(@Param('orderId') orderId: string) {
    return this.payments.listForOrder(orderId);
  }

  @Public()
  @Post('payments/webhooks/stripe')
  stripe(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!request.rawBody || !signature) {
      return { received: false };
    }

    const event = this.stripeWebhook.parseAndVerify(
      request.rawBody,
      signature,
    );

    return this.payments.applyStripeEvent(event);
  }
}
