export interface CreateInquiryRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
  productId?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  productId: string | null;
  createdAt: string;
}
