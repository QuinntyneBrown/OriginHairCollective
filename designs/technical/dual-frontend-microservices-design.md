# Dual-Frontend Microservices Architecture — Technical Design

## 1. Overview

This document describes the architectural changes required to evolve the Origin Hair Collective backend microservices into a **multi-brand platform** that serves two distinct consumer-facing frontends:

1. **Origin Hair Collective** — The existing premium virgin hair extensions brand targeting the modern, luxury-conscious woman.
2. **Mane Haus** — A new sister brand with its own visual identity, marketing voice, and customer-facing experience.

Both brands share a single backend microservices infrastructure, reducing operational cost and development effort while maintaining distinct brand identities at the frontend layer. Each brand operates its own marketing site, coming soon page, and (future) e-commerce storefront. A single admin dashboard manages both brands.

### 1.1 Design Principles

- **Shared backend, separate frontends.** All nine microservices serve both brands. Brand identity is a first-class dimension in the data model, not a separate deployment.
- **Brand as a cross-cutting concern.** A `Brand` identifier flows through API requests, domain entities, events, and email templates — comparable to a lightweight multi-tenant discriminator.
- **Minimal disruption to existing architecture.** The four-layer clean architecture, event-driven patterns, Aspire orchestration, and YARP gateway remain unchanged. Changes are additive.
- **Frontend autonomy.** Each Angular application controls its own branding, copy, imagery, and UX. The shared component library provides structural primitives; brand-specific styling is applied at the application level.

---

## 2. Goals and Non-Goals

### Goals

- Introduce a `Brand` discriminator across all microservices so that data, content, campaigns, and chat conversations are brand-scoped.
- Support two independent coming soon pages (Origin Hair Collective, Mane Haus) with brand-specific newsletter signups backed by the same Newsletter microservice.
- Support two independent marketing sites served by the same backend API.
- Provide a single admin dashboard that manages both brands with brand-scoped views and filters.
- Enable brand-specific email branding (sender name, template styles, logos) in the Newsletter and Notification services.
- Enable brand-specific AI chat personalities and product context in the Chat service.
- Route frontend requests through the API Gateway with brand identification via request headers.

### Non-Goals

- Separate database instances per brand (data is co-located, filtered by `Brand` column).
- Separate deployments or Aspire orchestration per brand.
- Brand-specific pricing or payment processing differences (future enhancement).
- A customer-facing brand-switching experience (users interact with one brand at a time).
- White-labeling or dynamic brand creation (the system supports exactly two brands; adding a third would require schema changes).

---

## 3. Brand Identity Model

### 3.1 Brand Enum

A shared enum in `OriginHairCollective.Shared.Contracts` identifies the supported brands:

```csharp
namespace OriginHairCollective.Shared.Contracts;

public enum Brand
{
    OriginHairCollective = 0,
    ManeHaus = 1
}
```

This enum is referenced across all service layers — entities, DTOs, API contracts, event payloads, and email templates.

### 3.2 Brand Configuration

Each brand carries a set of operational parameters stored in `appsettings.json` and accessible via `IOptions<BrandSettings>`:

```csharp
public sealed class BrandSettings
{
    public required BrandConfig OriginHairCollective { get; set; }
    public required BrandConfig ManeHaus { get; set; }

    public BrandConfig GetBrand(Brand brand) => brand switch
    {
        Brand.OriginHairCollective => OriginHairCollective,
        Brand.ManeHaus => ManeHaus,
        _ => throw new ArgumentOutOfRangeException(nameof(brand))
    };
}

public sealed class BrandConfig
{
    public required string DisplayName { get; set; }      // "Origin Hair Collective" or "Mane Haus"
    public required string ShortName { get; set; }         // "Origin" or "Mane Haus"
    public required string BaseUrl { get; set; }           // "https://originhair.com" or "https://manehaus.com"
    public required string FromEmail { get; set; }         // "hello@originhair.com" or "hello@manehaus.com"
    public required string FromName { get; set; }          // "Origin Hair Collective" or "Mane Haus"
    public required string InstagramHandle { get; set; }   // "@OriginHairCollective" or "@ManeHaus"
    public required string InstagramUrl { get; set; }
    public required string ContactEmail { get; set; }
    public required string Tagline { get; set; }           // Brand tagline for emails and coming soon pages
}
```

### 3.3 Brand Configuration (`appsettings.json`)

```json
{
  "Brands": {
    "OriginHairCollective": {
      "DisplayName": "Origin Hair Collective",
      "ShortName": "Origin",
      "BaseUrl": "https://originhair.com",
      "FromEmail": "hello@originhair.com",
      "FromName": "Origin Hair Collective",
      "InstagramHandle": "@OriginHairCollective",
      "InstagramUrl": "https://instagram.com/originhaircollective",
      "ContactEmail": "hello@originhaircollective.com",
      "Tagline": "Premium virgin hair crafted for the modern woman."
    },
    "ManeHaus": {
      "DisplayName": "Mane Haus",
      "ShortName": "Mane Haus",
      "BaseUrl": "https://manehaus.com",
      "FromEmail": "hello@manehaus.com",
      "FromName": "Mane Haus",
      "InstagramHandle": "@ManeHaus",
      "InstagramUrl": "https://instagram.com/manehaus",
      "ContactEmail": "hello@manehaus.com",
      "Tagline": "Luxury hair, boldly redefined."
    }
  }
}
```

### 3.4 Brand Resolution

Frontends include a `X-Brand` HTTP header on every API request. The API Gateway forwards this header to backend services. Each service resolves the brand from the request context.

