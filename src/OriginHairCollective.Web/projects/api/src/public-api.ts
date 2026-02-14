/*
 * Public API Surface of api
 */

// Configuration & provider
export { provideApi, API_CONFIG, type ApiConfig } from './lib/api.config';
export { authInterceptor } from './lib/auth.interceptor';

// Models — Common
export type { PagedResult } from './lib/models/common.models';

// Models — Catalog
export type { HairProduct, HairOrigin } from './lib/models/catalog.models';

// Models — Identity
export type { LoginRequest, RegisterRequest, AuthResponse, UserProfile, UpdateProfileRequest } from './lib/models/identity.models';

// Models — Order
export type { CartItem, AddToCartRequest, CreateOrderRequest, OrderItem, Order, UpdateOrderStatusRequest } from './lib/models/order.models';

// Models — Payment
export type { CreatePaymentRequest, Payment, ConfirmPaymentRequest, CreateRefundRequest, Refund } from './lib/models/payment.models';

// Models — Content
export type { Testimonial, CreateTestimonialRequest, GalleryImage, FaqItem, ContentPage } from './lib/models/content.models';

// Models — Inquiry
export type { CreateInquiryRequest, Inquiry } from './lib/models/inquiry.models';

// Models — Notification
export type { NotificationLog } from './lib/models/notification.models';

// Models — Chat
export type { ChatMessage, CreateConversationRequest, SendMessageRequest, Conversation, ConversationSummary, ChatStats } from './lib/models/chat.models';

// Models — Newsletter
export type {
  SubscribeRequest,
  SubscribeResponse,
  Subscriber,
  SubscriberStats,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  Campaign,
  CampaignDetail,
  CampaignRecipient,
} from './lib/models/newsletter.models';

// Services
export { AuthService } from './lib/services/auth.service';
export { CatalogService } from './lib/services/catalog.service';
export { OrderService } from './lib/services/order.service';
export { PaymentService } from './lib/services/payment.service';
export { ContentService } from './lib/services/content.service';
export { InquiryService } from './lib/services/inquiry.service';
export { NotificationService } from './lib/services/notification.service';
export { ChatService } from './lib/services/chat.service';
export { NewsletterService } from './lib/services/newsletter.service';
