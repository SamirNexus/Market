import type { Product } from '@market/contracts/product';

export type { Product, ProductInput, ProductRating } from '@market/contracts/product';

export interface CartItem {
  item: Product;
  quantity: number;
}
