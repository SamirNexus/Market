import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMerchantSettingsDto } from './dto/update-merchant-settings.dto';

const SETTINGS_ID = 'default';

const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  storeName: 'Market',
  supportEmail: null,
  currency: 'USD',
  locale: 'en-US',
  logoUrl: null,
  primaryColor: '#111827',
  taxRate: 0,
  shippingFee: 0,
  freeShippingThreshold: null,
} as const;

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async get() {
    const existing = await this.prisma.merchantSettings.findUnique({
      where: { id: SETTINGS_ID },
    });

    if (existing) {
      return this.serialize(existing);
    }

    const created = await this.prisma.merchantSettings.create({
      data: DEFAULT_SETTINGS,
    });

    return this.serialize(created);
  }

  async update(input: UpdateMerchantSettingsDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const settings = await tx.merchantSettings.upsert({
        where: { id: SETTINGS_ID },
        update: {
          ...input,
          storeName: input.storeName?.trim(),
          supportEmail:
            input.supportEmail === null
              ? null
              : input.supportEmail?.trim().toLowerCase(),
          logoUrl:
            input.logoUrl === null
              ? null
              : input.logoUrl?.trim(),
        },
        create: {
          ...DEFAULT_SETTINGS,
          ...input,
          storeName: input.storeName?.trim() || DEFAULT_SETTINGS.storeName,
          supportEmail:
            input.supportEmail === null
              ? null
              : input.supportEmail?.trim().toLowerCase() ?? null,
          logoUrl:
            input.logoUrl === null
              ? null
              : input.logoUrl?.trim() ?? null,
        },
      });

      await this.audit.recordWithClient(
        tx,
        actorId,
        'MERCHANT_SETTINGS_UPDATED',
        'MerchantSettings',
        SETTINGS_ID,
        {
          fields: Object.keys(input),
        },
      );

      return this.serialize(settings);
    });
  }
  private serialize<T extends {
    taxRate: { toString(): string } | number;
    shippingFee: { toString(): string } | number;
    freeShippingThreshold: { toString(): string } | number | null;
  }>(settings: T) {
    return {
      ...settings,
      taxRate: Number(settings.taxRate),
      shippingFee: Number(settings.shippingFee),
      freeShippingThreshold:
        settings.freeShippingThreshold === null
          ? null
          : Number(settings.freeShippingThreshold),
    };
  }
}
