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
  image: string | null;
}

export interface Product extends ProductBase {
  slug?: string;
  sku?: string;
  stock?: number;
  status?: ProductStatus;
  rating?: ProductRating;
}

export interface StorefrontProduct extends Omit<ProductBase, 'id' | 'image'> {
  id: number;
  image: string;
  rating: ProductRating;
}

export type ProductInput = Omit<ProductBase, 'id'>;

export interface AdminProductInput extends Omit<ProductInput, 'image'> {
  slug: string;
  sku: string;
  stock: number;
  image?: string;
}
