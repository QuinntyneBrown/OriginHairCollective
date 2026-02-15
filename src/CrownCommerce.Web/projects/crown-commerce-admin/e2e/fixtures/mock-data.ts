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
  title: 'Premium Hair',
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

// ── Subscriber Interfaces & Data ──

export interface SubscriberInfo {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  tags: string[];
  confirmedAt: string | null;
  createdAt: string;
  unsubscribedAt: string | null;
}

export interface SubscriberStatsInfo {
  totalActive: number;
  totalPending: number;
  totalUnsubscribed: number;
  recentSubscribers: number;
}

export const mockSubscribers: SubscriberInfo[] = [
  { id: 'sub-1', email: 'alice@example.com', firstName: 'Alice', lastName: 'Johnson', status: 'Active', tags: ['origin-coming-soon'], confirmedAt: '2025-02-01T10:00:00Z', createdAt: '2025-01-28T09:00:00Z', unsubscribedAt: null },
  { id: 'sub-2', email: 'bob@example.com', firstName: 'Bob', lastName: 'Smith', status: 'Active', tags: ['mane-haus-coming-soon'], confirmedAt: '2025-02-02T11:00:00Z', createdAt: '2025-01-30T08:00:00Z', unsubscribedAt: null },
  { id: 'sub-3', email: 'carol@example.com', firstName: 'Carol', lastName: 'Davis', status: 'Pending', tags: ['origin-coming-soon'], confirmedAt: null, createdAt: '2025-02-05T14:00:00Z', unsubscribedAt: null },
  { id: 'sub-4', email: 'dave@example.com', firstName: 'Dave', lastName: 'Wilson', status: 'Unsubscribed', tags: ['mane-haus-coming-soon'], confirmedAt: '2025-01-15T10:00:00Z', createdAt: '2025-01-10T09:00:00Z', unsubscribedAt: '2025-02-01T16:00:00Z' },
];

export const mockSubscriberStats: SubscriberStatsInfo = {
  totalActive: 42,
  totalPending: 8,
  totalUnsubscribed: 3,
  recentSubscribers: 12,
};

export const mockSubscribersPagedResult = {
  items: mockSubscribers,
  totalCount: 53,
  page: 1,
  pageSize: 20,
};

// ── Employee Interfaces & Data ──

export interface EmployeeInfo {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  jobTitle: string;
  department: string | null;
  timeZone: string;
  status: string;
  presence: string;
  lastSeenAt: string | null;
  createdAt: string;
}

export const mockEmployees: EmployeeInfo[] = [
  { id: 'emp-1', userId: 'user-1', email: 'quinn@crowncommerce.com', firstName: 'Quinn', lastName: 'Mitchell', phone: '+1-555-0101', jobTitle: 'CEO', department: 'Executive', timeZone: 'America/New_York', status: 'Active', presence: 'Online', lastSeenAt: '2025-02-10T10:00:00Z', createdAt: '2024-06-01T00:00:00Z' },
  { id: 'emp-2', userId: 'user-2', email: 'grace@crowncommerce.com', firstName: 'Grace', lastName: 'Ochieng', phone: '+254-700-1234', jobTitle: 'Supply Chain Manager', department: 'Operations', timeZone: 'Africa/Nairobi', status: 'Active', presence: 'Offline', lastSeenAt: '2025-02-09T18:00:00Z', createdAt: '2024-07-15T00:00:00Z' },
  { id: 'emp-3', userId: 'user-3', email: 'maya@crowncommerce.com', firstName: 'Maya', lastName: 'Patel', phone: null, jobTitle: 'Stylist', department: 'Creative', timeZone: 'America/Los_Angeles', status: 'OnLeave', presence: 'Away', lastSeenAt: '2025-02-05T12:00:00Z', createdAt: '2024-09-01T00:00:00Z' },
];

export const mockCurrentEmployee: EmployeeInfo = mockEmployees[0];

// ── Calendar Event & Meeting Data ──

export interface CalendarEventInfo {
  id: string;
  title: string;
  startTimeUtc: string;
  endTimeUtc: string;
  location: string | null;
  joinUrl: string | null;
  status: string;
  attendeeCount: number;
  organizerName: string;
}

