

export interface ProductRating {
  rate: number;
  count: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
  rating: ProductRating;
}

export interface CartItem {
  item: Product;
  quantity: number;
}
