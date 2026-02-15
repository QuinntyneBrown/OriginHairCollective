# Mane Haus - Frontend Angular Implementation Items

**Derived from:** `docs/AUDIT.md`
**Date:** 2026-02-15

Every item below is a discrete unit of Angular frontend work. Items are grouped by category and ordered by dependency (earlier items unblock later ones).

---

## A. App Infrastructure

These items must be completed first. All service integration and page creation depends on them.

- [ ] **A1.** Add `provideHttpClient()` to `app.config.ts` providers array (import from `@angular/common/http`)
- [ ] **A2.** Add `withInterceptors([...])` to `provideHttpClient()` call to support future auth and error interceptors
- [ ] **A3.** Create environment configuration (e.g. `src/environments/environment.ts` and `environment.development.ts`) with `apiBaseUrl` property for API endpoint resolution
- [ ] **A4.** Provide `API_BASE_URL` injection token (or equivalent) so all API services from the `api` library can resolve their base URLs
- [ ] **A5.** Create an HTTP error interceptor that handles 401 (redirect to login), 404, and 500 responses globally
- [ ] **A6.** Create an auth interceptor that reads the token from `AuthService.token` signal and attaches `Authorization: Bearer <token>` header to outgoing API requests
- [ ] **A7.** Create an `AuthGuard` (functional route guard) that checks `AuthService.isAuthenticated` and redirects unauthenticated users to `/login`
- [ ] **A8.** Add a reusable loading spinner or skeleton component for use across all pages that fetch async data
- [ ] **A9.** Add a reusable error state component for displaying fallback UI when API calls fail

---

## B. Routing

All new routes go inside the `children` array of the existing `MainLayout` route in `app.routes.ts`.

- [ ] **B1.** Add route: `{ path: 'collection', loadComponent: … }` for the product collection page
- [ ] **B2.** Add route: `{ path: 'collection/:category', loadComponent: … }` for filtered collection views (bundles, closures, frontals, deals)
- [ ] **B3.** Add route: `{ path: 'product/:id', loadComponent: … }` for the product detail page
- [ ] **B4.** Add route: `{ path: 'our-story', loadComponent: … }` for the Our Story page
- [ ] **B5.** Add route: `{ path: 'hair-care', loadComponent: … }` for the Hair Care Guide page
- [ ] **B6.** Add route: `{ path: 'contact', loadComponent: … }` for the Contact page
- [ ] **B7.** Add route: `{ path: 'faq', loadComponent: … }` for the FAQ page
- [ ] **B8.** Add route: `{ path: 'shipping', loadComponent: … }` for the Shipping Info page
- [ ] **B9.** Add route: `{ path: 'returns', loadComponent: … }` for the Returns & Exchanges page
- [ ] **B10.** Add route: `{ path: 'wholesale', loadComponent: … }` for the Wholesale page
- [ ] **B11.** Add route: `{ path: 'ambassador', loadComponent: … }` for the Ambassador Program page
- [ ] **B12.** Add route: `{ path: 'login', loadComponent: … }` for the Login page
- [ ] **B13.** Add route: `{ path: 'register', loadComponent: … }` for the Register page
- [ ] **B14.** Add route: `{ path: 'account', loadComponent: …, canActivate: [AuthGuard] }` for the Account/Profile page
- [ ] **B15.** Add route: `{ path: 'account/orders', loadComponent: …, canActivate: [AuthGuard] }` for Order History
- [ ] **B16.** Add route: `{ path: 'cart', loadComponent: … }` for the Shopping Cart page
- [ ] **B17.** Add route: `{ path: 'checkout', loadComponent: …, canActivate: [AuthGuard] }` for the Checkout page
- [ ] **B18.** Add route: `{ path: 'order/:id', loadComponent: …, canActivate: [AuthGuard] }` for Order Confirmation/Detail
- [ ] **B19.** Add route: `{ path: 'newsletter/confirm', loadComponent: … }` for newsletter confirmation
- [ ] **B20.** Add route: `{ path: 'newsletter/unsubscribe', loadComponent: … }` for newsletter unsubscribe

---

## C. Navigation & Layout Fixes (main-layout)

These fix the existing MainLayout component so all links point to real routes.

