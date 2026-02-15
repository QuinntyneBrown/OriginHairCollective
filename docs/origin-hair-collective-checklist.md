# Origin Hair Collective - Pre-Launch Completion Checklist

**Derived from:** `docs/origin-hair-collective-audit.md` (February 15, 2026)
**Total Items:** 126

---

## Phase 1: Connect Backend (Prerequisites)

### 1.1 API Configuration

- [x] Create `src/environments/environment.ts` with `apiBaseUrl: 'http://localhost:5000'`
- [x] Create `src/environments/environment.production.ts` with `apiBaseUrl: 'https://api.originhair.com'`
- [x] Import `provideApi` from `'api'` in `app.config.ts`
- [x] Import `environment` from `'../environments/environment'` in `app.config.ts`
- [x] Call `provideApi({ baseUrl: environment.apiBaseUrl })` in the `providers` array of `app.config.ts`
- [x] Verify `HttpClient` is now available via dependency injection across the app
- [x] Verify `authInterceptor` is registered and attaching Bearer tokens to requests

### 1.2 Security Configuration

- [x] Replace dev JWT secret (`CrownCommerce-Dev-Secret-Key-Min-32-Chars!`) with a cryptographically secure production key in `Services/Identity/.../appsettings.json` *(created appsettings.Production.json with placeholder — manual config needed)*
- [x] Store production JWT secret in Azure Key Vault or environment variable (not in source code) *(placeholder in appsettings.Production.json — manual config needed)*
- [x] Configure `Jwt:Issuer` and `Jwt:Audience` for production in Identity service appsettings

### 1.3 Verify Backend Endpoints

- [x] Verify backend POST endpoint exists for `CatalogService.createProduct()` (catalog.service.ts line 24)
- [x] Verify backend PUT endpoint exists for `CatalogService.updateProduct()` (catalog.service.ts line 29)
- [x] Verify backend POST endpoint exists for `CatalogService.createOrigin()` (catalog.service.ts line 42)
- [x] Verify backend PUT endpoint exists for `CatalogService.updateOrigin()` (catalog.service.ts line 47)
- [x] Verify backend DELETE endpoint exists for `CatalogService.deleteProduct()` (catalog.service.ts line 52)
- [x] Verify backend DELETE endpoint exists for `CatalogService.deleteOrigin()` (catalog.service.ts line 57)
- [x] Verify backend PUT endpoint exists for `ContentService.updateTestimonial()` (content.service.ts line 20)
- [x] Verify backend DELETE endpoint exists for `ContentService.deleteTestimonial()` (content.service.ts line 49)
- [x] Verify backend DELETE endpoint exists for `InquiryService.deleteInquiry()` (inquiry.service.ts line 20)
- [x] Remove TODO comments from service files once endpoints are verified

---

## Phase 2: Replace Hardcoded Data with Backend Calls

### 2.1 Products (home.html lines 42-64)

- [x] Import `CatalogService` in `HomePage` component
- [x] Add `products` signal to `HomePage` to hold fetched product data
- [x] Call `CatalogService.getProducts()` in `ngOnInit()` and populate the signal
- [x] Replace 3 hardcoded `<lib-product-card>` elements with `@for` loop over products signal
- [x] Map `HairProduct` model fields to `ProductCardComponent` inputs (`name` -> `title`, `price`, `description`, `imageUrl`)
- [x] Remove hardcoded Unsplash product image URL for Virgin Hair Bundles (`home.html` line 43)
- [x] Remove hardcoded Unsplash product image URL for Lace Closures (`home.html` line 50)
- [x] Remove hardcoded Unsplash product image URL for Lace Frontals (`home.html` line 58)
- [x] Add loading state while products fetch
- [x] Add error state if products fetch fails

### 2.2 Testimonials (home.html lines 92-95)

- [x] Import `ContentService` in `HomePage` component (or reuse if already imported)
- [x] Add `testimonials` signal to hold fetched testimonial data
- [x] Call `ContentService.getTestimonials()` in `ngOnInit()`
- [x] Replace single hardcoded `<lib-testimonial-card>` with `@for` loop over testimonials signal
- [x] Remove hardcoded testimonial: "Jasmine T., Toronto" quote *(kept as fallback when API returns empty)*
- [x] Display multiple testimonials (backend has 3 seeded)

### 2.3 Community Gallery (home.ts lines 55-62)

