export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface AddToCartRequest {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerEmail: string;
  customerName: string;
  shippingAddress: string;
  userId?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  userId: string | null;
  customerEmail: string;
  customerName: string;
  shippingAddress: string;
  trackingNumber: string | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export interface UpdateOrderStatusRequest {
  status: string;
  trackingNumber?: string;
}