- [ ] **C1.** Import `RouterLink` and `RouterLinkActive` into `MainLayout` component imports array
- [ ] **C2.** Replace `navLinks` href values with `routerLink` paths: `Collection` → `/collection`, `Our Story` → `/our-story`, `Hair Care` → `/hair-care`, `Contact` → `/contact`
- [ ] **C3.** Change header nav `<a [href]="link.href">` to `<a [routerLink]="link.href">` and add `routerLinkActive="active"` for active state highlighting
- [ ] **C4.** Change mobile nav `<a [href]="link.href">` to `<a [routerLink]="link.href">` with the same active state
- [ ] **C5.** Bind `routerLink="/collection"` to both "SHOP NOW" `<lib-button>` elements (header line 8 and mobile nav line 37) — wrap in `<a>` or use `(click)` with `Router.navigate`
- [ ] **C6.** Update `shopLinks` hrefs: `Bundles` → `/collection/bundles`, `Closures` → `/collection/closures`, `Frontals` → `/collection/frontals`, `Bundle Deals` → `/collection/deals`
- [ ] **C7.** Update `companyLinks` hrefs: `Our Story` → `/our-story`, `Contact` → `/contact`, `Wholesale` → `/wholesale`, `Ambassador Program` → `/ambassador`
- [ ] **C8.** Update `supportLinks` hrefs: `Hair Care Guide` → `/hair-care`, `Shipping Info` → `/shipping`, `Returns & Exchanges` → `/returns`, `FAQ` → `/faq`
- [ ] **C9.** Change `FooterLinkColumnComponent` footer `<a [href]>` bindings to use `routerLink` instead (or update the shared component to accept `routerLink` mode)
- [ ] **C10.** Replace hardcoded copyright year `2026` on line 70 of `main-layout.html` with dynamic expression (e.g. a `currentYear` property set to `new Date().getFullYear()`)
- [ ] **C11.** Ensure mobile nav closes after a link is tapped by calling `toggleMobileMenu()` on every `routerLink` click (currently only on overlay click and close button)

---

## D. Chat Widget Backend Integration (main-layout)

- [ ] **D1.** Inject `ChatService` into `MainLayout` component
- [ ] **D2.** Add a `@ViewChild(ChatWidgetComponent)` reference to access the chat widget instance
- [ ] **D3.** Bind `(messageSent)="onChatMessage($event)"` on the `<lib-chat-widget>` element in `main-layout.html`
- [ ] **D4.** Implement `onChatMessage(message: string)` method: on first message call `ChatService.createConversation()` to get a `conversationId`, then call `ChatService.sendMessage()` for each subsequent message
- [ ] **D5.** Store the `conversationId` and `sessionId` in component state (or localStorage for persistence across refreshes)
- [ ] **D6.** After each `sendMessage` response, call `chatWidget.addAiMessage(response.content)` to display the backend reply
- [ ] **D7.** Set `chatWidget.isTyping` signal to `true` before API call and `false` after response/error

---

## E. Home Page — Replace Mock Data with Service Calls

### E1–E4: Product Section
- [ ] **E1.** Inject `CatalogService` into `HomePage` component
- [ ] **E2.** Create a `products` signal or observable that calls `CatalogService.getProducts()` on init
- [ ] **E3.** Replace the three hardcoded `<lib-product-card>` elements (lines 42–63 of `home.html`) with `@for (product of products(); track product.id)` iterating over the service response
- [ ] **E4.** Map `HairProduct` model fields to `ProductCardComponent` inputs: `product.imageUrl` → `imageUrl`, `product.name` → `title`, `product.description` → `description`, format `product.price` → `price` string (e.g. `"FROM $" + product.price`)

### E5–E7: Testimonials Section
- [ ] **E5.** Inject `ContentService` into `HomePage` component
- [ ] **E6.** Create a `testimonials` signal that calls `ContentService.getTestimonials()` on init
- [ ] **E7.** Replace the single hardcoded `<lib-testimonial-card>` (lines 92–95) with `@for (t of testimonials(); track t.id)` rendering multiple testimonial cards (or a carousel)

### E8–E9: Community Gallery Section
- [ ] **E8.** Create a `galleryImages` signal that calls `ContentService.getGallery()` or `ContentService.getGalleryByCategory('community')` on init
- [ ] **E9.** Replace the hardcoded `communityPhotos` array (lines 50–57 of `home.ts`) with the `galleryImages` signal data, mapping `GalleryImage.imageUrl` to the template

### E10–E11: Product Card Click-Through
- [ ] **E10.** Wrap each `<lib-product-card>` in an `<a [routerLink]="['/product', product.id]">` or add a `(click)` handler that navigates to `/product/:id`
- [ ] **E11.** Add `cursor: pointer` styling to product cards to indicate they are interactive

### E12: Hero Buttons
- [ ] **E12.** Bind the hero "SHOP NOW" button (line 11 of `home.html`) to `routerLink="/collection"` and the "OUR STORY" button (line 12) to `routerLink="/our-story"`

