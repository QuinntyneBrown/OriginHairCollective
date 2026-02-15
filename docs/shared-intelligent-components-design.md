# Design: Sharing Intelligent Components and Pages Between Applications

## Context

The CrownCommerce Angular workspace contains two consumer-facing storefronts:

- **Origin Hair Collective** — a fully functional e-commerce storefront with 15+ pages, all integrated with backend services via the `api` library
- **Mane Haus** — currently a presentational marketing site with a single home page, using the `components` library but no backend integration

Both brands sell hair products through the same backend microservices (Catalog, Order, Payment, Content, etc.) exposed through the same YARP API Gateway. The applications share an identical technical stack but have distinct visual identities.

### Current Library Structure

| Library | Purpose | Service Dependencies |
|---------|---------|---------------------|
| `components` | Presentational UI primitives (Button, ProductCard, ChatWidget, etc.) | None — pure inputs/outputs |
| `api` | HTTP services, models, auth interceptor, config provider | HttpClient, API_CONFIG injection token |

### Problem

Origin Hair Collective has built out full e-commerce functionality (shop, cart, checkout, contact forms, FAQ, content pages, chat). Mane Haus needs the same functionality. Copy-pasting pages between apps would create a maintenance burden across every shared feature: product browsing, cart management, checkout flow, contact forms, content rendering, and chat.

The existing `components` library is strictly presentational — it accepts data via inputs and emits events via outputs, with no service injection. We need a strategy for sharing **intelligent components** — components that inject HTTP services, manage state, handle loading/error flows, and orchestrate business logic.

---

## Terminology

| Term | Definition |
|------|-----------|
| **Presentational component** | A component with no injected services. Receives data via `input()`, emits events via `output()`. Lives in the `components` library today. |
| **Intelligent component** | A component that injects one or more services (e.g., `CatalogService`, `OrderService`), manages async state (loading, error, data), and contains business logic. Also called "smart" or "container" components. |
| **Shared page** | A routable intelligent component intended to be mounted at a route path in multiple applications. |

---

## Current Service Usage Across Origin Hair Collective

Every page except the 404 page injects at least one service:

| Page | Services Used | Operations |
|------|--------------|------------|
| **Home** | CatalogService, ContentService, NewsletterService | Fetch featured products, testimonials, gallery; subscribe to newsletter |
| **Shop** | CatalogService | Fetch all products, client-side filter/sort |
| **Product Detail** | CatalogService, OrderService | Fetch product by ID, add to cart |
| **Cart** | OrderService | Get cart, remove items, clear cart |
| **Checkout** | OrderService, PaymentService | Create order, process payment, confirm payment |
| **Contact** | InquiryService | Submit contact inquiry |
| **FAQ** | ContentService | Fetch FAQ items |
| **About** | ContentService | Fetch "our-story" page content |
| **Wholesale** | InquiryService | Submit wholesale inquiry |
| **Ambassador** | ContentService, InquiryService | Fetch program content, submit application |
| **Shipping Info** | ContentService | Fetch shipping policy |
| **Returns** | ContentService | Fetch returns policy |
| **Hair Care Guide** | ContentService | Fetch hair care guide |
| **MainLayout** | ChatService | Create conversation, send/receive messages |

---

## Design

### Approach: A New `features` Library for Intelligent Components

Introduce a third Angular library — `features` — that sits between `api` (services) and the applications. This library contains intelligent components and shared pages that depend on `api` services.

```
┌─────────────────────┐     ┌─────────────────────┐
│    mane-haus app     │     │  origin-hair-col.   │
│                      │     │       app            │
└──────────┬───────────┘     └──────────┬───────────┘
           │                            │
           │   imports pages/features   │
           ▼                            ▼
┌──────────────────────────────────────────────────┐
│                  features library                 │
│                                                   │
│  Intelligent components & shared pages            │
│  Depends on: api, components                      │
│                                                   │
│  ┌─────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │  shop page   │ │ cart page  │ │ checkout page│ │
│  │  home feat.  │ │ faq page   │ │ contact page │ │
│  │  chat feat.  │ │ content pg │ │ inquiry feat │ │
│  └─────────────┘ └────────────┘ └──────────────┘ │
└──────────────────────┬───────────────────────────┘
                       │
          imports services & models
                       │
           ┌───────────▼───────────┐
           │      api library       │
           │                        │
           │  HTTP services, models │
           │  Auth, config provider │
           └───────────┬───────────┘
                       │
          imports UI primitives
                       │
           ┌───────────▼───────────┐
           │   components library   │
           │                        │
           │  Presentational only   │
           │  Button, ProductCard…  │
           └───────────────────────┘
```

