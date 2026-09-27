export interface CreatePaymentRequest {
  orderId: string;
  orderNo: string;
  amount: number;
  currency: string;
}

export interface ProviderPaymentResult {
  providerPaymentId: string | null;
  status: 'PENDING' | 'REQUIRES_ACTION' | 'SUCCEEDED' | 'FAILED';
  checkoutUrl: string | null;
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentRequest): Promise<ProviderPaymentResult>;
}
