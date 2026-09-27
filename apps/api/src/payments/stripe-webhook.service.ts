import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

interface StripeEvent {
  id: string;
  type: string;
  data?: {
    object?: {
      id?: string;
      payment_status?: string;
      status?: string;
      metadata?: Record<string, string>;
    };
  };
}

@Injectable()
export class StripeWebhookService {
  constructor(private readonly config: ConfigService) {}

  parseAndVerify(rawBody: Buffer, signatureHeader: string): StripeEvent {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!secret) {
      throw new UnauthorizedException('Stripe webhook is not configured');
    }

    const parts = signatureHeader.split(',').map((part) => part.trim());
    const timestamp = parts
      .find((part) => part.startsWith('t='))
      ?.slice(2);
    const signatures = parts
      .filter((part) => part.startsWith('v1='))
      .map((part) => part.slice(3));

    if (!timestamp || signatures.length === 0) {
      throw new UnauthorizedException('Invalid Stripe signature');
    }

    const ageSeconds = Math.abs(
      Math.floor(Date.now() / 1000) - Number(timestamp),
    );

    if (!Number.isFinite(ageSeconds) || ageSeconds > 300) {
      throw new UnauthorizedException('Expired Stripe signature');
    }

    const payload = `${timestamp}.${rawBody.toString('utf8')}`;
    const expected = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const valid = signatures.some((signature) => {
      const supplied = Buffer.from(signature, 'hex');
      const calculated = Buffer.from(expected, 'hex');

      return supplied.length === calculated.length
        && timingSafeEqual(supplied, calculated);
    });

    if (!valid) {
      throw new UnauthorizedException('Invalid Stripe signature');
    }

    try {
      return JSON.parse(rawBody.toString('utf8')) as StripeEvent;
    } catch {
      throw new BadRequestException('Invalid Stripe webhook payload');
    }
  }
}