### Dependency Rule

```
applications  →  features  →  api
                           →  components
```

- `components` has **zero** service dependencies (unchanged)
- `api` has **zero** UI dependencies (unchanged)
- `features` depends on both `api` and `components`
- Applications depend on all three but route to `features` pages

### Library Setup

The `features` library follows the same pattern as the existing `api` and `components` libraries:

```
projects/features/
├── ng-package.json
├── package.json
├── tsconfig.lib.json
├── tsconfig.lib.prod.json
├── tsconfig.spec.json
└── src/
    ├── public-api.ts
    └── lib/
        ├── pages/
        │   ├── shop/
        │   │   ├── shop-page.ts
        │   │   └── shop-page.scss
        │   ├── product-detail/
        │   ├── cart/
        │   ├── checkout/
        │   ├── contact/
        │   ├── faq/
        │   ├── content-page/        ← generic content renderer
        │   ├── wholesale/
        │   ├── ambassador/
        │   └── not-found/
        └── intelligent/
            ├── product-grid/        ← fetches & displays products
            ├── cart-summary/        ← fetches & displays cart
            ├── newsletter-signup/   ← wires EmailSignup to NewsletterService
            ├── chat-container/      ← wires ChatWidget to ChatService
            ├── inquiry-form/        ← generic inquiry submission
            ├── testimonials/        ← fetches & displays testimonials
            └── faq-list/            ← fetches & displays FAQs
```

The `tsconfig.json` path mapping adds:

```json
{
  "paths": {
    "api": ["./dist/api"],
    "components": ["./dist/components"],
    "features": ["./dist/features"]
  }
}
```

---

### Theming Strategy: CSS Custom Properties

Both applications already use CSS custom properties for theming. The `components` library references variables like `--color-gold`, `--color-bg-primary`, `--font-heading`, etc. Each application defines these variables in its own `styles.scss`.

The `features` library follows the same convention — all intelligent components and pages reference CSS custom properties rather than hard-coded colors. Each application's global stylesheet defines the property values, giving each brand its own visual identity while sharing identical component logic.

```
Mane Haus styles.scss          Origin Hair Collective styles.scss
─────────────────────          ──────────────────────────────────
--color-gold: #d4b896          --color-gold: #c9a96e
--color-bg-primary: #0c0a09    --color-bg-primary: #faf8f5
--font-heading: 'Cormorant…'   --font-heading: 'Playfair…'
```

Components in `features` use these variables in their styles. No brand-specific values exist inside the library.

---

### Shared Page Design Patterns

#### Pattern 1: Direct Page Export

For pages where the layout and logic are identical across brands, export the page component directly. The application mounts it at a route.

```typescript
// features/src/lib/pages/shop/shop-page.ts
@Component({
  selector: 'feat-shop-page',
  standalone: true,
  imports: [ProductCardComponent, SectionHeaderComponent, ...],
  templateUrl: './shop-page.html',
  styleUrl: './shop-page.scss',
})
export class ShopPage {
  private catalog = inject(CatalogService);

  products = signal<HairProduct[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  // ... filtering, sorting logic
}
```

```typescript
// mane-haus/src/app/app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'shop',
        loadComponent: () => import('features').then(m => m.ShopPage),
      },
      // ...
    ],
  },
];
```

#### Pattern 2: Configurable Page via Injection Token

For pages that need brand-specific content (hero copy, section ordering, featured categories), define a configuration injection token.

```typescript
// features/src/lib/pages/home/home-page.config.ts
export interface HomePageConfig {
  heroTitle: string;
  heroSubtitle: string;
  showGallerySection: boolean;
  showBenefitsSection: boolean;
  featuredProductCount: number;
  newsletterTags: string[];
}

export const HOME_PAGE_CONFIG = new InjectionToken<HomePageConfig>('HOME_PAGE_CONFIG');
```

```typescript
// features/src/lib/pages/home/home-page.ts
@Component({ ... })
export class HomePage {
  private config = inject(HOME_PAGE_CONFIG);
  private catalog = inject(CatalogService);
  // Uses config to control which sections render and with what copy
}
```