### E13: Final CTA Button
- [ ] **E13.** Bind the final CTA "SHOP NOW" button (line 118 of `home.html`) to `routerLink="/collection"`

### E14: Loading & Error States
- [ ] **E14.** Add loading skeletons for the products grid, testimonials section, and community gallery while data is being fetched
- [ ] **E15.** Add error fallback UI if `CatalogService` or `ContentService` calls fail

---

## F. New Pages — Create Components

Each page is a new standalone Angular component with its own `.ts`, `.html`, and `.scss` files under `src/app/pages/`.

### Collection Page
- [ ] **F1.** Create `pages/collection/collection.ts` — standalone component that injects `CatalogService`
- [ ] **F2.** Call `CatalogService.getProducts()` on init; store result in a signal
- [ ] **F3.** Build template with `SectionHeaderComponent` and a grid of `ProductCardComponent` elements
- [ ] **F4.** Read `:category` route param; if present, filter products by type (bundles, closures, frontals)
- [ ] **F5.** Add category filter tabs/buttons at the top of the collection page (All, Bundles, Closures, Frontals, Wigs)
- [ ] **F6.** Each product card links to `/product/:id`

### Product Detail Page
- [ ] **F7.** Create `pages/product-detail/product-detail.ts` — standalone component that injects `CatalogService` and `ActivatedRoute`
- [ ] **F8.** Read `:id` route param and call `CatalogService.getProduct(id)`
- [ ] **F9.** Build template displaying product image, name, description, price, origin info, texture, type, length
- [ ] **F10.** Add an "Add to Cart" button that calls `OrderService.addToCart(sessionId, request)`
- [ ] **F11.** Add quantity selector input
- [ ] **F12.** Add loading and error states

### Contact Page
- [ ] **F13.** Create `pages/contact/contact.ts` — standalone component that injects `InquiryService` and `ReactiveFormsModule`
- [ ] **F14.** Build a reactive form with fields: name (required), email (required, email validator), phone (optional), message (required), productId (optional dropdown)
- [ ] **F15.** On submit, call `InquiryService.createInquiry(request)` with form values
- [ ] **F16.** Display success confirmation or error message after submission
- [ ] **F17.** Add form validation error messages for each field

### FAQ Page
- [ ] **F18.** Create `pages/faq/faq.ts` — standalone component that injects `ContentService`
- [ ] **F19.** Call `ContentService.getFaqs()` on init
- [ ] **F20.** Build an accordion UI: each FAQ item expands/collapses to show the answer
- [ ] **F21.** Add category filter buttons (General, Products, Orders) calling `ContentService.getFaqsByCategory(category)`

### Content Pages (Our Story, Hair Care, Shipping, Returns, Ambassador)
- [ ] **F22.** Create `pages/content-page/content-page.ts` — a single reusable standalone component that injects `ContentService` and `ActivatedRoute`
- [ ] **F23.** Map route paths to content slugs: `/our-story` → `'our-story'`, `/hair-care` → `'hair-care-guide'`, `/shipping` → `'shipping-information'`, `/returns` → `'returns-policy'`, `/ambassador` → `'ambassador-program'`
- [ ] **F24.** Call `ContentService.getPage(slug)` based on the current route
- [ ] **F25.** Build template that renders `ContentPage.title` as heading and `ContentPage.body` as content (with HTML rendering if body contains markup)
- [ ] **F26.** Add loading and error/404 states

### Wholesale Page
- [ ] **F27.** Create `pages/wholesale/wholesale.ts` — standalone component that injects `InquiryService`
- [ ] **F28.** Build a wholesale inquiry form (business name, contact name, email, phone, message)
- [ ] **F29.** On submit, call `InquiryService.createInquiry(request)` with form values

---

## G. Authentication Pages

- [ ] **G1.** Create `pages/login/login.ts` — standalone component that injects `AuthService`, `Router`, and `ReactiveFormsModule`
- [ ] **G2.** Build login form with email and password fields
- [ ] **G3.** On submit, call `AuthService.login({ email, password })`; on success navigate to `/account` (or previous route)
- [ ] **G4.** Display error message on login failure (invalid credentials, network error)
- [ ] **G5.** Add link to `/register` for new users
- [ ] **G6.** Create `pages/register/register.ts` — standalone component that injects `AuthService` and `Router`
- [ ] **G7.** Build registration form with fields: firstName, lastName, email, password, confirmPassword, phone (optional)
- [ ] **G8.** On submit, call `AuthService.register(request)`; on success navigate to `/account`
- [ ] **G9.** Add client-side validation: password match, email format, required fields
- [ ] **G10.** Add link to `/login` for existing users
- [ ] **G11.** Create `pages/account/account.ts` — standalone component that injects `AuthService`
- [ ] **G12.** Call `AuthService.getProfile(userId)` on init to display user info
- [ ] **G13.** Build profile editing form using `AuthService.updateProfile()`
- [ ] **G14.** Add logout button calling `AuthService.logout()` and navigating to `/`
- [ ] **G15.** Add navigation link to `/account/orders` for order history

