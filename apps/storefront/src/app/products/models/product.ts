import type { StorefrontProduct } from '@market/contracts/product';

export type Product = StorefrontProduct;
export type {
  ProductInput,
  ProductRating,
  StorefrontProduct,
} from '@market/contracts/product';

export interface CartItem {
  item: Product;
  quantity: number;
}