```typescript
// mane-haus/src/app/app.routes.ts
{
  path: '',
  loadComponent: () => import('features').then(m => m.HomePage),
  providers: [
    {
      provide: HOME_PAGE_CONFIG,
      useValue: {
        heroTitle: 'Elevated Hair. Elevated You.',
        heroSubtitle: 'Premium virgin hair extensions...',
        showGallerySection: true,
        showBenefitsSection: true,
        featuredProductCount: 3,
        newsletterTags: ['mane-haus', 'storefront'],
      },
    },
  ],
}
```

This keeps the page logic shared while letting each brand customize the content and section visibility through Angular's dependency injection at the route level.

#### Pattern 3: Content Page Factory

Several pages (About, Shipping Info, Returns, Hair Care Guide) follow an identical pattern: fetch a content page by slug from `ContentService` and render it. Rather than creating separate components for each, use a single configurable content page.

```typescript
// features/src/lib/pages/content-page/content-page.ts
export const CONTENT_PAGE_SLUG = new InjectionToken<string>('CONTENT_PAGE_SLUG');

@Component({
  selector: 'feat-content-page',
  standalone: true,
  template: `
    @if (loading()) {
      <div class="content-page__loading">Loading...</div>
    } @else if (content()) {
      <article class="content-page" [innerHTML]="content()!.htmlContent"></article>
    } @else {
      <p class="content-page__error">Content unavailable.</p>
    }
  `,
  styleUrl: './content-page.scss',
})
export class ContentPage {
  private contentService = inject(ContentService);
  private slug = inject(CONTENT_PAGE_SLUG);

  content = signal<ContentPage | null>(null);
  loading = signal(true);

  constructor() {
    this.contentService.getPage(this.slug).subscribe({
      next: page => { this.content.set(page); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
```

```typescript
// Used in either app's routes:
{
  path: 'about',
  loadComponent: () => import('features').then(m => m.ContentPage),
  providers: [{ provide: CONTENT_PAGE_SLUG, useValue: 'our-story' }],
},
{
  path: 'shipping-info',
  loadComponent: () => import('features').then(m => m.ContentPage),
  providers: [{ provide: CONTENT_PAGE_SLUG, useValue: 'shipping-info' }],
},
```

This eliminates 4-5 nearly identical page components.

---

### Intelligent Component Design Patterns

For sub-page features that appear within pages (or within layouts), the `features` library exports intelligent components that wire presentational components to services.

#### Newsletter Signup (Intelligent Wrapper)

```typescript
// features/src/lib/intelligent/newsletter-signup/newsletter-signup.ts
@Component({
  selector: 'feat-newsletter-signup',
  standalone: true,
  imports: [EmailSignupComponent],
  template: `
    @if (submitted()) {
      <p class="newsletter-signup__success">You're on the list!</p>
    } @else {
      <lib-email-signup
        [placeholder]="placeholder()"
        [buttonText]="buttonText()"
        (submitted)="onSubmit($event)"
      />
    }
    @if (error()) {
      <p class="newsletter-signup__error">{{ error() }}</p>
    }
  `,
})
export class NewsletterSignupComponent {
  private newsletter = inject(NewsletterService);

  placeholder = input('Enter your email address');
  buttonText = input('SUBSCRIBE');
  tags = input<string[]>([]);

  submitted = signal(false);
  error = signal<string | null>(null);

  onSubmit(email: string) {
    this.newsletter.subscribe({ email, tags: this.tags() }).subscribe({
      next: () => this.submitted.set(true),
      error: () => this.error.set('Something went wrong. Please try again.'),
    });
  }
}
```

#### Chat Container (Intelligent Wrapper)

```typescript
// features/src/lib/intelligent/chat-container/chat-container.ts
@Component({
  selector: 'feat-chat-container',
  standalone: true,
  imports: [ChatWidgetComponent],
  template: `
    <lib-chat-widget
      [brandName]="brandName()"
      (messageSent)="onMessageSent($event)"
      #chatWidget
    />
  `,
})
export class ChatContainerComponent {
  private chat = inject(ChatService);

  brandName = input('');

  @ViewChild('chatWidget') chatWidget!: ChatWidgetComponent;

  private conversationId: string | null = null;
  private sessionId = crypto.randomUUID();

  onMessageSent(text: string) {
    this.chatWidget.isTyping.set(true);

    if (!this.conversationId) {
      this.chat.createConversation({
        visitorName: 'Guest',
        initialMessage: text,
        sessionId: this.sessionId,
      }).subscribe({
        next: conv => {
          this.conversationId = conv.conversationId;
          this.handleAiReply(conv.messages);
        },
        error: () => this.handleError(),
      });
    } else {
      this.chat.sendMessage(this.conversationId, {
        content: text,
        senderType: 'visitor',
      }).subscribe({
        next: msg => this.chatWidget.addAiMessage(msg.content),
        error: () => this.handleError(),
      });
    }
  }
  // ...
}
```

