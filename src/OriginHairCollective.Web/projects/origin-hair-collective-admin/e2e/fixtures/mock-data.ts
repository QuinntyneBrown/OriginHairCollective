// ── Interfaces ──

export interface MetricCardInfo {
  label: string;
  value: string;
  change: string;
}

export interface RecentProductInfo {
  name: string;
  type: string;
  price: string;
  origin: string;
}

export interface RecentInquiryInfo {
  initials: string;
  name: string;
  message: string;
  time: string;
}

export interface ProductInfo {
  name: string;
  type: string;
  texture: string;
  length: string;
  price: string;
  origin: string;
}

export interface OriginInfo {
  country: string;
  region: string;
  description: string;
  products: number;
}

export interface InquiryInfo {
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
}

export interface TestimonialInfo {
  customer: string;
  rating: string;
  review: string;
  status: 'Published' | 'Pending';
  date: string;
}

export interface TrustBarItemInfo {
  icon: string;
  label: string;
  description: string;
  order: number;
  status: string;
}

export interface HeroContentInfo {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

export interface UserInfo {
  initials: string;
  name: string;
  role: string;
}

export interface AuthResponseInfo {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
}

// ── Mock Data ──

export const mockMetrics: MetricCardInfo[] = [
  { label: 'Total Products', value: '47', change: '+8 this month' },
  { label: 'Active Inquiries', value: '23', change: '+15.3%' },
  { label: 'Hair Origins', value: '5', change: '5 countries' },
  { label: 'Testimonials', value: '12', change: '+3 new' },
];

export const mockRecentProducts: RecentProductInfo[] = [
  { name: 'Cambodian Straight Bundle 18"', type: 'Bundle', price: '$185', origin: 'Cambodia' },
  { name: 'Indian Curly Bundle 24"', type: 'Bundle', price: '$175', origin: 'India' },
  { name: 'Vietnamese Wavy Wig 20"', type: 'Wig', price: '$450', origin: 'Vietnam' },
  { name: 'Indonesian Body Wave 22"', type: 'Bundle', price: '$210', origin: 'Indonesia' },
];

export const mockRecentInquiries: RecentInquiryInfo[] = [
  { initials: 'SR', name: 'Sarah Robinson', message: 'Interested in Cambodian bundles', time: '2h ago' },
  { initials: 'MT', name: 'Maya Thompson', message: 'Question about wig customization', time: '5h ago' },
  { initials: 'JC', name: 'Jessica Chen', message: 'Bulk order pricing for salon', time: '1d ago' },
  { initials: 'AW', name: 'Aisha Williams', message: 'Shipping timeline for frontals', time: '2d ago' },
];

export const mockProducts: ProductInfo[] = [
  { name: 'Cambodian Straight Bundle', type: 'Bundle', texture: 'Straight', length: '18"', price: '$185.00', origin: 'Cambodia' },
  { name: 'Indian Curly Bundle', type: 'Bundle', texture: 'Curly', length: '24"', price: '$175.00', origin: 'India' },
  { name: 'Vietnamese Wavy Wig', type: 'Wig', texture: 'Wavy', length: '20"', price: '$450.00', origin: 'Vietnam' },
  { name: 'Indonesian Body Wave', type: 'Bundle', texture: 'Wavy', length: '22"', price: '$210.00', origin: 'Indonesia' },
  { name: 'Myanmar Kinky Closure', type: 'Closure', texture: 'Kinky', length: '16"', price: '$130.00', origin: 'Myanmar' },
];

export const mockOrigins: OriginInfo[] = [
  { country: 'Cambodia', region: 'Phnom Penh', description: 'Naturally thick, durable hair', products: 12 },
  { country: 'India', region: 'Chennai, Tamil Nadu', description: 'Versatile, temple-sourced hair', products: 8 },
  { country: 'Vietnam', region: 'Ho Chi Minh City', description: 'Strong, naturally straight hair', products: 10 },
  { country: 'Indonesia', region: 'Jakarta', description: 'Silky texture, slight wave', products: 9 },
  { country: 'Myanmar', region: 'Yangon', description: 'Soft, lightweight hair', products: 8 },
];

export const mockInquiries: InquiryInfo[] = [
  { name: 'Sarah Robinson', email: 'sarah.r@email.com', phone: '(416) 555-0123', message: 'Interested in Cambodian bundles', date: 'Feb 8' },
  { name: 'Maya Thompson', email: 'maya.t@email.com', phone: '(905) 555-0456', message: 'Question about wig customization', date: 'Feb 7' },
  { name: 'Jessica Chen', email: 'jessica.c@salon.com', phone: '(647) 555-0789', message: 'Bulk order pricing for salon', date: 'Feb 6' },
  { name: 'Aisha Williams', email: 'aisha.w@email.com', phone: '(416) 555-0321', message: 'Shipping timeline for frontals', date: 'Feb 5' },
];

export const mockTestimonials: TestimonialInfo[] = [
  { customer: 'Keisha Brown', rating: '5.0', review: "Best quality hair I've ever purchased!", status: 'Published', date: 'Feb 5' },
  { customer: 'Tamara Davis', rating: '4.5', review: 'Love the natural look and feel!', status: 'Published', date: 'Feb 3' },
  { customer: 'Nicole James', rating: '5.0', review: 'Amazing customer service and fast shipping', status: 'Pending', date: 'Jan 28' },
];

export const mockTrustBarItems: TrustBarItemInfo[] = [
  { icon: 'verified', label: '100% Virgin Hair', description: 'Ethically sourced, unprocessed hair', order: 1, status: 'Active' },
  { icon: 'local_shipping', label: 'Free Shipping', description: 'Free shipping on orders over $150', order: 2, status: 'Active' },
  { icon: 'support_agent', label: '24/7 Support', description: 'Customer support via chat and email', order: 3, status: 'Active' },
  { icon: 'lock', label: 'Secure Payments', description: 'SSL encrypted checkout process', order: 4, status: 'Active' },
];

export const mockHeroContent: HeroContentInfo = {
  title: 'Premium Hair Extensions',
  subtitle: 'Ethically sourced, premium quality',
  ctaText: 'Shop Now',
  ctaLink: '/products',
  imageUrl: '',
};

export const mockUser: UserInfo = {
  initials: 'QM',
  name: 'Quinn M.',
  role: 'Administrator',
};

export const mockAuthResponse: AuthResponseInfo = {
  userId: '00000000-0000-0000-0000-000000000001',
  email: 'admin@originhair.com',
  firstName: 'Quinn',
  lastName: 'Morgan',
  token: 'mock-jwt-token-for-testing',
};

export const mockCredentials = {
  valid: { email: 'admin@originhair.com', password: 'Admin123!' },
  invalid: { email: 'wrong@email.com', password: 'WrongPassword' },
};

export const navItems = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Products', route: '/products', icon: 'inventory_2' },
  { label: 'Origins', route: '/origins', icon: 'public' },
  { label: 'Inquiries', route: '/inquiries', icon: 'mail' },
  { label: 'Testimonials', route: '/testimonials', icon: 'star' },
  { label: 'Hero Content', route: '/hero-content', icon: 'view_carousel' },
  { label: 'Trust Bar', route: '/trust-bar', icon: 'verified' },
];

export const productFormOrigins = ['Cambodia', 'India', 'Vietnam', 'Indonesia', 'Myanmar'];
export const productFormTextures = ['Straight', 'Curly', 'Wavy', 'Kinky', 'Body Wave'];
export const productFormTypes = ['Bundle', 'Wig', 'Closure', 'Frontal'];
