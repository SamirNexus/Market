export interface CartProductLine {
  productId: number;
  quantity: number;
}

export interface AdminCart {
  id: number;
  userId: number;
  date: string;
  products: CartProductLine[];
}