```csharp
public interface IBrandResolver
{
    Brand GetCurrentBrand();
}

public sealed class HttpBrandResolver : IBrandResolver
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpBrandResolver(IHttpContextAccessor httpContextAccessor)
        => _httpContextAccessor = httpContextAccessor;

    public Brand GetCurrentBrand()
    {
        var header = _httpContextAccessor.HttpContext?.Request.Headers["X-Brand"].FirstOrDefault();
        return header switch
        {
            "ManeHaus" => Brand.ManeHaus,
            _ => Brand.OriginHairCollective  // Default for backwards compatibility
        };
    }
}
```

For MassTransit events, the `Brand` value is included directly in the event payload (see Section 8).

---

## 4. Architecture Overview

### 4.1 System Context Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                     │
│                                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │  Origin Hair         │  │  Mane Haus           │  │  Origin Hair      │  │
│  │  Collective          │  │  Marketing Site      │  │  Collective Admin │  │
│  │  Marketing Site      │  │  (Angular)           │  │  Dashboard        │  │
│  │  (Angular)           │  │                      │  │  (Angular)        │  │
│  │                      │  │  X-Brand: ManeHaus   │  │                   │  │
│  │  X-Brand: Origin     │  │                      │  │  Brand selector   │  │
│  │  HairCollective      │  │                      │  │  in UI            │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────┬─────────┘  │
│             │                         │                        │             │
│  ┌──────────┴───────────┐  ┌──────────┴───────────┐           │             │
│  │  Origin Coming Soon  │  │  Mane Haus           │           │             │
│  │  Page (Angular)      │  │  Coming Soon Page    │           │             │
│  │                      │  │  (Angular)           │           │             │
│  │  X-Brand: Origin     │  │                      │           │             │
│  │  HairCollective      │  │  X-Brand: ManeHaus   │           │             │
│  └──────────┬───────────┘  └──────────┬───────────┘           │             │
└─────────────┼─────────────────────────┼───────────────────────┼─────────────┘
              │                         │                       │
              └────────────┬────────────┘                       │
                           │                                    │
              ┌────────────▼────────────────────────────────────▼──────────────┐
              │                     API GATEWAY (YARP 2.2)                     │
              │                                                                │
              │  Forwards X-Brand header to all backend services               │
              │  Routes: /api/* → services, /hubs/chat → SignalR               │
              └────────┬──────────────────────────────────────────┬────────────┘
                       │                                          │
              ┌────────▼──────────────────────────────────────────▼────────────┐
              │                 MICROSERVICES (9 Services)                      │
              │                                                                │
              │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
              │  │ Catalog  │ │  Chat    │ │ Content  │ │    Identity      │  │
              │  │ Service  │ │ Service  │ │ Service  │ │    Service       │  │
              │  │          │ │          │ │          │ │                  │  │
              │  │ Products │ │ AI Chat  │ │ Pages,   │ │ Users,           │  │
              │  │ scoped   │ │ persona  │ │ FAQs,    │ │ Auth             │  │
              │  │ by Brand │ │ per Brand│ │ Gallery  │ │ per Brand        │  │
              │  └──────────┘ └──────────┘ │ per Brand│ └──────────────────┘  │
              │                            └──────────┘                        │
              │  ┌──────────┐ ┌────────────┐ ┌──────────────┐ ┌────────────┐  │
              │  │ Inquiry  │ │ Newsletter │ │ Notification │ │  Order     │  │
              │  │ Service  │ │ Service    │ │ Service      │ │  Service   │  │
              │  │          │ │            │ │              │ │            │  │
              │  │ Inquiries│ │ Subscribers│ │ Logs all     │ │ Orders     │  │
              │  │ per Brand│ │ Campaigns  │ │ notifications│ │ per Brand  │  │
              │  └──────────┘ │ per Brand  │ │ per Brand    │ └────────────┘  │
              │               └────────────┘ └──────────────┘                  │
              │  ┌──────────┐                                                  │
              │  │ Payment  │  All services share Brand enum + IBrandResolver  │
              │  │ Service  │  All SQLite DBs add Brand column where needed    │
              │  └──────────┘                                                  │
              └──────────────────────────────┬─────────────────────────────────┘
                                             │
                              ┌───────────────▼────────────────┐
                              │     RabbitMQ (MassTransit)     │
                              │                                │
                              │  All events include Brand      │
                              │  field in payload              │
                              └────────────────────────────────┘
```

### 4.2 What Changes per Service

| Service | Brand-Scoped Data | Changes Required |
|---------|-------------------|------------------|
| **Catalog** | `HairProduct`, `HairOrigin` | Add `Brand` column; products can be brand-exclusive or shared |
| **Chat** | `Conversation` | Add `Brand` column; brand-specific system prompts and AI personality |
| **Content** | `ContentPage`, `FaqItem`, `GalleryImage`, `Testimonial` | Add `Brand` column; brand-specific pages and assets |
| **Identity** | `AppUser` | Add `Brand` column for default brand affiliation; users can access both brands |
| **Inquiry** | `Inquiry` | Add `Brand` column; inquiries tagged by originating brand |
| **Newsletter** | `Subscriber`, `Campaign` | Add `Brand` column; brand-specific subscriber lists, sender identities, and email branding |
| **Notification** | `NotificationLog` | Add `Brand` column; brand-tagged audit trail |
| **Order** | `CustomerOrder`, `CartItem` | Add `Brand` column; orders placed through specific brand storefront |
| **Payment** | `PaymentRecord`, `RefundRecord` | Add `Brand` column for audit; payment processing is brand-agnostic |

---

## 5. Service-by-Service Changes

### 5.1 Shared Contracts (`OriginHairCollective.Shared.Contracts`)

**New types:**

```csharp
// Brand enum (see Section 3.1)
public enum Brand { OriginHairCollective = 0, ManeHaus = 1 }
```

**Updated event contracts — all existing events gain a `Brand` field:**

```csharp
// Example: Updated UserRegisteredEvent
public sealed record UserRegisteredEvent(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    bool NewsletterOptIn,
    Brand Brand,               // NEW
    DateTime OccurredAt);

// Example: Updated ProductCatalogChangedEvent
public sealed record ProductCatalogChangedEvent(
    Brand Brand,               // NEW
    DateTime OccurredAt);

// Example: Updated OrderCreatedEvent
public sealed record OrderCreatedEvent(
    Guid OrderId,
    Guid CustomerId,
    decimal TotalAmount,
    Brand Brand,               // NEW
    DateTime OccurredAt);

// Newsletter events — updated
public sealed record SubscriptionRequestedEvent(
    Guid SubscriberId,
    string Email,
    string? FirstName,
    string ConfirmationToken,
    Brand Brand,               // NEW
    DateTime OccurredAt);

public sealed record SubscriberConfirmedEvent(
    Guid SubscriberId,
    string Email,
    Brand Brand,               // NEW
    DateTime OccurredAt);

// Chat events — updated
public sealed record ChatConversationStartedEvent(
    Guid ConversationId,
    string? VisitorName,
    string FirstMessage,
    Brand Brand,               // NEW
    DateTime OccurredAt);
```

### 5.2 Catalog Service

**Entity changes:**

```csharp
public sealed class HairProduct
{
    // ... existing properties ...
    public Brand Brand { get; set; }            // NEW — Brand.OriginHairCollective or Brand.ManeHaus
    public bool IsSharedAcrossBrands { get; set; }  // NEW — If true, visible on both brands
}

public sealed class HairOrigin
{
    // ... existing properties ...
    public Brand Brand { get; set; }            // NEW
}
```

**Database migration:** Add `Brand INTEGER NOT NULL DEFAULT 0` to `HairProducts` and `HairOrigins` tables. Index on `Brand`.

**Repository changes:** All query methods accept an optional `Brand?` parameter. When provided, results are filtered to include items matching the brand OR items where `IsSharedAcrossBrands = true`.

**API changes:** Public catalog endpoints read the `X-Brand` header via `IBrandResolver` and filter results accordingly. Admin endpoints can optionally filter by brand or see all products.

### 5.3 Chat Service

**Entity changes:**

```csharp
public sealed class Conversation
{
    // ... existing properties ...
    public Brand Brand { get; set; }            // NEW
}
```

**Database migration:** Add `Brand INTEGER NOT NULL DEFAULT 0` to `Conversations` table.

**AI integration changes:**

The `SystemPromptBuilder` now accepts a `Brand` parameter and constructs a brand-specific system prompt:

```csharp
public class SystemPromptBuilder
{
    public string Build(
        Brand brand,
        IReadOnlyList<ProductInfo> products,
        IReadOnlyList<OriginInfo> origins,
        BrandConfig brandConfig);
}
```

For **Origin Hair Collective**, the AI personality is warm, luxurious, and focused on premium quality. For **Mane Haus**, the AI personality is bold, modern, and fashion-forward. The system prompt includes the brand name, tagline, contact details, and Instagram handle from `BrandConfig`.

**SignalR Hub changes:** The `StartConversation` method receives the brand from the `X-Brand` header (accessible via `Context.GetHttpContext()`).

### 5.4 Content Service

**Entity changes:**

All content entities gain a `Brand` column:

```csharp
public sealed class ContentPage
{
    // ... existing properties ...
    public Brand Brand { get; set; }
}

public sealed class FaqItem
{
    // ... existing properties ...
    public Brand Brand { get; set; }
}

public sealed class GalleryImage
{
    // ... existing properties ...
    public Brand Brand { get; set; }
}

public sealed class Testimonial
{
    // ... existing properties ...
    public Brand Brand { get; set; }
}
```

**Repository changes:** All queries filter by brand. The admin dashboard can view content for either brand using a brand selector.

### 5.5 Identity Service

**Entity changes:**

```csharp
public sealed class AppUser
{
    // ... existing properties ...
    public Brand DefaultBrand { get; set; }     // NEW — Which brand the user registered through
}
```

Users are not restricted to a single brand. The `DefaultBrand` indicates registration origin for analytics and default experience.

**JWT claims:** A `brand` claim is added to the JWT token representing the user's default brand affiliation. Admin users can switch brand context in the admin dashboard.

### 5.6 Inquiry Service

**Entity changes:**

```csharp
public sealed class Inquiry
{
    // ... existing properties ...
    public Brand Brand { get; set; }
}
```

**API changes:** Inquiries submitted from the Mane Haus site carry `Brand.ManeHaus`. Admin dashboard filters by brand.

### 5.7 Newsletter Service

See **Section 6** for the comprehensive newsletter changes (this is the most impacted service).

### 5.8 Notification Service

**Entity changes:**

```csharp
public sealed class NotificationLog
{
    // ... existing properties ...
    public Brand Brand { get; set; }
}
```

**Consumer changes:** All consumers extract the `Brand` field from the incoming event payload and persist it in the notification log. This enables brand-scoped audit queries.

### 5.9 Order Service

**Entity changes:**

```csharp
public sealed class CustomerOrder
{
    // ... existing properties ...
    public Brand Brand { get; set; }
}

public sealed class CartItem
{
    // ... existing properties ...
    public Brand Brand { get; set; }
}
```

Orders are placed through a specific brand storefront. The `Brand` is resolved from the `X-Brand` header when the order is created.

### 5.10 Payment Service

**Entity changes:**

```csharp
public sealed class PaymentRecord
{
    // ... existing properties ...
    public Brand Brand { get; set; }
}

public sealed class RefundRecord
{
    // ... existing properties ...
    public Brand Brand { get; set; }
}
```

Payment processing itself is brand-agnostic (same Stripe/PayPal account). The `Brand` column is for reporting and audit.

---

## 6. Newsletter Service — Dual-Brand Design

The Newsletter service is the most significantly impacted by dual-brand support because subscriber lists, campaigns, email sender identities, and email templates must all be brand-aware.

### 6.1 Entity Changes

#### `Subscriber`

```csharp
public sealed class Subscriber
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Guid? UserId { get; set; }
    public SubscriberStatus Status { get; set; }
    public string? ConfirmationToken { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UnsubscribedAt { get; set; }
    public string? UnsubscribeToken { get; set; }
    public Brand Brand { get; set; }                    // NEW
    public ICollection<SubscriberTag> Tags { get; set; }
}
```

A single email address can subscribe to both brands independently. The unique constraint changes from `(Email)` to `(Email, Brand)`.

#### `Campaign`

```csharp
public sealed class Campaign
{
    // ... existing properties ...
    public Brand Brand { get; set; }                    // NEW — Which brand this campaign is sent from
}
```

Campaigns are brand-specific. An admin creates a campaign for Origin or for Mane Haus, and it is sent to that brand's subscriber list with that brand's email template and sender identity.

### 6.2 Database Schema Changes

#### `Subscribers` Table

```sql
ALTER TABLE Subscribers ADD COLUMN Brand INTEGER NOT NULL DEFAULT 0;

-- Replace unique index on Email with composite index
DROP INDEX IX_Subscribers_Email;
CREATE UNIQUE INDEX IX_Subscribers_Email_Brand ON Subscribers(Email, Brand);
CREATE INDEX IX_Subscribers_Brand ON Subscribers(Brand);
```

#### `Campaigns` Table

```sql
ALTER TABLE Campaigns ADD COLUMN Brand INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IX_Campaigns_Brand ON Campaigns(Brand);
```

### 6.3 Brand-Specific Email Sender Identity

The `IEmailSender` now uses brand-specific sender configuration:

```csharp
public sealed record EmailMessage(
    string To,
    string Subject,
    string HtmlBody,
    string? PlainTextBody,
    string FromName,           // Resolved from BrandConfig
    string FromEmail,          // Resolved from BrandConfig
    Dictionary<string, string>? Headers);
```

When the `NewsletterAdminService` prepares emails for a campaign, it reads the `FromName` and `FromEmail` from `BrandSettings` based on the campaign's `Brand`.

### 6.4 Brand-Specific Email Templates

The `IEmailContentProcessor` injects brand-appropriate elements:

```csharp
public interface IEmailContentProcessor
{
    string ProcessHtml(
        string htmlBody,
        Guid campaignId,
        Guid subscriberId,
        string unsubscribeToken,
        Brand brand,                // NEW — determines logo, colors, footer text
        BrandConfig brandConfig);   // NEW — provides brand-specific URLs and names
}
```

**Template differences by brand:**

| Element | Origin Hair Collective | Mane Haus |
|---------|----------------------|-----------|
| Logo | Origin Hair Collective logo | Mane Haus logo |
| Color scheme | Gold and charcoal (existing) | Brand-specific palette (TBD) |
| Footer text | "Origin Hair Collective" with OriginHair.com | "Mane Haus" with ManeHaus.com |
| Unsubscribe URL | `https://originhair.com/unsubscribe?token=...` | `https://manehaus.com/unsubscribe?token=...` |
| Social links | `@OriginHairCollective` Instagram | `@ManeHaus` Instagram |

### 6.5 API Changes

All public newsletter endpoints now respect the `X-Brand` header:

```
POST /api/newsletters/subscribe          ← Brand from X-Brand header
GET  /api/newsletters/confirm?token=...  ← Brand from subscriber record (no header needed)
GET  /api/newsletters/unsubscribe?token= ← Brand from subscriber record (no header needed)
```

Admin endpoints accept an optional `brand` query parameter:

```
GET  /api/newsletters/admin/subscribers?brand=ManeHaus&page=1&pageSize=25
GET  /api/newsletters/admin/subscribers/stats?brand=ManeHaus
GET  /api/newsletters/admin/campaigns?brand=OriginHairCollective
POST /api/newsletters/admin/campaigns     ← Brand in request body
```

**Updated DTOs:**

```csharp
public sealed record SubscribeRequestDto(
    string Email,
    string? FirstName,
    string? LastName,
    List<string>? Tags);
    // Brand is resolved from X-Brand header, not the request body

public sealed record CreateCampaignDto(
    string Subject,
    string HtmlBody,
    string? PlainTextBody,
    string? TargetTag,
    DateTime? ScheduledAt,
    Brand Brand);                          // NEW — admin explicitly selects brand

public sealed record SubscriberStatsDto(
    int TotalActive,
    int TotalPending,
    int TotalUnsubscribed,
    int RecentSubscribers,
    Brand Brand);                          // NEW

public sealed record CampaignDto(
    Guid Id,
    string Subject,
    string Status,
    string? TargetTag,
    Brand Brand,                           // NEW
    int TotalRecipients,
    int TotalSent,
    int TotalOpened,
    int TotalClicked,
    int TotalBounced,
    int TotalUnsubscribed,
    DateTime? ScheduledAt,
    DateTime? SentAt,
    DateTime CreatedAt);
```

### 6.6 Service Layer Changes

The `INewsletterSubscriptionService.SubscribeAsync` method resolves the brand from `IBrandResolver`:

```csharp
public async Task<SubscribeResponseDto> SubscribeAsync(SubscribeRequestDto request, CancellationToken ct)
{
    var brand = _brandResolver.GetCurrentBrand();
    // Check for existing subscriber with same email AND brand
    var existing = await _subscriberRepository.GetByEmailAndBrandAsync(request.Email, brand, ct);
    // ... rest of flow uses brand throughout
}
```

The `INewsletterAdminService` uses the explicit `Brand` field from `CreateCampaignDto` for campaign operations, and accepts a `Brand?` filter for subscriber and campaign queries.

### 6.7 Repository Changes

```csharp
public interface ISubscriberRepository
{
    // Updated — brand-scoped lookups
    Task<Subscriber?> GetByEmailAndBrandAsync(string email, Brand brand, CancellationToken ct = default);
    Task<(IReadOnlyList<Subscriber> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, SubscriberStatus? status, string? tag, Brand? brand, CancellationToken ct = default);
    Task<IReadOnlyList<Subscriber>> GetActiveByTagAndBrandAsync(string? tag, Brand brand, CancellationToken ct = default);
    Task<SubscriberStats> GetStatsByBrandAsync(Brand brand, CancellationToken ct = default);
    // ... existing methods remain, but add Brand? overloads
}

public interface ICampaignRepository
{
    Task<(IReadOnlyList<Campaign> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, CampaignStatus? status, Brand? brand, CancellationToken ct = default);
    Task<IReadOnlyList<Campaign>> GetScheduledDueAsync(DateTime asOf, CancellationToken ct = default);
    // ScheduledDue returns all brands — the scheduler processes all due campaigns regardless of brand
    // ... existing methods remain
}
```

---

## 7. Frontend Architecture

### 7.1 Angular Workspace Evolution

The Angular workspace expands from four projects to six:

```
projects/
├── components/                             # Shared component library (unchanged structure)
├── origin-hair-collective/                 # Origin marketing site (existing)
├── origin-hair-collective-admin/           # Admin dashboard (enhanced with brand selector)
├── origin-hair-collective-coming-soon/     # Origin coming soon page (existing, updated)
├── mane-haus/                              # Mane Haus marketing site (NEW)
└── mane-haus-coming-soon/                  # Mane Haus coming soon page (NEW)
```

### 7.2 Shared Component Library Updates

The shared component library (`projects/components/`) remains brand-agnostic. Components accept configuration inputs for brand-specific content:

**`EmailSignupComponent`** — No changes needed. The component emits an `(submitted)` event. The parent page handles API integration including the `X-Brand` header.

**`LogoComponent`** — Add a `brand` input to render the appropriate logo:

```typescript
@Component({ selector: 'lib-logo', ... })
export class LogoComponent {
  @Input() brand: 'origin' | 'mane-haus' = 'origin';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
```

**`SocialIconsComponent`** — No changes. Links are passed as inputs from the parent.

### 7.3 Brand HTTP Interceptor

Each frontend application provides an Angular HTTP interceptor that attaches the `X-Brand` header to all API requests:

```typescript
// Shared utility in the components library or per-app
export function brandInterceptor(brand: Brand): HttpInterceptorFn {
  return (req, next) => {
    const branded = req.clone({
      setHeaders: { 'X-Brand': brand }
    });
    return next(branded);
  };
}

// In origin-hair-collective app.config.ts:
provideHttpClient(
  withInterceptors([brandInterceptor('OriginHairCollective')])
)

// In mane-haus app.config.ts:
provideHttpClient(
  withInterceptors([brandInterceptor('ManeHaus')])
)
```

### 7.4 Origin Hair Collective Coming Soon Page (Updated)

The existing `origin-hair-collective-coming-soon` project is updated to connect its email signup to the Newsletter API with the `X-Brand: OriginHairCollective` header.

**Changes to `app.ts`:**

```typescript
@Component({
  selector: 'app-root',
  imports: [
    LogoComponent,
    DividerComponent,
    BadgeComponent,
    SocialIconsComponent,
    EmailSignupComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly http = inject(HttpClient);

  protected readonly socialLinks: SocialLink[] = [
    { platform: 'instagram', href: 'https://instagram.com/originhaircollective' },
    { platform: 'email', href: 'mailto:hello@originhaircollective.com' },
  ];

  onEmailSubmit(email: string): void {
    this.http.post('/api/newsletters/subscribe', { email })
      .subscribe({
        next: () => { /* show success message */ },
        error: () => { /* show error message */ }
      });
  }
}
```

The app config provides the brand interceptor:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([brandInterceptor('OriginHairCollective')])
    ),
  ],
};
```

