import { createHmac } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';
import { StripeWebhookService } from './stripe-webhook.service';

describe('StripeWebhookService', () => {
  const secret = 'whsec_test_secret';
  const config = {
    get: jest.fn((key: string) =>
      key === 'STRIPE_WEBHOOK_SECRET' ? secret : undefined,
    ),
  };
  const service = new StripeWebhookService(config as never);

  function signature(body: Buffer, timestamp: number): string {
    const digest = createHmac('sha256', secret)
      .update(`${timestamp}.${body.toString('utf8')}`)
      .digest('hex');
    return `t=${timestamp},v1=${digest}`;
  }

  it('accepts a correctly signed current event', () => {
    const body = Buffer.from(JSON.stringify({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_1', payment_status: 'paid' } },
    }));
    const timestamp = Math.floor(Date.now() / 1000);

    expect(
      service.parseAndVerify(body, signature(body, timestamp)),
    ).toEqual(expect.objectContaining({ id: 'evt_1' }));
  });

  it('rejects a modified payload', () => {
    const original = Buffer.from(JSON.stringify({ id: 'evt_1' }));
    const modified = Buffer.from(JSON.stringify({ id: 'evt_2' }));
    const timestamp = Math.floor(Date.now() / 1000);

    expect(() =>
      service.parseAndVerify(modified, signature(original, timestamp)),
    ).toThrow(UnauthorizedException);
  });

  it('rejects an event outside the replay tolerance', () => {
    const body = Buffer.from(JSON.stringify({ id: 'evt_old' }));
    const timestamp = Math.floor(Date.now() / 1000) - 301;

    expect(() =>
      service.parseAndVerify(body, signature(body, timestamp)),
    ).toThrow(UnauthorizedException);
  });
});
