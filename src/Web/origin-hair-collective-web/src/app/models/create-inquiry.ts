export interface CreateInquiry {
  name: string;
  email: string;
  phone: string | null;
  message: string;
  productId: string | null;
}