### 7.5 Mane Haus Coming Soon Page (New)

A new Angular application at `projects/mane-haus-coming-soon/` with its own brand identity.

**`app.html`:**

```html
<div class="page">
  <div class="page__bg"></div>
  <div class="page__overlay"></div>
  <div class="page__content">

    <header class="header">
      <div class="logo-block">
        <lib-logo brand="mane-haus" size="small" />
      </div>
    </header>

    <main class="hero">
      <lib-divider variant="accent" />
      <h1 class="hero__headline">COMING SOON</h1>
      <lib-divider variant="accent" />
      <p class="hero__tagline">Luxury hair, boldly redefined. Be the first to know when we launch.</p>
      <div class="hero__signup">
        <lib-email-signup (submitted)="onEmailSubmit($event)" />
      </div>
      <lib-badge text="2026" [showDot]="false" />
    </main>

    <footer class="footer">
      <lib-social-icons [links]="socialLinks" />
      <span class="footer__handle">&#64;ManeHaus</span>
      <small class="footer__copyright">&copy; 2026 Mane Haus. All rights reserved.</small>
    </footer>

  </div>
</div>
```

**`app.ts`:**

```typescript
@Component({
  selector: 'app-root',
  imports: [
    LogoComponent,
    DividerComponent,
    BadgeComponent,
    SocialIconsComponent,
    EmailSignupComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly http = inject(HttpClient);

  protected readonly socialLinks: SocialLink[] = [
    { platform: 'instagram', href: 'https://instagram.com/manehaus' },
    { platform: 'email', href: 'mailto:hello@manehaus.com' },
  ];

  onEmailSubmit(email: string): void {
    this.http.post('/api/newsletters/subscribe', { email })
      .subscribe({
        next: () => { /* show success message */ },
        error: () => { /* show error message */ }
      });
  }
}
```