#### Inquiry Form (Generic, Configurable)

```typescript
// features/src/lib/intelligent/inquiry-form/inquiry-form.ts
@Component({
  selector: 'feat-inquiry-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './inquiry-form.html',
  styleUrl: './inquiry-form.scss',
})
export class InquiryFormComponent {
  private inquiryService = inject(InquiryService);

  subjectPrefix = input('');         // e.g. "[WHOLESALE]", "[AMBASSADOR APPLICATION]"
  showPhoneField = input(true);
  submitLabel = input('Send Message');

  submitted = signal(false);
  error = signal<string | null>(null);

  onSubmit(formData: { name: string; email: string; phone?: string; message: string }) {
    const subject = this.subjectPrefix()
      ? `${this.subjectPrefix()} ${formData.name}`
      : formData.name;
    // ... submit via InquiryService
  }
}
```

This single component replaces the Contact, Wholesale, and Ambassador form logic.

---

### Shared Page Catalog

The following pages move to the `features` library:

| Feature Page | Pattern | Configuration Surface |
|---|---|---|
| `ShopPage` | Direct export | None — identical across brands |
| `ProductDetailPage` | Direct export | None |
| `CartPage` | Direct export | None |
| `CheckoutPage` | Direct export | None |
| `FaqPage` | Direct export | None |
| `NotFoundPage` | Direct export | None |
| `HomePage` | Configurable (injection token) | Hero copy, section visibility, featured product count |
| `ContactPage` | Wraps `InquiryFormComponent` | Subject prefix, field visibility |
| `WholesalePage` | Wraps `InquiryFormComponent` | Subject prefix, intro copy |
| `AmbassadorPage` | Configurable (injection token) | Content slug, subject prefix |
| `ContentPage` (About, Shipping, Returns, Hair Care) | Content factory | Slug via injection token |

### Intelligent Component Catalog

| Intelligent Component | Wraps (from `components`) | Service Dependencies |
|---|---|---|
| `NewsletterSignupComponent` | `EmailSignupComponent` | `NewsletterService` |
| `ChatContainerComponent` | `ChatWidgetComponent` | `ChatService` |
| `InquiryFormComponent` | `ButtonComponent` | `InquiryService` |
| `ProductGridComponent` | `ProductCardComponent` | `CatalogService` |
| `TestimonialsComponent` | `TestimonialCardComponent` | `ContentService` |
| `FaqListComponent` | — | `ContentService` |
| `CartSummaryComponent` | — | `OrderService` |

---

### Application Integration

#### Mane Haus — Adding Backend Integration

```typescript
// mane-haus/src/app/app.config.ts
import { provideApi } from 'api';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideApi({ baseUrl: environment.apiBaseUrl }),   // ← add this
  ],
};
```

```typescript
// mane-haus/src/app/app.routes.ts
import { MainLayout } from './components/main-layout/main-layout';
import { CONTENT_PAGE_SLUG } from 'features';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,  // ← app-specific layout (brand header/footer)
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.HomePage),
        // Home page may stay app-specific if the layout differs significantly,
        // or use the shared HomePage with a config token
      },
      {
        path: 'shop',
        loadComponent: () => import('features').then(m => m.ShopPage),
      },
      {
        path: 'product/:id',
        loadComponent: () => import('features').then(m => m.ProductDetailPage),
      },
      {
        path: 'cart',
        loadComponent: () => import('features').then(m => m.CartPage),
      },
      {
        path: 'checkout',
        loadComponent: () => import('features').then(m => m.CheckoutPage),
      },
      {
        path: 'contact',
        loadComponent: () => import('features').then(m => m.ContactPage),
      },
      {
        path: 'faq',
        loadComponent: () => import('features').then(m => m.FaqPage),
      },
      {
        path: 'about',
        loadComponent: () => import('features').then(m => m.ContentPage),
        providers: [{ provide: CONTENT_PAGE_SLUG, useValue: 'our-story' }],
      },
      {
        path: 'shipping-info',
        loadComponent: () => import('features').then(m => m.ContentPage),
        providers: [{ provide: CONTENT_PAGE_SLUG, useValue: 'shipping-info' }],
      },
      {
        path: '**',
        loadComponent: () => import('features').then(m => m.NotFoundPage),
      },
    ],
  },
];
```

