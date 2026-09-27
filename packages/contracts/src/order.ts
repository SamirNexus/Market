export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderCustomerSummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  title: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export interface AdminOrder {
  id: string;
  orderNo: string;
  customerId: string | null;
  customer: OrderCustomerSummary | null;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface PaginatedOrders {
  items: AdminOrder[];
  total: number;
  page: number;
  limit: number;
}

export type StorefrontOrder = AdminOrder;

export interface CreateStorefrontOrderInput {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
