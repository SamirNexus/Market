export interface ProductRating {
  rate: number;
  count: number;
}

export interface ProductBase {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export interface Product extends ProductBase {
  rating?: ProductRating;
}

export interface StorefrontProduct extends ProductBase {
  rating: ProductRating;
}

export type ProductInput = Omit<ProductBase, 'id'>;
