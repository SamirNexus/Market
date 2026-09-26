export type ProductId = string | number;

export interface ProductRating {
  rate: number;
  count: number;
}

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface ProductBase {
  id: ProductId;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export interface Product extends ProductBase {
  slug?: string;
  sku?: string;
  stock?: number;
  status?: ProductStatus;
  rating?: ProductRating;
}

export interface StorefrontProduct extends ProductBase {
  rating: ProductRating;
}

export type ProductInput = Omit<ProductBase, 'id'>;

export interface AdminProductInput extends ProductInput {
  slug: string;
  sku: string;
  stock: number;
}