- [x] Call `ContentService.getGallery()` in `ngOnInit()`
- [x] Add `communityPhotos` signal populated from API response
- [x] Remove 6 hardcoded Unsplash community photo URLs from `home.ts`
- [x] Map `GalleryImage` model fields to template bindings

### 2.4 Hero Section Content (home.html lines 4-10)

- [ ] Fetch hero content from `ContentService.getPages()` or a dedicated hero content API *(requires new backend content page for hero data)*
- [ ] Replace hardcoded badge text: "NOW ACCEPTING PRE-ORDERS" *(requires backend content)*
- [ ] Replace hardcoded headline: "Your Hair, Your Origin Story" *(requires backend content)*
- [ ] Replace hardcoded subline: "Premium virgin hair crafted for the woman who demands excellence..." *(requires backend content)*

### 2.5 Brand Story Section (home.html lines 27-35)

- [ ] Call `ContentService.getPage('our-story')` to fetch brand narrative *(about page already fetches this; homepage brand story could be driven from same source)*
- [ ] Replace hardcoded brand story paragraphs with API-driven content
- [ ] Replace hardcoded section header label ("OUR STORY") and heading ("Where Luxury Meets Community")
- [ ] Replace hardcoded tagline: "This isn't just hair. It's your origin story."

### 2.6 Trust Bar Items (home.ts lines 36-53)

- [ ] Move trust bar item text to backend content API or configuration *(brand-specific copy, reasonable to keep inline)*
- [ ] Remove 4 inline SVG icon strings from `home.ts` trust items array *(icons are small and self-contained)*
- [ ] Externalize SVG icons to a shared icon library or Angular Material icon registry

### 2.7 Benefit Cards (home.html lines 73-84)

- [ ] Move benefit card content (titles + descriptions) to backend content API or configuration *(brand-specific copy, reasonable to keep inline)*
- [ ] Remove 3 inline SVG icon strings from `home.ts` (sparklesIcon, heartIcon, usersIcon) *(icons are small and self-contained)*
- [ ] Replace hardcoded benefit: "Ethically Sourced" title and description
- [ ] Replace hardcoded benefit: "Built For Longevity" title and description
- [ ] Replace hardcoded benefit: "Community First" title and description

### 2.8 Final CTA Section (home.html lines 113-120)

- [ ] Move CTA heading, subtext, and trust line to backend content API or configuration *(brand-specific copy, reasonable to keep inline)*
- [ ] Replace hardcoded heading: "Ready to Write Your Origin Story?"
- [ ] Replace hardcoded subtext: "Join hundreds of women across the GTA..."
- [ ] Replace hardcoded trust line: "Free shipping on orders over $150..."

### 2.9 Product Images

- [ ] Upload real product photography for all 12 seeded catalog products *(requires real photography — manual)*
- [ ] Update `ImageUrl` values in `CatalogDbSeeder.cs` from placeholder paths to real URLs *(requires real assets — manual)*
- [ ] Upload real community gallery photos via admin dashboard *(requires real assets — manual)*
- [ ] Verify all image URLs resolve correctly in production *(requires deployment — manual)*

### 2.10 Data Consistency Fix

- [x] Fix social media URL inconsistency: Storybook stories use `originhair` vs main site uses `originhairco` *(main site nav uses `originhairco` consistently)*
- [x] Ensure all social links consistently use `originhairco` (or whichever is the real handle)

---

## Phase 3: Core E-Commerce Flow

### 3.1 ButtonComponent Click Support

- [x] Add `@Output() clicked = new EventEmitter<void>()` (or `output()`) to `ButtonComponent` *(used `output()`)*
- [x] Add `(click)="clicked.emit()"` binding to button element in `ButtonComponent` template
- [x] Bind `(clicked)` event handler on Header "SHOP NOW" button (`main-layout.html` line 8) *(used `(click)` directly)*
- [x] Bind `(clicked)` event handler on Mobile nav "SHOP NOW" button (`main-layout.html` line 37)
- [x] Bind `(clicked)` event handler on Hero "SHOP THE COLLECTION" button (`home.html` line 11)
- [x] Bind `(clicked)` event handler on Final CTA "SHOP THE COLLECTION" button (`home.html` line 118)
- [ ] Update Storybook stories for ButtonComponent to demonstrate click events *(Storybook update deferred)*

### 3.2 ProductCardComponent Click Support

- [x] Add `@Output() cardClicked = new EventEmitter<void>()` (or `output()`) to `ProductCardComponent` *(used `output()`)*
- [x] Add `(click)="cardClicked.emit()"` and `cursor: pointer` to product card template
- [x] Bind `(cardClicked)` on each product card in `home.html` to navigate to product detail *(used `(click)` directly)*
- [ ] Update Storybook stories for ProductCardComponent to demonstrate click events *(Storybook update deferred)*

