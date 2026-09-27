export interface MerchantSettings {
  id: 'default';
  storeName: string;
  supportEmail: string | null;
  currency: string;
  locale: string;
  logoUrl: string | null;
  primaryColor: string;
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMerchantSettingsInput {
  storeName?: string;
  supportEmail?: string | null;
  currency?: string;
  locale?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  taxRate?: number;
  shippingFee?: number;
  freeShippingThreshold?: number | null;
}
