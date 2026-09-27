import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreatePaymentRequest,
  PaymentProvider,
  ProviderPaymentResult,
} from './payment-provider';

interface StripeCheckoutSession {
  id: string;
  status?: string | null;
  payment_status?: string | null;
  url?: string | null;
}

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  readonly name = 'stripe';

  constructor(private readonly config: ConfigService) {}

  get configured(): boolean {
    return Boolean(
      this.config.get<string>('STRIPE_SECRET_KEY')
      && this.config.get<string>('STRIPE_WEBHOOK_SECRET')
      && this.config.get<string>('PAYMENT_SUCCESS_URL')
      && this.config.get<string>('PAYMENT_CANCEL_URL'),
    );
  }

  async createPayment(
    input: CreatePaymentRequest,
  ): Promise<ProviderPaymentResult> {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    const successUrl = this.config.get<string>('PAYMENT_SUCCESS_URL');
    const cancelUrl = this.config.get<string>('PAYMENT_CANCEL_URL');

    if (!secretKey || !successUrl || !cancelUrl) {
      throw new ServiceUnavailableException(
        'Stripe payment provider is not fully configured',
      );
    }

    const params = new URLSearchParams({
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      'client_reference_id': input.orderId,
      'metadata[orderId]': input.orderId,
      'metadata[orderNo]': input.orderNo,
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': input.currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]': String(
        Math.round(input.amount * 100),
      ),
      'line_items[0][price_data][product_data][name]':
        `Order ${input.orderNo}`,
    });

    const response = await fetch(
      'https://api.stripe.com/v1/checkout/sessions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Idempotency-Key': `market-order-${input.orderId}`,
        },
        body: params.toString(),
      },
    );

    if (!response.ok) {
      throw new BadGatewayException(
        'Payment provider could not create a checkout session',
      );
    }

    const session = await response.json() as StripeCheckoutSession;

    return {
      providerPaymentId: session.id,
      status: session.payment_status === 'paid'
        ? 'SUCCEEDED'
        : 'REQUIRES_ACTION',
      checkoutUrl: session.url ?? null,
      metadata: {
        checkoutSessionStatus: session.status ?? null,
      },
    };
  }
}