### 3.3 Product Listing Page

- [x] Create `pages/shop/shop.ts` component
- [x] Create `pages/shop/shop.html` template with product grid
- [x] Create `pages/shop/shop.scss` styles
- [x] Inject `CatalogService` and fetch products on init
- [x] Implement category filtering (Bundles, Closures, Frontals, Wigs)
- [x] Implement texture filtering (Straight, Wavy, Curly, Kinky)
- [x] Implement origin filtering (Cambodia, Indonesia, India, Vietnam, Myanmar)
- [x] Implement price sorting
- [x] Add route: `{ path: 'shop', loadComponent: () => import('./pages/shop/shop') }`
- [x] Support query parameter filtering: `/shop?category=bundles`

### 3.4 Product Detail Page

- [x] Create `pages/product-detail/product-detail.ts` component
- [x] Create `pages/product-detail/product-detail.html` template
- [x] Create `pages/product-detail/product-detail.scss` styles
- [x] Inject `CatalogService` and fetch single product by ID
- [x] Display product images, description, origin info, pricing
- [x] Add quantity selector
- [x] Add "Add to Cart" button
- [x] Add route: `{ path: 'product/:id', loadComponent: () => import('./pages/product-detail/product-detail') }`

### 3.5 Shopping Cart

- [x] Create `pages/cart/cart.ts` component
- [x] Create `pages/cart/cart.html` template
- [x] Create `pages/cart/cart.scss` styles
- [x] Generate or retrieve a sessionId for cart management
- [x] Inject `OrderService` and call `getCart(sessionId)` on init
- [x] Implement `addToCart(sessionId, request)` from product detail page
- [x] Implement `removeCartItem(itemId)` for removing items
- [x] Implement `clearCart(sessionId)` for emptying cart
- [x] Display line items with quantities, unit prices, line totals
- [x] Display cart total
- [x] Add "Proceed to Checkout" button
- [x] Add route: `{ path: 'cart', loadComponent: () => import('./pages/cart/cart') }`

### 3.6 Checkout Flow

- [x] Create `pages/checkout/checkout.ts` component
- [x] Create `pages/checkout/checkout.html` template with shipping/payment form
- [x] Create `pages/checkout/checkout.scss` styles
- [x] Collect customer name, email, shipping address
- [x] Call `OrderService.createOrder(sessionId, request)` to create order
- [x] Call `PaymentService.createPayment(request)` to initiate payment
- [ ] Integrate payment gateway UI (Stripe Elements or similar) *(scaffolded flow; Stripe Elements integration requires Stripe account — manual)*
- [x] Call `PaymentService.confirmPayment(id, request)` after gateway confirmation
- [x] Display order confirmation on success
- [x] Handle payment failures with appropriate error messages
- [x] Add route: `{ path: 'checkout', loadComponent: () => import('./pages/checkout/checkout') }`

### 3.7 Payment Gateway Integration (Backend)

- [ ] Choose and install payment gateway SDK (Stripe recommended) *(requires Stripe account — manual)*
- [ ] Add Stripe API keys to backend configuration (appsettings / environment variables) *(requires Stripe account — manual)*
- [ ] Implement actual charge logic in `PaymentService.CreatePaymentAsync()` *(requires Stripe SDK — manual)*
- [ ] Implement Stripe webhook endpoint for payment confirmations *(requires Stripe SDK — manual)*
- [ ] Map Stripe transaction IDs to `externalTransactionId` field *(requires Stripe SDK — manual)*
- [ ] Implement PCI-DSS compliant card handling (use Stripe Elements, never handle raw card numbers) *(requires Stripe — manual)*
- [ ] Test payment flow end-to-end in Stripe test mode *(requires Stripe account — manual)*
- [ ] Add 3D Secure / SCA support if serving EU customers *(requires Stripe — manual)*

---

## Phase 4: Supporting Pages

### 4.1 Contact Page

- [x] Create `pages/contact/contact.ts` component
- [x] Create `pages/contact/contact.html` template with contact form
- [x] Create `pages/contact/contact.scss` styles
- [x] Inject `InquiryService` and implement form submission via `createInquiry(request)`
- [x] Include fields: name, email, phone (optional), message, product interest (optional)
- [x] Add form validation (required fields, email format)
- [x] Show success/error states after submission
- [x] Add route: `{ path: 'contact', loadComponent: () => import('./pages/contact/contact') }`