export const mockCalendarEvents: CalendarEventInfo[] = [
  { id: 'evt-1', title: 'Weekly Supply Chain Sync', startTimeUtc: '2025-02-17T14:00:00Z', endTimeUtc: '2025-02-17T15:00:00Z', location: 'Conference Room A', joinUrl: null, status: 'Scheduled', attendeeCount: 3, organizerName: 'Quinn Mitchell' },
  { id: 'evt-2', title: 'Product Photo Review', startTimeUtc: '2025-02-18T16:00:00Z', endTimeUtc: '2025-02-18T17:00:00Z', location: null, joinUrl: 'https://meet.example.com/abc', status: 'Scheduled', attendeeCount: 2, organizerName: 'Maya Patel' },
  { id: 'evt-3', title: 'Q1 Planning', startTimeUtc: '2025-02-20T13:00:00Z', endTimeUtc: '2025-02-20T14:30:00Z', location: 'Board Room', joinUrl: null, status: 'InProgress', attendeeCount: 5, organizerName: 'Quinn Mitchell' },
];

// ── Conversation Data ──

export interface ConversationSummaryInfo {
  id: string;
  subject: string;
  meetingId: string | null;
  status: string;
  createdByEmployeeId: string;
  createdAt: string;
  lastMessageAt: string | null;
  messageCount: number;
  participantCount: number;
}

export interface ConversationMessageInfo {
  id: string;
  senderEmployeeId: string;
  content: string;
  sentAt: string;
}

export interface ConversationDetailInfo {
  id: string;
  subject: string;
  meetingId: string | null;
  status: string;
  createdByEmployeeId: string;
  createdAt: string;
  lastMessageAt: string | null;
  messages: ConversationMessageInfo[];
  participants: { employeeId: string; joinedAt: string }[];
}

export const mockConversations: ConversationSummaryInfo[] = [
  { id: 'conv-1', subject: 'Cambodia Shipment Delay', meetingId: null, status: 'Active', createdByEmployeeId: 'emp-1', createdAt: '2025-02-08T10:00:00Z', lastMessageAt: '2025-02-10T09:30:00Z', messageCount: 5, participantCount: 2 },
  { id: 'conv-2', subject: 'New Product Launch Plan', meetingId: 'evt-1', status: 'Active', createdByEmployeeId: 'emp-2', createdAt: '2025-02-06T14:00:00Z', lastMessageAt: '2025-02-09T16:00:00Z', messageCount: 8, participantCount: 3 },
];

export const mockConversationDetail: ConversationDetailInfo = {
  id: 'conv-1',
  subject: 'Cambodia Shipment Delay',
  meetingId: null,
  status: 'Active',
  createdByEmployeeId: 'emp-1',
  createdAt: '2025-02-08T10:00:00Z',
  lastMessageAt: '2025-02-10T09:30:00Z',
  messages: [
    { id: 'msg-1', senderEmployeeId: 'emp-1', content: 'Heads up, the Cambodia shipment is delayed by 3 days.', sentAt: '2025-02-08T10:00:00Z' },
    { id: 'msg-2', senderEmployeeId: 'emp-2', content: 'Thanks for the update. I will notify the warehouse team.', sentAt: '2025-02-08T10:15:00Z' },
  ],
  participants: [
    { employeeId: 'emp-1', joinedAt: '2025-02-08T10:00:00Z' },
    { employeeId: 'emp-2', joinedAt: '2025-02-08T10:00:00Z' },
  ],
};

export const navItemsExtended = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Products', route: '/products', icon: 'inventory_2' },
  { label: 'Origins', route: '/origins', icon: 'public' },
  { label: 'Inquiries', route: '/inquiries', icon: 'mail' },
  { label: 'Testimonials', route: '/testimonials', icon: 'star' },
  { label: 'Hero Content', route: '/hero-content', icon: 'view_carousel' },
  { label: 'Trust Bar', route: '/trust-bar', icon: 'verified' },
  { label: 'Subscribers', route: '/subscribers', icon: 'mail' },
  { label: 'Employees', route: '/employees', icon: 'people' },
  { label: 'Schedule', route: '/schedule', icon: 'calendar_today' },
  { label: 'Conversations', route: '/conversations', icon: 'chat' },
];
