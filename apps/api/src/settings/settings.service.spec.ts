import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  const settings = {
    id: 'default',
    storeName: 'Market',
    supportEmail: null,
    currency: 'USD',
    locale: 'en-US',
    logoUrl: null,
    primaryColor: '#111827',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tx = {
    merchantSettings: {
      upsert: jest.fn(),
    },
  };

  const prisma = {
    merchantSettings: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const audit = {
    recordWithClient: jest.fn(),
  };

  let service: SettingsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx),
    );
    service = new SettingsService(prisma as never, audit as never);
  });

  it('returns existing merchant settings', async () => {
    prisma.merchantSettings.findUnique.mockResolvedValue(settings);

    await expect(service.get()).resolves.toEqual(settings);
    expect(prisma.merchantSettings.create).not.toHaveBeenCalled();
  });

  it('repairs a missing default settings row', async () => {
    prisma.merchantSettings.findUnique.mockResolvedValue(null);
    prisma.merchantSettings.create.mockResolvedValue(settings);

    await expect(service.get()).resolves.toEqual(settings);
    expect(prisma.merchantSettings.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: 'default',
        storeName: 'Market',
        currency: 'USD',
      }),
    });
  });

  it('updates merchant settings and records the actor atomically', async () => {
    tx.merchantSettings.upsert.mockResolvedValue({
      ...settings,
      storeName: 'Samir Market',
      supportEmail: 'support@example.com',
    });

    await service.update(
      {
        storeName: ' Samir Market ',
        supportEmail: ' SUPPORT@EXAMPLE.COM ',
      },
      'owner-1',
    );

    expect(tx.merchantSettings.upsert).toHaveBeenCalledWith({
      where: { id: 'default' },
      update: expect.objectContaining({
        storeName: 'Samir Market',
        supportEmail: 'support@example.com',
      }),
      create: expect.objectContaining({
        id: 'default',
        storeName: 'Samir Market',
        supportEmail: 'support@example.com',
      }),
    });

    expect(audit.recordWithClient).toHaveBeenCalledWith(
      tx,
      'owner-1',
      'MERCHANT_SETTINGS_UPDATED',
      'MerchantSettings',
      'default',
      {
        fields: ['storeName', 'supportEmail'],
      },
    );
  });
});