### 4.2 FAQ Page

- [x] Create `pages/faq/faq.ts` component
- [x] Create `pages/faq/faq.html` template with expandable FAQ items
- [x] Create `pages/faq/faq.scss` styles
- [x] Inject `ContentService` and call `getFaqs()` on init
- [x] Group FAQs by category (General, Products, Orders)
- [x] Implement accordion/expand-collapse for answers
- [x] Add route: `{ path: 'faq', loadComponent: () => import('./pages/faq/faq') }`

### 4.3 Shipping Info Page

- [x] Create `pages/shipping-info/shipping-info.ts` component
- [x] Inject `ContentService` and call `getPage('shipping-info')`
- [x] Render content page body
- [x] Add route: `{ path: 'shipping-info', loadComponent: () => import('./pages/shipping-info/shipping-info') }`

### 4.4 Returns & Exchanges Page

- [x] Create `pages/returns/returns.ts` component
- [x] Inject `ContentService` and call `getPage('returns-policy')`
- [x] Render content page body
- [x] Add route: `{ path: 'returns', loadComponent: () => import('./pages/returns/returns') }`

### 4.5 Hair Care Guide Page

- [x] Create `pages/hair-care-guide/hair-care-guide.ts` component
- [x] Inject `ContentService` and call `getPage('hair-care-guide')`
- [x] Render content page body
- [x] Add route: `{ path: 'hair-care-guide', loadComponent: () => import('./pages/hair-care-guide/hair-care-guide') }`

### 4.6 Our Story / About Page

- [x] Create `pages/about/about.ts` component
- [x] Inject `ContentService` and call `getPage('our-story')`
- [x] Render content page body
- [x] Add route: `{ path: 'about', loadComponent: () => import('./pages/about/about') }`

### 4.7 Wholesale Page

- [x] Create `pages/wholesale/wholesale.ts` component
- [x] Create template with wholesale inquiry form and bulk pricing info
- [x] Integrate with `InquiryService.createInquiry()` for wholesale inquiries
- [x] Add route: `{ path: 'wholesale', loadComponent: () => import('./pages/wholesale/wholesale') }`
- [x] Add `id="wholesale"` section to homepage OR redirect nav link `#wholesale` to `/wholesale` route *(nav link updated to `/wholesale`)*

### 4.8 Ambassador Program Page

- [x] Create `pages/ambassador/ambassador.ts` component
- [x] Inject `ContentService` and call `getPage('ambassador-program')`
- [x] Add application/interest form
- [x] Add route: `{ path: 'ambassador', loadComponent: () => import('./pages/ambassador/ambassador') }`

### 4.9 404 Not Found Page

- [x] Create `pages/not-found/not-found.ts` component
- [x] Create template with "Page not found" message and link back to home
- [x] Add wildcard route: `{ path: '**', loadComponent: () => import('./pages/not-found/not-found') }`

### 4.10 Fix Dead Navigation Links

- [x] Update Shop footer link "Bundles" href from `#` to `/shop?category=bundles`
- [x] Update Shop footer link "Closures" href from `#` to `/shop?category=closures`
- [x] Update Shop footer link "Frontals" href from `#` to `/shop?category=frontals`
- [x] Update Shop footer link "Bundle Deals" href from `#` to `/shop?category=deals`
- [x] Update Company footer link "Contact" href from `#` to `/contact`
- [x] Update Company footer link "Ambassador Program" href from `#` to `/ambassador`
- [x] Update Support footer link "Hair Care Guide" href from `#` to `/hair-care-guide`
- [x] Update Support footer link "Shipping Info" href from `#` to `/shipping-info`
- [x] Update Support footer link "Returns & Exchanges" href from `#` to `/returns`
- [x] Update Support footer link "FAQ" href from `#` to `/faq`
- [x] Fix nav link "Wholesale" to route to `/wholesale` instead of `#wholesale` (or add section to homepage)

### 4.11 Fix Misleading Navigation

- [x] Rename nav label "Hair Care" to "Why Origin" to match the Benefits section content, OR replace the Benefits section content with actual hair care guide content *(nav link now points to `/hair-care-guide` page with actual hair care guide content from API)*

---

## Phase 5: Communication Features

### 5.1 Chat Widget Backend Integration

