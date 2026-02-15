export interface Testimonial {
  id: string;
  customerName: string;
  customerLocation: string | null;
  content: string;
  rating: number;
  imageUrl: string | null;
  createdAt: string;
}

export interface CreateTestimonialRequest {
  customerName: string;
  customerLocation?: string;
  content: string;
  rating: number;
  imageUrl?: string;
}

export interface UpdateTestimonialRequest {
  customerName: string;
  customerLocation?: string;
  content: string;
  rating: number;
  imageUrl?: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  body: string;
  createdAt: string;
}
