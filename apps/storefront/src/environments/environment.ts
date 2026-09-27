type MarketRuntimeConfig = {
  apiBaseUrl?: string;
};

const runtimeConfig = (
  globalThis as typeof globalThis & {
    __MARKET_CONFIG__?: MarketRuntimeConfig;
  }
).__MARKET_CONFIG__;

export const environment = {
  production: true,
  apiBaseUrl: runtimeConfig?.apiBaseUrl || 'https://fakestoreapi.com',
};