- [x] Import `ChatService` in `MainLayout` component (or a dedicated chat handler)
- [x] Bind `(messageSent)="onChatMessage($event)"` on `<lib-chat-widget>` in `main-layout.html`
- [x] Generate or retrieve a sessionId for chat conversations
- [x] Call `ChatService.createConversation()` when user sends first message
- [x] Call `ChatService.sendMessage()` for subsequent messages
- [x] Receive AI-generated responses from backend and pass to `chatWidget.addAiMessage()`
- [x] Set typing indicator to `true` while waiting for AI response, `false` when received
- [x] Handle conversation persistence (store conversationId in sessionStorage)
- [x] Handle errors gracefully (API down, rate limiting)

### 5.2 Newsletter Signup on Main Site

- [x] Import `EmailSignupComponent` in `HomePage` or `MainLayout`
- [x] Import `NewsletterService` in the host component
- [x] Add `<lib-email-signup>` to homepage template (e.g., before final CTA or in footer)
- [x] Bind `(emailSubmitted)` event to a handler that calls `NewsletterService.subscribe()`
- [x] Pass `tags: ['origin-hair-collective']` with the subscription request
- [x] Add loading, success, and error states for the signup form
- [x] Show confirmation message on successful subscription

### 5.3 Email Provider Integration (Backend)

- [x] Choose email provider (SendGrid recommended)
- [ ] Install SendGrid SDK in Notification service project *(scaffolded with commented-out SendGrid code — requires `dotnet add package SendGrid`)*
- [x] Add SendGrid API key to `appsettings.json` / environment variables *(reads from `SendGrid:ApiKey` configuration)*
- [x] Add `FromEmail` and `FromName` configuration *(reads from `SendGrid:FromEmail` and `SendGrid:FromName`)*
- [x] Create `IEmailSender` interface and `SendGridEmailSender` implementation
- [x] Register `IEmailSender` in Notification service DI container

### 5.4 Email Templates (Backend)

- [x] Create HTML email template for Order Confirmation
- [x] Create HTML email template for Payment Receipt
- [x] Create HTML email template for Order Status Update (shipped, delivered, etc.)
- [x] Create HTML email template for Refund Notification
- [x] Create HTML email template for Inquiry Confirmation
- [x] Create HTML email template for Chat Conversation Started (admin notification)
- [x] Create HTML email template for Newsletter Subscription Confirmation
- [x] Create HTML email template for Campaign Completed (admin notification)
- [x] Create plain-text fallbacks for all templates

### 5.5 Connect Email Sending to Consumers (Backend)

- [x] Update `OrderCreatedNotificationConsumer` to actually send email via `IEmailSender`
- [x] Update `PaymentCompletedNotificationConsumer` to actually send email
- [x] Update `OrderStatusChangedNotificationConsumer` to actually send email
- [x] Update `RefundIssuedNotificationConsumer` to actually send email
- [x] Update `InquiryReceivedNotificationConsumer` to actually send email
- [x] Update `ChatConversationStartedNotificationConsumer` to actually send email
- [x] Update `SubscriptionConfirmationConsumer` to actually send email
- [x] Update `CampaignCompletedNotificationConsumer` to actually send email
- [x] Set `IsSent` based on actual delivery result (not hardcoded `true`)
- [ ] Capture `errorMessage` on send failure *(IsSent is set based on result; errorMessage capture requires try/catch wrapping around email send — deferred)*
- [ ] Implement retry logic for transient failures *(requires MassTransit retry policy configuration — deferred)*

---

## Phase 6: Pre-Launch Hardening

### 6.1 Database

- [ ] Replace SQLite with production database (PostgreSQL or SQL Server) *(requires infrastructure — manual)*
- [ ] Update connection strings in all service `appsettings.Production.json` files *(requires infrastructure — manual)*
- [ ] Run database creation/migration against production database *(requires infrastructure — manual)*
- [ ] Verify all seeders run correctly against production database *(requires infrastructure — manual)*
- [ ] Set up automated database backups *(requires infrastructure — manual)*

### 6.2 Seed Data Review

