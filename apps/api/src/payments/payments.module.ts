import { Module } from '@nestjs/common';
import { ManualPaymentProvider } from './manual-payment.provider';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, ManualPaymentProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
