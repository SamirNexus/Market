import { Module } from '@nestjs/common';
import { ManualPaymentProvider } from './manual-payment.provider';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripePaymentProvider } from './stripe-payment.provider';
import { StripeWebhookService } from './stripe-webhook.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    ManualPaymentProvider,
    StripePaymentProvider,
    StripeWebhookService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
