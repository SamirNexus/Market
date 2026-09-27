import { Injectable } from '@nestjs/common';
import {
  CreatePaymentRequest,
  PaymentProvider,
  ProviderPaymentResult,
} from './payment-provider';

@Injectable()
export class ManualPaymentProvider implements PaymentProvider {
  readonly name = 'manual';

  async createPayment(
    _input: CreatePaymentRequest,
  ): Promise<ProviderPaymentResult> {
    return {
      providerPaymentId: null,
      status: 'PENDING',
      checkoutUrl: null,
      metadata: {
        mode: 'manual',
        note: 'No external payment gateway is configured.',
      },
    };
  }
}