#### Origin Hair Collective — Migration

Origin Hair Collective migrates incrementally. Each page is replaced one at a time:

1. Move the page logic into `features`
2. Update the OHC route to `loadComponent` from `features`
3. Delete the local page file
4. Verify functionality

The `MainLayout` remains app-specific (each brand has its own header, footer, nav links, and visual identity). The layout imports `ChatContainerComponent` from `features` instead of directly using `ChatService`.

---

### What Stays App-Specific

| Concern | Location | Reason |
|---------|----------|--------|
| `MainLayout` (header, footer, nav) | Each application | Brand identity, navigation structure, logo, social links differ |
| `styles.scss` (CSS custom properties) | Each application | Color palette, typography, spacing per brand |
| `app.config.ts` | Each application | Environment-specific API base URL |
| `app.routes.ts` | Each application | Route structure, page availability, config token values |
| `environments/` | Each application | API URLs, feature flags per deployment |
| `index.html` | Each application | Brand title, favicon, font imports, meta tags |

---

### Build Order

Libraries must build in dependency order:

```
1. components  (no deps)
2. api         (no deps)
3. features    (depends on components + api)
4. applications (depend on all three)
```

Add a workspace build script:

```json
{
  "scripts": {
    "build:libs": "ng build components && ng build api && ng build features",
    "build:ohc": "npm run build:libs && ng build origin-hair-collective",
    "build:mh": "npm run build:libs && ng build mane-haus"
  }
}
```

---

### Migration Plan

**Phase 1 — Foundation**
- Create the `features` library (`ng generate library features`)
- Add `features` path mapping to `tsconfig.json`
- Set up build scripts

**Phase 2 — Extract Intelligent Components**
- Move `NewsletterSignupComponent` (wraps `EmailSignupComponent` + `NewsletterService`)
- Move `ChatContainerComponent` (wraps `ChatWidgetComponent` + `ChatService`)
- Move `InquiryFormComponent` (wraps form UI + `InquiryService`)
- Move `ProductGridComponent` (wraps `ProductCardComponent` + `CatalogService`)
- Move `TestimonialsComponent` (wraps `TestimonialCardComponent` + `ContentService`)
- Move `FaqListComponent` (wraps accordion UI + `ContentService`)
- Move `CartSummaryComponent` (wraps cart UI + `OrderService`)

**Phase 3 — Extract Shared Pages**
- Create `ContentPage` with `CONTENT_PAGE_SLUG` token (replaces About, Shipping Info, Returns, Hair Care Guide)
- Move `ShopPage`, `ProductDetailPage`, `CartPage`, `CheckoutPage`
- Move `ContactPage`, `WholesalePage` (using `InquiryFormComponent`)
- Move `FaqPage`, `AmbassadorPage`
- Move `NotFoundPage`

**Phase 4 — Integrate Mane Haus**
- Add `provideApi()` to Mane Haus `app.config.ts`
- Add environment configuration
- Wire up routes to shared pages from `features`
- Update `MainLayout` to use `ChatContainerComponent`
- Add any Mane Haus-specific configuration tokens

**Phase 5 — Clean Up Origin Hair Collective**
- Replace local page imports with `features` imports in routes
- Remove migrated page files
- Verify all functionality

---

### Testing Strategy

- **Unit tests** for intelligent components live in the `features` library alongside the components (`*.spec.ts`)
- Service dependencies are mocked via Angular's `TestBed` — no HTTP calls in unit tests
- **E2E tests** remain per-application (each app has its own Playwright suite) since they test the full branded experience
- **Storybook** stories for intelligent components use mock service providers to render realistic states (loading, error, populated)

---

### Summary

The `features` library creates a clean middle layer: intelligent components and shared pages that contain business logic and service dependencies, sitting between the low-level `api` services and the high-level application shells. Each application retains control over its brand identity (theming, layout, navigation) while sharing all e-commerce logic and page structure. The CSS custom property system already in place makes theming automatic — no conditional logic or brand parameters needed for visual differentiation.