---

## H. E-Commerce Pages

### Cart
- [ ] **H1.** Create a `CartService` (or session manager) that generates/stores a `sessionId` in localStorage for anonymous cart tracking
- [ ] **H2.** Create `pages/cart/cart.ts` — standalone component that injects `OrderService`
- [ ] **H3.** Call `OrderService.getCart(sessionId)` on init to display cart items
- [ ] **H4.** Build template showing each `CartItem`: product name, unit price, quantity, line total
- [ ] **H5.** Add remove button per item calling `OrderService.removeCartItem(itemId)`
- [ ] **H6.** Add "Clear Cart" button calling `OrderService.clearCart(sessionId)`
- [ ] **H7.** Display cart total (sum of line totals)
- [ ] **H8.** Add "Proceed to Checkout" button linking to `/checkout`
- [ ] **H9.** Add cart icon with item count badge to the header in `MainLayout`

### Checkout
- [ ] **H10.** Create `pages/checkout/checkout.ts` — standalone component that injects `OrderService`, `PaymentService`, `AuthService`
- [ ] **H11.** Build form with shipping address fields: customerName, customerEmail, shippingAddress
- [ ] **H12.** Pre-fill fields from `AuthService.user` signal if authenticated
- [ ] **H13.** Display order summary (cart items, totals)
- [ ] **H14.** On submit: call `OrderService.createOrder(sessionId, request)` to create the order
- [ ] **H15.** After order creation: call `PaymentService.createPayment({ orderId, customerEmail, amount, paymentMethod })` to initiate payment
- [ ] **H16.** Handle payment confirmation flow with `PaymentService.confirmPayment()`
- [ ] **H17.** On success, navigate to `/order/:id` confirmation page

### Order Confirmation / Detail
- [ ] **H18.** Create `pages/order-detail/order-detail.ts` — standalone component that injects `OrderService` and `ActivatedRoute`
- [ ] **H19.** Read `:id` route param and call `OrderService.getOrder(id)`
- [ ] **H20.** Display order details: status, items, totals, shipping address, tracking number

### Order History
- [ ] **H21.** Create `pages/order-history/order-history.ts` — standalone component that injects `OrderService` and `AuthService`
- [ ] **H22.** Call `OrderService.getOrdersByUser(userId)` on init
- [ ] **H23.** Display list of past orders with status, date, total, and link to order detail

---

## I. Newsletter Integration

- [ ] **I1.** Create a `NewsletterSignupComponent` (inline or standalone) with an email input and submit button
- [ ] **I2.** Inject `NewsletterService`; on submit call `NewsletterService.subscribe({ email })`
- [ ] **I3.** Display success message ("Check your email to confirm") or error state after submission
- [ ] **I4.** Add the `NewsletterSignupComponent` to the home page (e.g. in the final CTA section or as a new section before the footer)
- [ ] **I5.** Create `pages/newsletter-confirm/newsletter-confirm.ts` — reads `token` query param and calls `NewsletterService.confirmSubscription(token)`
- [ ] **I6.** Create `pages/newsletter-unsubscribe/newsletter-unsubscribe.ts` — reads `token` query param and calls `NewsletterService.unsubscribe(token)`

---

## J. SEO & Meta

- [ ] **J1.** Inject `Title` service (from `@angular/platform-browser`) and set dynamic page titles per route (e.g. "Collection | Mane Haus", "FAQ | Mane Haus")
- [ ] **J2.** Inject `Meta` service and set page-specific `description` meta tags on each page component's init

---

## Summary Counts

| Category | Items |
|----------|-------|
| A. App Infrastructure | 9 |
| B. Routing | 20 |
| C. Navigation & Layout Fixes | 11 |
| D. Chat Widget Integration | 7 |
| E. Home Page Mock Data Removal | 15 |
| F. New Page Components | 29 |
| G. Authentication Pages | 15 |
| H. E-Commerce Pages | 23 |
| I. Newsletter Integration | 6 |
| J. SEO & Meta | 2 |
| **Total** | **137** |