**`app.config.ts`:**

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([brandInterceptor('ManeHaus')])
    ),
  ],
};
```

**`app.scss`:** The Mane Haus coming soon page uses the same structural layout as Origin but with its own brand-specific design tokens:

```scss
:host {
  // Mane Haus uses its own color palette and typography via CSS custom properties
  --color-accent: #c8a97e;          // Warm gold (differentiated from Origin)
  --color-bg-primary: #1a1a1a;
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
}
```

### 7.6 Admin Dashboard — Brand Context

The admin dashboard adds a brand selector (dropdown or toggle) in the top navigation bar. The selected brand filters all data views:

```typescript
@Injectable({ providedIn: 'root' })
export class AdminBrandService {
  private readonly currentBrand = signal<Brand>('OriginHairCollective');

  readonly brand = this.currentBrand.asReadonly();

  setBrand(brand: Brand): void {
    this.currentBrand.set(brand);
  }
}
```

The admin HTTP interceptor reads from `AdminBrandService`:

```typescript
export function adminBrandInterceptor(): HttpInterceptorFn {
  return (req, next) => {
    const brandService = inject(AdminBrandService);
    const branded = req.clone({
      setHeaders: { 'X-Brand': brandService.brand() }
    });
    return next(branded);
  };
}
```

Admin pages for subscribers, campaigns, inquiries, products, content, and chat history all respect the current brand selection.

### 7.7 Angular Workspace Configuration Update

Add to `angular.json`:

```json
{
  "mane-haus-coming-soon": {
    "projectType": "application",
    "schematics": {
      "@schematics/angular:component": {
        "style": "scss"
      }
    },
    "root": "projects/mane-haus-coming-soon",
    "sourceRoot": "projects/mane-haus-coming-soon/src",
    "prefix": "app",
    "architect": {
      "build": {
        "builder": "@angular/build:application",
        "options": {
          "browser": "projects/mane-haus-coming-soon/src/main.ts",
          "tsConfig": "projects/mane-haus-coming-soon/tsconfig.app.json",
          "inlineStyleLanguage": "scss",
          "assets": [
            {
              "glob": "**/*",
              "input": "projects/mane-haus-coming-soon/public"
            }
          ],
          "styles": [
            "projects/mane-haus-coming-soon/src/styles.scss"
          ]
        },
        "configurations": {
          "production": {
            "budgets": [
              { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
              { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
            ],
            "outputHashing": "all"
          },
          "development": {
            "optimization": false,
            "extractLicenses": false,
            "sourceMap": true
          }
        },
        "defaultConfiguration": "production"
      },
      "serve": {
        "builder": "@angular/build:dev-server",
        "configurations": {
          "production": { "buildTarget": "mane-haus-coming-soon:build:production" },
          "development": { "buildTarget": "mane-haus-coming-soon:build:development" }
        },
        "defaultConfiguration": "development"
      },
      "test": {
        "builder": "@angular/build:unit-test"
      }
    }
  },
  "mane-haus": {
    "projectType": "application",
    "schematics": {
      "@schematics/angular:component": {
        "style": "scss"
      }
    },
    "root": "projects/mane-haus",
    "sourceRoot": "projects/mane-haus/src",
    "prefix": "app",
    "architect": {
      "build": {
        "builder": "@angular/build:application",
        "options": {
          "browser": "projects/mane-haus/src/main.ts",
          "tsConfig": "projects/mane-haus/tsconfig.app.json",
          "inlineStyleLanguage": "scss",
          "assets": [
            {
              "glob": "**/*",
              "input": "projects/mane-haus/public"
            }
          ],
          "styles": [
            "projects/mane-haus/src/styles.scss"
          ]
        },
        "configurations": {
          "production": {
            "budgets": [
              { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
              { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
            ],
            "outputHashing": "all"
          },
          "development": {
            "optimization": false,
            "extractLicenses": false,
            "sourceMap": true
          }
        },
        "defaultConfiguration": "production"
      },
      "serve": {
        "builder": "@angular/build:dev-server",
        "configurations": {
          "production": { "buildTarget": "mane-haus:build:production" },
          "development": { "buildTarget": "mane-haus:build:development" }
        },
        "defaultConfiguration": "development"
      },
      "test": {
        "builder": "@angular/build:unit-test"
      }
    }
  }
}
```

### 7.8 Aspire AppHost Updates

The Aspire AppHost registers the new Mane Haus frontend applications:

```csharp
// Existing
builder.AddNpmApp("angular", "../../Web/origin-hair-collective-web", "start")
    .WithReference(apiGateway)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

// New — Mane Haus marketing site
builder.AddNpmApp("mane-haus", "../../Web/origin-hair-collective-web", "start:mane-haus")
    .WithReference(apiGateway)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

// New — Origin coming soon (if served via Aspire in dev)
builder.AddNpmApp("origin-coming-soon", "../../Web/origin-hair-collective-web", "start:origin-coming-soon")
    .WithReference(apiGateway)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

// New — Mane Haus coming soon
builder.AddNpmApp("mane-haus-coming-soon", "../../Web/origin-hair-collective-web", "start:mane-haus-coming-soon")
    .WithReference(apiGateway)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();
```

Corresponding `package.json` scripts:

```json
{
  "scripts": {
    "start": "ng serve origin-hair-collective",
    "start:mane-haus": "ng serve mane-haus",
    "start:origin-coming-soon": "ng serve origin-hair-collective-coming-soon",
    "start:mane-haus-coming-soon": "ng serve mane-haus-coming-soon"
  }
}
```

---

## 8. Event-Driven Architecture Updates

### 8.1 Brand in Event Payloads

All cross-service MassTransit events include a `Brand` field. This is a mandatory field — every event publisher must include the brand context.

### 8.2 Consumer Brand Awareness

Consumers that take brand-specific actions (e.g., sending a brand-specific confirmation email) read the `Brand` field from the event payload rather than from HTTP context:

```csharp
public sealed class SubscriptionConfirmationConsumer : IConsumer<SubscriptionRequestedEvent>
{
    public async Task Consume(ConsumeContext<SubscriptionRequestedEvent> context)
    {
        var brand = context.Message.Brand;
        var brandConfig = _brandSettings.GetBrand(brand);

        // Send confirmation email with brand-specific sender and template
        var email = new EmailMessage(
            To: context.Message.Email,
            Subject: $"Confirm your {brandConfig.DisplayName} newsletter subscription",
            HtmlBody: BuildConfirmationHtml(context.Message, brandConfig),
            PlainTextBody: null,
            FromName: brandConfig.FromName,
            FromEmail: brandConfig.FromEmail,
            Headers: null);

        await _emailSender.SendAsync(email);
    }
}
```

### 8.3 Event Routing

No changes to RabbitMQ topology are required. Brand-scoped events use the same exchanges and queues. Consumers filter by brand at the application level, not the message broker level. This keeps infrastructure simple and avoids a proliferation of brand-specific queues.

---

## 9. API Gateway Changes

### 9.1 Header Forwarding

YARP forwards all request headers by default, so the `X-Brand` header passes through to backend services without additional configuration.

### 9.2 No New Routes Required

The API Gateway routes are service-scoped, not brand-scoped. Both brands use the same API Gateway endpoints. Brand differentiation happens at the service layer via the `X-Brand` header.

### 9.3 CORS Configuration

The API Gateway CORS policy must allow origins for both brands' domains:

```json
{
  "Cors": {
    "AllowedOrigins": [
      "https://originhair.com",
      "https://manehaus.com",
      "http://localhost:4200",
      "http://localhost:4201",
      "http://localhost:4202",
      "http://localhost:4203"
    ]
  }
}
```

---

## 10. Database Migration Strategy

### 10.1 Migration Approach

Each service performs its own EF Core migration to add the `Brand` column:

```csharp
// Example migration for Newsletter service
public partial class AddBrandColumn : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "Brand",
            table: "Subscribers",
            type: "INTEGER",
            nullable: false,
            defaultValue: 0);  // Default to OriginHairCollective

        migrationBuilder.AddColumn<int>(
            name: "Brand",
            table: "Campaigns",
            type: "INTEGER",
            nullable: false,
            defaultValue: 0);

        // Update unique index
        migrationBuilder.DropIndex("IX_Subscribers_Email");
        migrationBuilder.CreateIndex(
            "IX_Subscribers_Email_Brand",
            "Subscribers",
            new[] { "Email", "Brand" },
            unique: true);

        migrationBuilder.CreateIndex("IX_Subscribers_Brand", "Subscribers", "Brand");
        migrationBuilder.CreateIndex("IX_Campaigns_Brand", "Campaigns", "Brand");
    }
}
```

### 10.2 Data Migration

All existing data receives `Brand = 0` (OriginHairCollective) via the column default. No data transformation is needed.

### 10.3 Backwards Compatibility

If the `X-Brand` header is absent, `IBrandResolver` defaults to `Brand.OriginHairCollective`. This ensures existing API clients and tests continue to work without modification during the migration period.

---

## 11. Security Considerations

### 11.1 Brand Header Validation

The `IBrandResolver` validates the `X-Brand` header value against the known `Brand` enum. Invalid values default to `OriginHairCollective` rather than throwing errors.

### 11.2 Cross-Brand Data Access

- **Public endpoints**: Brand is resolved from the request header. A visitor interacting with the Mane Haus frontend only sees Mane Haus data.
- **Admin endpoints**: Admin users can access data for any brand. The admin dashboard brand selector controls which brand's data is displayed, but admin APIs do not restrict cross-brand access (admins manage both brands).
- **Token-based endpoints** (newsletter confirm/unsubscribe): The brand is resolved from the subscriber record, not the request header. This prevents a token from one brand being used in the other brand's context.

### 11.3 Session Isolation

Chat sessions are brand-scoped. A visitor's session ID on the Origin site cannot be used to access or continue a conversation started on the Mane Haus site.

---

## 12. Testing Strategy

### 12.1 Cross-Cutting Tests

- **Brand resolution tests**: Verify `IBrandResolver` correctly parses the `X-Brand` header and defaults appropriately.
- **Event brand propagation tests**: Verify all MassTransit events include the `Brand` field and consumers read it correctly.
- **Database index tests**: Verify the `(Email, Brand)` unique constraint allows the same email across brands but prevents duplicates within a brand.

### 12.2 Per-Service Tests

Each service's existing test suite is extended with brand-parameterized variants:

- Catalog: Verify brand-filtered product queries, verify `IsSharedAcrossBrands` logic.
- Newsletter: Verify brand-scoped subscriber creation, confirm/unsubscribe with brand, brand-specific email sender identity.
- Chat: Verify brand-specific system prompt, conversation brand assignment.
- Content: Verify brand-filtered content queries.

### 12.3 E2E Tests

- **Origin Coming Soon**: Verify email signup posts to Newsletter API with `X-Brand: OriginHairCollective`.
- **Mane Haus Coming Soon**: Verify email signup posts to Newsletter API with `X-Brand: ManeHaus`.
- **Admin Dashboard**: Verify brand selector switches data context for all management views.

---

## 13. Implementation Phases

### Phase 1: Foundation — Shared Contracts and Brand Infrastructure

- Add `Brand` enum to `Shared.Contracts`.
- Create `BrandSettings`, `BrandConfig`, and `IBrandResolver` in `ServiceDefaults`.
- Add `BrandSettings` configuration to all service `appsettings.json` files.
- Register `IBrandResolver` in all service DI containers.
- Update all MassTransit event records to include `Brand` field.

### Phase 2: Database Migrations

- Add `Brand` column to all brand-scoped entities across all 9 services.
- Update unique indexes (notably Newsletter `Subscribers` table).
- Run migrations; existing data defaults to `Brand.OriginHairCollective`.

### Phase 3: Service Layer Updates

- Update repository interfaces and implementations to accept `Brand?` filters.
- Update service layer methods to use `IBrandResolver` for brand-scoped queries.
- Update admin service methods to accept explicit `Brand` parameters.
- Update MassTransit consumers to read `Brand` from event payloads.

### Phase 4: Newsletter Brand-Specific Email Branding

- Update `IEmailContentProcessor` to accept `Brand` and `BrandConfig`.
- Create brand-specific email templates (confirmation, campaign wrapper).
- Update `CampaignSendConsumer` to use brand-specific sender identity.
- Update `SubscriptionConfirmationConsumer` in Notification service for brand-specific emails.

### Phase 5: Chat Service Brand Personality

- Update `SystemPromptBuilder` with brand-specific AI personalities.
- Assign `Brand` to conversations from `X-Brand` header on the SignalR connection.
- Update `ProductCatalogChangedConsumer` to cache products per brand.

### Phase 6: Frontend — Mane Haus Coming Soon Page

- Create `mane-haus-coming-soon` Angular project.
- Implement Mane Haus brand design tokens and styling.
- Wire email signup to Newsletter API with `X-Brand: ManeHaus`.
- Update Origin coming soon page to include brand interceptor.
- Register both coming soon apps in Angular workspace.

### Phase 7: Frontend — Mane Haus Marketing Site

- Create `mane-haus` Angular project.
- Implement brand-specific layout, pages, and chat widget.
- Wire all API calls with `X-Brand: ManeHaus` interceptor.
- Register in Angular workspace and Aspire AppHost.

### Phase 8: Admin Dashboard Brand Selector

- Add brand selector component to admin top navigation.
- Create `AdminBrandService` for brand state management.
- Update all admin pages to filter by selected brand.
- Add brand column to admin data tables where relevant.

---

## 14. Dependencies

### New NuGet Packages

None. All required packages are already in `Directory.Packages.props`.

### New npm Packages

None. The existing Angular workspace dependencies cover all needs.

### Cross-Service Changes Summary

| Service | Change | Impact |
|---------|--------|--------|
| **Shared.Contracts** | Add `Brand` enum; add `Brand` to all events | Medium — all event publishers/consumers updated |
| **ServiceDefaults** | Add `BrandSettings`, `BrandConfig`, `IBrandResolver` | Low — shared infrastructure |
| **All 9 Services** | Add `Brand` column, update repositories and services | Medium — systematic but straightforward |
| **API Gateway** | CORS update for Mane Haus origins | Low — configuration only |
| **Aspire AppHost** | Register new frontend apps | Low — additive |
| **Angular Workspace** | 2 new projects, interceptor, admin brand selector | Medium — new code |

---

## 15. Open Questions

| # | Question | Recommendation |
|---|----------|----------------|
| 1 | Should Mane Haus share the same product catalog or have a completely separate one? | Allow products to be brand-exclusive OR shared via `IsSharedAcrossBrands` flag. |
| 2 | Should admin users be able to manage both brands, or should admin roles be brand-scoped? | Both brands managed from one admin dashboard. Brand selector controls data context. Role-based brand restrictions can be added later. |
| 3 | Should domains use subdomains (origin.example.com / manehaus.example.com) or separate TLDs? | Separate TLDs (originhair.com, manehaus.com). The API Gateway and backend are domain-agnostic; brand is identified by the `X-Brand` header. |
| 4 | Should the Mane Haus coming soon page be deployed before or concurrently with the Origin coming soon page update? | Concurrently — Phase 6 delivers both simultaneously. |
