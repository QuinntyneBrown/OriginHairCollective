export interface CreatePaymentRequest {
  orderId: string;
  customerEmail: string;
  amount: number;
  paymentMethod: string;
}

export interface Payment {
  id: string;
  orderId: string;
  customerEmail: string;
  amount: number;
  method: string;
  status: string;
  externalTransactionId: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ConfirmPaymentRequest {
  externalTransactionId: string;
}

export interface CreateRefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  orderId: string;
  customerEmail: string;
  amount: number;
  reason: string;
  createdAt: string;
}