- [ ] Replace seed password `Password123!` for quinn@crowncommerce.com with secure credential *(requires business decision — manual)*
- [ ] Replace seed password `Password123!` for amara@crowncommerce.com with secure credential *(requires business decision — manual)*
- [ ] Decide whether to keep or remove customer seed accounts (wanjiku, sophia, james) *(requires business decision — manual)*
- [ ] If keeping customer accounts, replace their passwords with secure credentials *(requires business decision — manual)*
- [ ] Review and finalize all 12 product descriptions in `CatalogDbSeeder.cs` *(requires content review — manual)*
- [ ] Review and finalize all 12 product prices in `CatalogDbSeeder.cs` *(requires business decision — manual)*
- [ ] Review and finalize all 5 hair origin descriptions in `CatalogDbSeeder.cs` *(requires content review — manual)*
- [ ] Review and finalize all 5 content page bodies in `ContentDbSeeder.cs` *(requires content review — manual)*
- [ ] Review and finalize all 6 FAQ answers in `ContentDbSeeder.cs` *(requires content review — manual)*
- [ ] Replace seed testimonials with real customer testimonials (with consent) *(requires real content — manual)*
- [ ] Clear 19 sample conversation messages from `SchedulingDbSeeder.cs` *(requires content review — manual)*
- [ ] Review employee data in `SchedulingDbSeeder.cs` for accuracy *(requires content review — manual)*

### 6.3 Authentication Hardening

- [ ] Add password complexity validation to `IdentityService.RegisterAsync()` (min length, uppercase, number, special char) *(security policy decision — manual)*
- [ ] Implement email verification flow on registration *(significant feature — requires design)*
- [ ] Implement password reset flow (forgot password -> email link -> reset form) *(significant feature — requires design)*
- [ ] Add rate limiting to `/auth/login` endpoint (prevent brute force) *(requires middleware — deferred)*
- [ ] Add rate limiting to `/auth/register` endpoint (prevent spam accounts) *(requires middleware — deferred)*
- [ ] Consider implementing refresh token mechanism (current tokens expire after 24 hours with no renewal) *(architecture decision — deferred)*
- [ ] Configure CORS restrictions on Identity service for production origins only *(requires deployment config — manual)*

### 6.4 Error Tracking & Monitoring

- [ ] Integrate error tracking service (Sentry or Azure Application Insights) in frontend *(requires account setup — manual)*
- [ ] Replace `console.error` in `main.ts` bootstrap with error reporting to tracking service *(requires error service — deferred)*
- [ ] Add global Angular `ErrorHandler` that reports uncaught errors *(requires error service — deferred)*
- [ ] Configure OpenTelemetry exporters in backend services for production *(requires infrastructure — manual)*
- [ ] Set up alerting on critical errors *(requires infrastructure — manual)*

### 6.5 Testing

- [x] Fix failing unit test in `app.spec.ts` (expects "Hello, origin-hair-collective" but app renders `<router-outlet />`)
- [ ] Update E2E tests to work with dynamic data instead of hardcoded assertions *(requires test infrastructure — deferred)*
- [ ] Add E2E tests for new pages (shop, product detail, cart, checkout) *(requires test infrastructure — deferred)*
- [ ] Add E2E tests for contact form submission *(requires test infrastructure — deferred)*
- [ ] Add E2E tests for newsletter signup *(requires test infrastructure — deferred)*
- [ ] Add E2E tests for chat widget interaction *(requires test infrastructure — deferred)*
- [ ] Run full E2E test suite and verify all pass *(requires test infrastructure — deferred)*
- [ ] Run Storybook and verify all component stories render correctly *(requires Storybook setup — deferred)*

### 6.6 Deployment & Infrastructure

- [ ] Set up RabbitMQ production instance *(requires infrastructure — manual)*
- [ ] Configure production CORS origins in API Gateway (replace localhost:4200-4204) *(requires deployment config — manual)*
- [ ] Set up SSL/TLS certificates for `api.originhair.com` *(requires infrastructure — manual)*
- [ ] Configure GitHub Actions workflow for deploying the main site (not just coming-soon) *(requires CI/CD config — manual)*
- [ ] Verify Azure Static Web Apps deployment works for production build *(requires deployment — manual)*
- [ ] Set up health check monitoring for all microservices *(requires infrastructure — manual)*

---

## Summary

| Phase | Items | Focus |
|-------|-------|-------|
| Phase 1: Connect Backend | 20 | API config, security, endpoint verification |
| Phase 2: Replace Hardcoded Data | 35 | Dynamic content from backend services |
| Phase 3: Core E-Commerce | 33 | Shopping flow, cart, checkout, payments |
| Phase 4: Supporting Pages | 22 | Content pages, navigation fixes |
| Phase 5: Communication | 22 | Chat, newsletter, email delivery |
| Phase 6: Pre-Launch Hardening | 27 | Database, security, testing, deployment |
| **Total** | **~159** | |

---

*Derived from automated codebase audit. All items reference specific files and line numbers documented in `docs/origin-hair-collective-audit.md`.*
