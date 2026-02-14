# Newsletter Service — Technical Design

## 1. Overview

This document describes the technical design for adding newsletter capabilities to the Origin Hair Collective platform. The feature enables the business to build a subscriber list, compose newsletter campaigns, and deliver email content to opted-in customers — covering product launches, promotions, hair care tips, and company updates.

The Newsletter service supports **two distinct brands** — **Origin Hair Collective** and **Mane Haus** — from a single microservice deployment. Each brand maintains its own subscriber list, email sender identity, email branding, and campaign management. Both brands' coming soon pages integrate with this service for pre-launch email collection.

The design follows the existing microservices architecture, event-driven patterns, and layered project conventions already established in the codebase. For the full multi-brand architecture, see `dual-frontend-microservices-design.md`.

---

## 2. Goals and Non-Goals

### Goals

- Allow visitors and registered users to subscribe to the newsletter via a public endpoint (no authentication required).
- Support double opt-in to comply with email marketing regulations (CAN-SPAM, GDPR).
- Provide admin endpoints to manage subscribers, compose campaigns, and trigger sends.
- Deliver newsletters through a pluggable email provider abstraction (SMTP, SendGrid, Amazon SES).
- Track delivery metrics (sent, opened, clicked, bounced, unsubscribed) per campaign.
- Integrate with existing services via MassTransit events — auto-subscribe users at registration or order placement when they opt in.
- Support audience segmentation by subscriber tags/preferences.
- **Support brand-scoped subscriber lists** — Origin Hair Collective and Mane Haus each have independent subscriber bases within the same database.
- **Support brand-specific email branding** — sender name, sender email, logo, color scheme, footer text, and social links differ by brand.
- **Power both coming soon pages** — the Origin Hair Collective coming soon page and the Mane Haus coming soon page both collect email subscribers through this service.
- **Support brand-scoped campaigns** — campaigns are created for a specific brand and sent only to that brand's subscribers.
- **Provide brand-filtered admin views** — the admin dashboard can filter subscribers, campaigns, and stats by brand.

### Non-Goals

- Rich drag-and-drop email template builder (HTML templates will be managed as raw content).
- A/B testing of subject lines or content variants (future enhancement).
- Real-time push notifications or SMS newsletter delivery.
- Paid subscription tiers or premium newsletter content.
- Cross-brand campaigns (a single campaign that sends to subscribers of both brands simultaneously). Admins must create separate campaigns per brand.

---

## 3. Architecture Overview

The newsletter capability is implemented as a new **Newsletter microservice** (`Newsletter`) following the same four-layer structure used by the existing services:

```
src/Services/Newsletter/
├── OriginHairCollective.Newsletter.Core           # Domain entities, enums, interfaces
├── OriginHairCollective.Newsletter.Infrastructure  # EF Core DbContext, repositories
├── OriginHairCollective.Newsletter.Application     # DTOs, services, MassTransit consumers
└── OriginHairCollective.Newsletter.Api             # ASP.NET controllers, Program.cs
```

### Service Interaction Diagram

```
┌──────────────────────────┐     ┌──────────────────────────┐
│  Origin Hair Collective  │     │       Mane Haus          │
│  Coming Soon / Marketing │     │  Coming Soon / Marketing │
│  X-Brand: Origin         │     │  X-Brand: ManeHaus       │
│  HairCollective          │     │                          │
└────────────┬─────────────┘     └────────────┬─────────────┘
             │                                 │
             └─────────────┬───────────────────┘
                           │
                  ┌────────▼─────────┐
                  │   API Gateway    │
                  │   (YARP)         │
                  │   Forwards       │
                  │   X-Brand header │
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────────────┐
                  │    Newsletter API         │
                  │    /api/newsletters       │
                  │                           │
                  │  Reads X-Brand header     │
                  │  to scope all operations  │
                  │  by brand                 │
                  └───┬──────────────┬────────┘
                      │              │
           ┌──────────┘              └──────────┐
           ▼                                    ▼
    ┌─────────────┐                   ┌──────────────────┐
    │  RabbitMQ   │                   │  Newsletter DB   │
    │ (MassTransit)│                   │   (SQLite)       │
    └──────┬──────┘                   │                  │
           │                          │  Subscribers,    │
  ┌────────┼────────┐                │  Campaigns all   │
  ▼        ▼        ▼                │  have Brand col  │
┌────────┐┌────────┐┌────────────┐   └──────────────────┘
│Identity││ Order  ││Notification│
│Service ││Service ││  Service   │
└────────┘└────────┘└────────────┘
```

**Key relationships:**

- **Both frontends** (Origin and Mane Haus coming soon pages, marketing sites) call the same Newsletter API endpoints. The `X-Brand` HTTP header identifies which brand the request is for.
- **Identity Service** publishes `UserRegisteredEvent` (with `Brand` field) — Newsletter service auto-creates a subscriber record for the corresponding brand when users opt in during registration.
- **Order Service** publishes `OrderCreatedEvent` (with `Brand` field) — Newsletter service can subscribe customers who opted in at checkout, scoped to the brand they purchased from.
- **Newsletter Service** publishes `NewsletterSentEvent` (with `Brand` field) — Notification service logs the send for audit purposes.
- **Newsletter Service** owns its subscriber list, campaigns, and delivery tracking independently. Brand is a data-level discriminator, not an infrastructure-level separation.

---

## 4. Domain Model

### 4.1 Entities

#### `Subscriber`

The core entity representing a newsletter subscriber. A single email address can subscribe to both brands independently — the unique constraint is on `(Email, Brand)`.

```csharp
public sealed class Subscriber
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Guid? UserId { get; set; }                // Link to Identity AppUser if registered
    public SubscriberStatus Status { get; set; }      // Pending, Active, Unsubscribed
    public string? ConfirmationToken { get; set; }    // Double opt-in token
    public DateTime? ConfirmedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UnsubscribedAt { get; set; }
    public string? UnsubscribeToken { get; set; }     // One-click unsubscribe token
    public Brand Brand { get; set; }                  // OriginHairCollective or ManeHaus
    public ICollection<SubscriberTag> Tags { get; set; }
}
```

#### `SubscriberTag`

Supports audience segmentation (e.g., "wholesale", "new-arrivals", "promotions").

```csharp
public sealed class SubscriberTag
{
    public Guid Id { get; set; }
    public Guid SubscriberId { get; set; }
    public required string Tag { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

#### `Campaign`

Represents a single newsletter edition or email blast. Each campaign targets a specific brand's subscriber list.

```csharp
public sealed class Campaign
{
    public Guid Id { get; set; }
    public required string Subject { get; set; }
    public required string HtmlBody { get; set; }
    public string? PlainTextBody { get; set; }
    public CampaignStatus Status { get; set; }        // Draft, Scheduled, Sending, Sent, Cancelled
    public DateTime? ScheduledAt { get; set; }
    public DateTime? SentAt { get; set; }
    public string? TargetTag { get; set; }             // null = all active subscribers for the brand
    public Brand Brand { get; set; }                   // Which brand this campaign is sent from
    public int TotalRecipients { get; set; }
    public int TotalSent { get; set; }
    public int TotalOpened { get; set; }
    public int TotalClicked { get; set; }
    public int TotalBounced { get; set; }
    public int TotalUnsubscribed { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

#### `CampaignRecipient`

Tracks delivery status per subscriber per campaign.

```csharp
public sealed class CampaignRecipient
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public Guid SubscriberId { get; set; }
    public required string Email { get; set; }
    public DeliveryStatus Status { get; set; }         // Queued, Sent, Delivered, Opened, Clicked, Bounced, Failed
    public DateTime? SentAt { get; set; }
    public DateTime? OpenedAt { get; set; }
    public DateTime? ClickedAt { get; set; }
    public string? ErrorMessage { get; set; }
}
```

### 4.2 Enums

```csharp
public enum SubscriberStatus
{
    Pending,         // Awaiting double opt-in confirmation
    Active,          // Confirmed and receiving emails
    Unsubscribed     // Opted out
}

public enum CampaignStatus
{
    Draft,
    Scheduled,
    Sending,
    Sent,
    Cancelled
}

public enum DeliveryStatus
{
    Queued,
    Sent,
    Delivered,
    Opened,
    Clicked,
    Bounced,
    Failed
}
```

---

## 5. Database Schema

The Newsletter service uses its own isolated SQLite database (`newsletter.db`), consistent with the per-service database strategy.

### Tables

#### `Subscribers`

| Column             | Type         | Constraints                          |
|--------------------|--------------|--------------------------------------|
| Id                 | GUID         | PK                                   |
| Email              | TEXT         | NOT NULL                             |
| FirstName          | TEXT         | NULLABLE                             |
| LastName           | TEXT         | NULLABLE                             |
| UserId             | GUID         | NULLABLE, INDEX                      |
| Status             | INTEGER      | NOT NULL (enum)                      |
| ConfirmationToken  | TEXT         | NULLABLE                             |
| ConfirmedAt        | DATETIME     | NULLABLE                             |
| CreatedAt          | DATETIME     | NOT NULL                             |
| UnsubscribedAt     | DATETIME     | NULLABLE                             |
| UnsubscribeToken   | TEXT         | NULLABLE, UNIQUE INDEX               |
| Brand              | INTEGER      | NOT NULL, DEFAULT 0, INDEX           |

**Unique Index:** (`Email`, `Brand`) — allows the same email to subscribe to both brands independently.

#### `SubscriberTags`

| Column       | Type     | Constraints                        |
|--------------|----------|------------------------------------|
| Id           | GUID     | PK                                 |
| SubscriberId | GUID     | NOT NULL, FK → Subscribers, INDEX  |
| Tag          | TEXT     | NOT NULL                           |
| CreatedAt    | DATETIME | NOT NULL                           |

**Composite Index:** (`SubscriberId`, `Tag`) UNIQUE

#### `Campaigns`

| Column            | Type         | Constraints             |
|-------------------|--------------|--------------------------|
| Id                | GUID         | PK                       |
| Subject           | TEXT         | NOT NULL                 |
| HtmlBody          | TEXT         | NOT NULL                 |
| PlainTextBody     | TEXT         | NULLABLE                 |
| Status            | INTEGER      | NOT NULL (enum)          |
| ScheduledAt       | DATETIME     | NULLABLE                 |
| SentAt            | DATETIME     | NULLABLE                 |
| TargetTag         | TEXT         | NULLABLE                 |
| Brand             | INTEGER      | NOT NULL, DEFAULT 0, INDEX|
| TotalRecipients   | INTEGER      | NOT NULL, DEFAULT 0      |
| TotalSent         | INTEGER      | NOT NULL, DEFAULT 0      |
| TotalOpened       | INTEGER      | NOT NULL, DEFAULT 0      |
| TotalClicked      | INTEGER      | NOT NULL, DEFAULT 0      |
| TotalBounced      | INTEGER      | NOT NULL, DEFAULT 0      |
| TotalUnsubscribed | INTEGER      | NOT NULL, DEFAULT 0      |
| CreatedByUserId   | GUID         | NOT NULL                 |
| CreatedAt         | DATETIME     | NOT NULL                 |
| UpdatedAt         | DATETIME     | NULLABLE                 |

#### `CampaignRecipients`

| Column       | Type     | Constraints                        |
|--------------|----------|------------------------------------|
| Id           | GUID     | PK                                 |
| CampaignId   | GUID     | NOT NULL, FK → Campaigns, INDEX    |
| SubscriberId | GUID     | NOT NULL, INDEX                    |
| Email        | TEXT     | NOT NULL                           |
| Status       | INTEGER  | NOT NULL (enum)                    |
| SentAt       | DATETIME | NULLABLE                           |
| OpenedAt     | DATETIME | NULLABLE                           |
| ClickedAt    | DATETIME | NULLABLE                           |
| ErrorMessage | TEXT     | NULLABLE                           |

**Composite Index:** (`CampaignId`, `SubscriberId`) UNIQUE

---

## 6. API Design

All endpoints are exposed through the API Gateway at `/api/newsletters/*` with prefix stripping. The Newsletter API internally handles routes without the prefix.

**Brand resolution:** Public endpoints resolve the brand from the `X-Brand` HTTP header (set by the frontend's HTTP interceptor). If the header is absent, the service defaults to `Brand.OriginHairCollective` for backwards compatibility. Admin endpoints accept an explicit `brand` query parameter or use the `X-Brand` header.

### 6.1 Public Endpoints (No Authentication)

#### Subscribe

```
POST /api/newsletters/subscribe
Headers: X-Brand: OriginHairCollective | ManeHaus
```

**Request Body:**
```json
{
  "email": "customer@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "tags": ["new-arrivals", "promotions"]
}
```

**Response:** `202 Accepted`
```json
{
  "message": "A confirmation email has been sent to your address."
}
```

**Behavior:**
1. Resolve `Brand` from `X-Brand` header via `IBrandResolver`.
2. Validate email format.
3. If the email already exists **for this brand** and is `Active`, return `200` with an informational message.
4. If the email already exists **for this brand** and is `Unsubscribed`, reset status to `Pending` and issue a new confirmation token.
5. Generate a `ConfirmationToken` (cryptographic random, URL-safe).
6. Persist `Subscriber` with `Status = Pending` and the resolved `Brand`.
7. Publish `SubscriptionRequestedEvent` (including `Brand`) to trigger a brand-specific confirmation email via the Notification service.

**Coming soon page integration:** Both the Origin Hair Collective coming soon page and the Mane Haus coming soon page call this endpoint. The `X-Brand` header is set automatically by each frontend's HTTP interceptor, ensuring subscribers are assigned to the correct brand.

#### Confirm Subscription

```
GET /api/newsletters/confirm?token={confirmationToken}
```

**Response:** `200 OK`
```json
{
  "message": "Your subscription has been confirmed."
}
```

**Behavior:**
1. Look up subscriber by `ConfirmationToken`.
2. Set `Status = Active`, `ConfirmedAt = UtcNow`.
3. Clear `ConfirmationToken`.
4. Generate and store `UnsubscribeToken`.
5. Publish `SubscriberConfirmedEvent`.

#### Unsubscribe

```
GET /api/newsletters/unsubscribe?token={unsubscribeToken}
```

**Response:** `200 OK`
```json
{
  "message": "You have been unsubscribed."
}
```

**Behavior:**
1. Look up subscriber by `UnsubscribeToken`.
2. Set `Status = Unsubscribed`, `UnsubscribedAt = UtcNow`.
3. Publish `SubscriberUnsubscribedEvent`.

#### Tracking Pixel (Open Tracking)

```
GET /api/newsletters/track/open?cid={campaignId}&sid={subscriberId}
```

**Response:** `200 OK` with a 1x1 transparent GIF.

**Behavior:**
1. Update `CampaignRecipient.OpenedAt` if not already set.
2. Increment `Campaign.TotalOpened`.

#### Click Tracking

```
GET /api/newsletters/track/click?cid={campaignId}&sid={subscriberId}&url={encodedTargetUrl}
```

**Response:** `302 Redirect` to the decoded target URL.

**Behavior:**
1. Update `CampaignRecipient.ClickedAt` if not already set.
2. Increment `Campaign.TotalClicked`.
3. Redirect to the original URL.

### 6.2 Admin Endpoints (Requires JWT Authentication, Admin Role)

All admin endpoints accept an optional `brand` query parameter to filter results by brand. If omitted, the `X-Brand` header is used. The admin dashboard sends the `X-Brand` header based on the admin's brand selector.

#### List Subscribers

```
GET /api/newsletters/admin/subscribers?page=1&pageSize=25&status=Active&tag=promotions&brand=OriginHairCollective
```

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "...",
      "email": "customer@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "status": "Active",
      "brand": "OriginHairCollective",
      "tags": ["new-arrivals", "promotions"],
      "confirmedAt": "2026-01-15T10:30:00Z",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "totalCount": 142,
  "page": 1,
  "pageSize": 25
}
```

#### Get Subscriber Count by Status

```
GET /api/newsletters/admin/subscribers/stats?brand=OriginHairCollective
```

**Response:** `200 OK`
```json
{
  "totalActive": 142,
  "totalPending": 8,
  "totalUnsubscribed": 23,
  "recentSubscribers": 12,
  "brand": "OriginHairCollective"
}
```

#### Remove Subscriber (Admin)

```
DELETE /api/newsletters/admin/subscribers/{id}
```

**Response:** `204 No Content`

#### List Campaigns

```
GET /api/newsletters/admin/campaigns?page=1&pageSize=10&status=Sent&brand=ManeHaus
```

**Response:** `200 OK` with paginated campaign list including metrics. Each campaign includes its `brand` field.

#### Get Campaign Details

```
GET /api/newsletters/admin/campaigns/{id}
```

**Response:** `200 OK` with full campaign data and aggregate metrics.

#### Create Campaign

```
POST /api/newsletters/admin/campaigns
```

**Request Body:**
```json
{
  "subject": "Spring Collection is Here!",
  "htmlBody": "<html>...</html>",
  "plainTextBody": "Spring Collection is Here! ...",
  "targetTag": "new-arrivals",
  "scheduledAt": "2026-03-01T09:00:00Z",
  "brand": "OriginHairCollective"
}
```

**Response:** `201 Created`

**Behavior:**
1. Validate required fields including `brand`.
2. Create campaign with `Status = Draft` (or `Scheduled` if `scheduledAt` is provided) and the specified `Brand`.
3. `CreatedByUserId` is extracted from the JWT claims.

#### Update Campaign

```
PUT /api/newsletters/admin/campaigns/{id}
```

**Constraint:** Only campaigns with `Status = Draft` or `Status = Scheduled` can be updated.

**Response:** `200 OK`

#### Send Campaign

```
POST /api/newsletters/admin/campaigns/{id}/send
```

**Response:** `202 Accepted`
```json
{
  "message": "Campaign queued for delivery.",
  "totalRecipients": 142
}
```

**Behavior:**
1. Validate campaign is in `Draft` or `Scheduled` status.
2. Query active subscribers **for the campaign's brand** (filtered by `TargetTag` if set).
3. Create `CampaignRecipient` records with `Status = Queued`.
4. Set `Campaign.Status = Sending`, `Campaign.TotalRecipients`.
5. Publish `CampaignSendRequestedEvent` (including `Brand`) to begin asynchronous delivery.

#### Cancel Campaign

```
POST /api/newsletters/admin/campaigns/{id}/cancel
```

**Constraint:** Only campaigns with `Status = Sending` or `Status = Scheduled`.

**Response:** `200 OK`

#### Get Campaign Recipient Details

```
GET /api/newsletters/admin/campaigns/{id}/recipients?page=1&pageSize=50&status=Bounced
```

**Response:** `200 OK` with paginated recipient delivery statuses.

---

## 7. Event Contracts

New event records added to `OriginHairCollective.Shared.Contracts`:

### Events Published by Newsletter Service

All events include a `Brand` field so that consumers can take brand-appropriate actions (e.g., brand-specific confirmation email templates, brand-tagged audit logs).

```csharp
// Triggers confirmation email via Notification service
public sealed record SubscriptionRequestedEvent(
    Guid SubscriberId,
    string Email,
    string? FirstName,
    string ConfirmationToken,
    Brand Brand,                    // Which brand the subscriber signed up for
    DateTime OccurredAt);

// Informational — subscriber is now active
public sealed record SubscriberConfirmedEvent(
    Guid SubscriberId,
    string Email,
    Brand Brand,
    DateTime OccurredAt);

// Informational — subscriber opted out
public sealed record SubscriberUnsubscribedEvent(
    Guid SubscriberId,
    string Email,
    Brand Brand,
    DateTime OccurredAt);

// Triggers batch email delivery
public sealed record CampaignSendRequestedEvent(
    Guid CampaignId,
    string Subject,
    int TotalRecipients,
    Brand Brand,                    // Determines sender identity and email branding
    DateTime OccurredAt);

// Published after all recipients have been processed
public sealed record CampaignCompletedEvent(
    Guid CampaignId,
    int TotalSent,
    int TotalFailed,
    Brand Brand,
    DateTime OccurredAt);
```

### Events Consumed by Newsletter Service

```csharp
// Existing event — Newsletter service adds a consumer to auto-subscribe
// customers who opt in during registration. The Brand field determines
// which brand's subscriber list the user is added to.
public sealed record UserRegisteredEvent(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    bool NewsletterOptIn,
    Brand Brand,                    // Which brand site the user registered from
    DateTime OccurredAt);

// Existing event — auto-subscribe at checkout if opted in
// (OrderCreatedEvent already exists in Shared.Contracts with Brand field)
// Newsletter consumer checks for an opt-in flag and uses the Brand field
// to assign the subscriber to the correct brand
```

**Note:** `UserRegisteredEvent` includes a `Brand` field indicating which frontend the user registered through. The Newsletter consumer creates a subscriber record scoped to that brand. If a user registers on both sites, they will have separate subscriber records per brand.

---

## 8. MassTransit Consumers

### 8.1 Newsletter Service Consumers

| Consumer | Listens To | Behavior |
|----------|-----------|----------|
| `UserRegisteredNewsletterConsumer` | `UserRegisteredEvent` | If `NewsletterOptIn = true`, create subscriber with `Status = Active` (implicit consent via registration), set `UserId` link, set `Brand` from event's `Brand` field. |
| `CampaignSendConsumer` | `CampaignSendRequestedEvent` | Fetches all `Queued` recipients for the campaign, resolves brand-specific sender identity from `BrandSettings`, sends emails in batches via `IEmailSender` with brand-appropriate `FromName`/`FromEmail`, updates `CampaignRecipient` statuses, publishes `CampaignCompletedEvent` (with `Brand`) when done. |

### 8.2 Notification Service Consumers (New)

| Consumer | Listens To | Behavior |
|----------|-----------|----------|
| `SubscriptionConfirmationConsumer` | `SubscriptionRequestedEvent` | Reads `Brand` from event, resolves brand-specific sender identity and confirmation URL from `BrandSettings`, sends the double opt-in confirmation email with brand-appropriate branding. Logs to `NotificationLog` with `Type = NewsletterConfirmation` and `Brand`. |
| `CampaignCompletedNotificationConsumer` | `CampaignCompletedEvent` | Logs the campaign completion in `NotificationLog` for audit with `Brand`. |

### Required Enum Updates

Add to `NotificationType`:
```csharp
NewsletterConfirmation,
NewsletterCampaign
```

---

## 9. Email Delivery Infrastructure

### 9.1 Abstraction

```csharp
public interface IEmailSender
{
    Task<EmailSendResult> SendAsync(EmailMessage message, CancellationToken ct = default);
    Task<IReadOnlyList<EmailSendResult>> SendBatchAsync(
        IReadOnlyList<EmailMessage> messages, CancellationToken ct = default);
}

public sealed record EmailMessage(
    string To,
    string Subject,
    string HtmlBody,
    string? PlainTextBody,
    string FromName,
    string FromEmail,
    Dictionary<string, string>? Headers);

public sealed record EmailSendResult(
    string Recipient,
    bool Success,
    string? ExternalMessageId,
    string? ErrorMessage);
```

### 9.2 Implementations

**Phase 1 — SMTP:**
```csharp
public sealed class SmtpEmailSender : IEmailSender { ... }
```

Configuration via `appsettings.json`:
```json
{
  "Email": {
    "Provider": "Smtp",
    "Smtp": {
      "Host": "smtp.example.com",
      "Port": 587,
      "UseSsl": true,
      "Username": "...",
      "Password": "..."
    }
  }
}
```

**Note:** `FromName` and `FromEmail` are no longer static configuration values. They are resolved per-request from `BrandSettings` based on the subscriber's or campaign's `Brand`:

| Brand | FromName | FromEmail |
|-------|----------|-----------|
| OriginHairCollective | Origin Hair Collective | newsletter@originhair.com |
| ManeHaus | Mane Haus | newsletter@manehaus.com |

**Phase 2 (Future) — SendGrid / Amazon SES:**

Additional implementations of `IEmailSender` registered via configuration-driven DI:
```csharp
services.AddScoped<IEmailSender>(sp =>
    configuration["Email:Provider"] switch
    {
        "SendGrid" => sp.GetRequiredService<SendGridEmailSender>(),
        "Ses" => sp.GetRequiredService<SesEmailSender>(),
        _ => sp.GetRequiredService<SmtpEmailSender>()
    });
```

### 9.3 Batch Sending Strategy

The `CampaignSendConsumer` processes recipients in configurable batches to avoid overwhelming the email provider:

1. Fetch `Queued` recipients in pages of 50 (configurable).
2. For each batch, call `IEmailSender.SendBatchAsync`.
3. Update each `CampaignRecipient` status based on `EmailSendResult`.
4. Increment campaign aggregate counters (`TotalSent`, `TotalBounced`, etc.).
5. Introduce a configurable delay between batches (default: 1 second) to respect rate limits.
6. On completion, set `Campaign.Status = Sent`, `SentAt = UtcNow`.
7. Publish `CampaignCompletedEvent`.

### 9.4 Email Content Processing

Before sending, the service processes the HTML body to:

1. **Inject tracking pixel:** Append a `<img>` tag pointing to the open-tracking endpoint.
2. **Rewrite links:** Replace `<a href="...">` URLs with click-tracking redirect URLs.
3. **Inject unsubscribe link:** Add the subscriber-specific unsubscribe URL to the email footer and the `List-Unsubscribe` header (RFC 8058 compliance). The unsubscribe URL uses the brand-specific base URL.
4. **Inject brand-specific footer:** Include brand logo, social links, copyright text, and contact email from `BrandConfig`.

```csharp
public interface IEmailContentProcessor
{
    string ProcessHtml(
        string htmlBody,
        Guid campaignId,
        Guid subscriberId,
        string unsubscribeToken,
        Brand brand,                // Determines logo, colors, footer text
        BrandConfig brandConfig);   // Provides brand-specific URLs and names
}
```

**Brand-specific email template elements:**

| Element | Origin Hair Collective | Mane Haus |
|---------|----------------------|-----------|
| Logo | Origin Hair Collective logo asset | Mane Haus logo asset |
| Color palette | Gold (#C9A96E) and charcoal (#0B0A08) | Brand-specific palette (TBD) |
| Footer display name | "Origin Hair Collective" | "Mane Haus" |
| Footer URL | originhair.com | manehaus.com |
| Unsubscribe base URL | `https://originhair.com/api/newsletters/unsubscribe` | `https://manehaus.com/api/newsletters/unsubscribe` |
| Social link | `@OriginHairCollective` | `@ManeHaus` |
| Contact email | hello@originhaircollective.com | hello@manehaus.com |

---

## 10. Integration Points

### 10.1 API Gateway

Add route and cluster to `appsettings.json`:

```json
{
  "newsletters-route": {
    "ClusterId": "newsletters-cluster",
    "Match": {
      "Path": "/api/newsletters/{**catch-all}"
    },
    "Transforms": [
      { "PathRemovePrefix": "/api/newsletters" }
    ]
  }
}
```

```json
{
  "newsletters-cluster": {
    "Destinations": {
      "newsletter-api": {
        "Address": "http://newsletter-api"
      }
    }
  }
}
```

### 10.2 Aspire AppHost

Add the Newsletter service to `Program.cs`:

```csharp
var newsletterApi = builder.AddProject<Projects.OriginHairCollective_Newsletter_Api>("newsletter-api")
    .WithReference(messaging);

var apiGateway = builder.AddProject<Projects.OriginHairCollective_ApiGateway>("api-gateway")
    .WithReference(catalogApi)
    .WithReference(inquiryApi)
    .WithReference(orderApi)
    .WithReference(paymentApi)
    .WithReference(contentApi)
    .WithReference(notificationApi)
    .WithReference(identityApi)
    .WithReference(newsletterApi);  // Add reference
```

### 10.3 Identity Service Changes

Add `NewsletterOptIn` flag to registration flow:

- Add `NewsletterOptIn` (bool) to `RegisterDto`.
- Publish `UserRegisteredEvent` after successful registration (new event publication in `IdentityService.RegisterAsync`).

### 10.4 Notification Service Changes

- Add `NewsletterConfirmation` and `NewsletterCampaign` to the `NotificationType` enum.
- Add `SubscriptionConfirmationConsumer` to handle `SubscriptionRequestedEvent` and send the double opt-in email.

---

## 11. Scheduled Campaign Delivery

Campaigns with `ScheduledAt` in the future are persisted with `Status = Scheduled`. A background hosted service in the Newsletter API runs on a timer to check for campaigns due for delivery:

```csharp
public sealed class CampaignSchedulerService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Query campaigns where Status == Scheduled and ScheduledAt <= UtcNow
            // For each, build recipient list and publish CampaignSendRequestedEvent
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
```

The 1-minute polling interval provides acceptable delivery precision for newsletter use cases. The scheduler only transitions the campaign to `Sending` and publishes the event — actual delivery is handled by the `CampaignSendConsumer` to keep concerns separated.

---

## 12. Security Considerations

### 12.1 Authentication and Authorization

| Endpoint Group | Auth Required | Role Required |
|----------------|---------------|---------------|
| `POST /subscribe` | No | — |
| `GET /confirm` | No | — |
| `GET /unsubscribe` | No | — |
| `GET /track/*` | No | — |
| `*/admin/*` | Yes (JWT) | Admin |

Admin endpoints use the existing JWT bearer authentication from the Identity service. The `[Authorize(Roles = "Admin")]` attribute is applied to admin controllers.

### 12.2 Token Security

- **Confirmation tokens:** Generated using `RandomNumberGenerator.GetBytes(32)` and Base64Url-encoded. Single-use — cleared after confirmation.
- **Unsubscribe tokens:** Generated the same way. Persistent for the subscriber's lifetime (enables one-click unsubscribe from any email).
- Both token types are indexed for fast lookup and are not guessable.

### 12.3 Rate Limiting

- `POST /subscribe` — Rate-limited to 5 requests per IP per minute to prevent abuse.
- Tracking endpoints — Lightweight and idempotent; no rate limiting required.
- Admin endpoints — Protected by authentication; standard rate limiting sufficient.

### 12.4 Input Validation

- Email addresses validated against a strict regex and normalized to lowercase.
- HTML body content sanitized on admin input to prevent stored XSS in campaign management views.
- `targetTag` values validated against an allowlist of known tags.

### 12.5 Unsubscribe Compliance

- Every newsletter email includes a `List-Unsubscribe` header (RFC 8058) and a visible unsubscribe link in the footer.
- Unsubscribe is a single GET request (one-click), no authentication required.
- Unsubscribed users are never included in future sends.

---

## 13. Data Transfer Objects

### Subscribe DTOs

```csharp
// Brand is resolved from the X-Brand header, not included in the request body.
// This keeps the public API simple — the coming soon pages and marketing sites
// don't need to know about the Brand enum.
public sealed record SubscribeRequestDto(
    string Email,
    string? FirstName,
    string? LastName,
    List<string>? Tags);

public sealed record SubscribeResponseDto(string Message);
```

### Subscriber DTOs (Admin)

```csharp
public sealed record SubscriberDto(
    Guid Id,
    string Email,
    string? FirstName,
    string? LastName,
    string Status,
    Brand Brand,                    // NEW — which brand this subscriber belongs to
    List<string> Tags,
    DateTime? ConfirmedAt,
    DateTime CreatedAt,
    DateTime? UnsubscribedAt);

public sealed record SubscriberStatsDto(
    int TotalActive,
    int TotalPending,
    int TotalUnsubscribed,
    int RecentSubscribers,
    Brand Brand);                   // NEW — stats are brand-scoped

public sealed record PagedResultDto<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize);
```

### Campaign DTOs

```csharp
public sealed record CreateCampaignDto(
    string Subject,
    string HtmlBody,
    string? PlainTextBody,
    string? TargetTag,
    DateTime? ScheduledAt,
    Brand Brand);                   // NEW — admin explicitly selects brand

public sealed record UpdateCampaignDto(
    string? Subject,
    string? HtmlBody,
    string? PlainTextBody,
    string? TargetTag,
    DateTime? ScheduledAt);
    // Brand cannot be changed after creation

public sealed record CampaignDto(
    Guid Id,
    string Subject,
    string Status,
    string? TargetTag,
    Brand Brand,                    // NEW
    int TotalRecipients,
    int TotalSent,
    int TotalOpened,
    int TotalClicked,
    int TotalBounced,
    int TotalUnsubscribed,
    DateTime? ScheduledAt,
    DateTime? SentAt,
    DateTime CreatedAt);

public sealed record CampaignDetailDto(
    Guid Id,
    string Subject,
    string HtmlBody,
    string? PlainTextBody,
    string Status,
    string? TargetTag,
    Brand Brand,                    // NEW
    int TotalRecipients,
    int TotalSent,
    int TotalOpened,
    int TotalClicked,
    int TotalBounced,
    int TotalUnsubscribed,
    DateTime? ScheduledAt,
    DateTime? SentAt,
    Guid CreatedByUserId,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record CampaignRecipientDto(
    Guid Id,
    string Email,
    string Status,
    DateTime? SentAt,
    DateTime? OpenedAt,
    DateTime? ClickedAt,
    string? ErrorMessage);
```

---

## 14. Repository Interfaces

```csharp
public interface ISubscriberRepository
{
    Task<Subscriber?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Subscriber?> GetByEmailAndBrandAsync(string email, Brand brand, CancellationToken ct = default);
    Task<Subscriber?> GetByConfirmationTokenAsync(string token, CancellationToken ct = default);
    Task<Subscriber?> GetByUnsubscribeTokenAsync(string token, CancellationToken ct = default);
    Task<(IReadOnlyList<Subscriber> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, SubscriberStatus? status, string? tag, Brand? brand, CancellationToken ct = default);
    Task<IReadOnlyList<Subscriber>> GetActiveByTagAndBrandAsync(string? tag, Brand brand, CancellationToken ct = default);
    Task<SubscriberStats> GetStatsByBrandAsync(Brand brand, CancellationToken ct = default);
    Task AddAsync(Subscriber subscriber, CancellationToken ct = default);
    Task UpdateAsync(Subscriber subscriber, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

public interface ICampaignRepository
{
    Task<Campaign?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IReadOnlyList<Campaign> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, CampaignStatus? status, Brand? brand, CancellationToken ct = default);
    Task<IReadOnlyList<Campaign>> GetScheduledDueAsync(DateTime asOf, CancellationToken ct = default);
    Task AddAsync(Campaign campaign, CancellationToken ct = default);
    Task UpdateAsync(Campaign campaign, CancellationToken ct = default);
}

public interface ICampaignRecipientRepository
{
    Task AddBatchAsync(IReadOnlyList<CampaignRecipient> recipients, CancellationToken ct = default);
    Task<(IReadOnlyList<CampaignRecipient> Items, int TotalCount)> GetPagedByCampaignAsync(
        Guid campaignId, int page, int pageSize, DeliveryStatus? status, CancellationToken ct = default);
    Task<IReadOnlyList<CampaignRecipient>> GetQueuedByCampaignAsync(
        Guid campaignId, int batchSize, CancellationToken ct = default);
    Task UpdateAsync(CampaignRecipient recipient, CancellationToken ct = default);
    Task UpdateBatchAsync(IReadOnlyList<CampaignRecipient> recipients, CancellationToken ct = default);
}
```

**Key changes from single-brand design:**
- `GetByEmailAsync` is replaced by `GetByEmailAndBrandAsync` — the same email may exist as two separate subscribers (one per brand).
- `GetPagedAsync` accepts an optional `Brand?` filter — admin can view subscribers for a specific brand or all.
- `GetActiveByTagAsync` is replaced by `GetActiveByTagAndBrandAsync` — campaign sends target a specific brand's subscribers.
- `GetStatsAsync` is replaced by `GetStatsByBrandAsync` — stats are always brand-scoped.
- `GetScheduledDueAsync` does not filter by brand — the scheduler processes all due campaigns regardless of brand.

---

## 15. Service Layer

```csharp
public interface INewsletterSubscriptionService
{
    // Brand is resolved internally via IBrandResolver from the X-Brand header
    Task<SubscribeResponseDto> SubscribeAsync(SubscribeRequestDto request, CancellationToken ct = default);
    // Confirm and Unsubscribe are token-based — brand is resolved from the subscriber record
    Task ConfirmAsync(string token, CancellationToken ct = default);
    Task UnsubscribeAsync(string token, CancellationToken ct = default);
}

public interface INewsletterAdminService
{
    Task<PagedResultDto<SubscriberDto>> GetSubscribersAsync(
        int page, int pageSize, SubscriberStatus? status, string? tag, Brand? brand, CancellationToken ct = default);
    Task<SubscriberStatsDto> GetSubscriberStatsAsync(Brand brand, CancellationToken ct = default);
    Task DeleteSubscriberAsync(Guid id, CancellationToken ct = default);
    Task<CampaignDetailDto> CreateCampaignAsync(CreateCampaignDto request, Guid userId, CancellationToken ct = default);
    Task<CampaignDetailDto> UpdateCampaignAsync(Guid id, UpdateCampaignDto request, CancellationToken ct = default);
    Task<PagedResultDto<CampaignDto>> GetCampaignsAsync(
        int page, int pageSize, CampaignStatus? status, Brand? brand, CancellationToken ct = default);
    Task<CampaignDetailDto> GetCampaignAsync(Guid id, CancellationToken ct = default);
    Task SendCampaignAsync(Guid id, CancellationToken ct = default);
    Task CancelCampaignAsync(Guid id, CancellationToken ct = default);
    Task<PagedResultDto<CampaignRecipientDto>> GetCampaignRecipientsAsync(
        Guid campaignId, int page, int pageSize, DeliveryStatus? status, CancellationToken ct = default);
}

public interface ITrackingService
{
    Task RecordOpenAsync(Guid campaignId, Guid subscriberId, CancellationToken ct = default);
    Task<string> RecordClickAsync(Guid campaignId, Guid subscriberId, string targetUrl, CancellationToken ct = default);
}
```

**Key service layer behavior:**
- `SubscribeAsync` resolves brand from `IBrandResolver`, looks up existing subscriber by `(email, brand)`, and creates brand-scoped subscriber records.
- `GetSubscriberStatsAsync` requires a `Brand` parameter — stats are always brand-specific.
- `GetSubscribersAsync` and `GetCampaignsAsync` accept optional `Brand?` filter for admin views.
- `CreateCampaignAsync` reads `Brand` from `CreateCampaignDto` — campaigns are permanently bound to a brand.
- `SendCampaignAsync` queries active subscribers **for the campaign's brand** only.

---

## 16. Project Structure

```
src/Services/Newsletter/
├── OriginHairCollective.Newsletter.Core/
│   ├── Entities/
│   │   ├── Subscriber.cs
│   │   ├── SubscriberTag.cs
│   │   ├── Campaign.cs
│   │   └── CampaignRecipient.cs
│   ├── Enums/
│   │   ├── SubscriberStatus.cs
│   │   ├── CampaignStatus.cs
│   │   └── DeliveryStatus.cs
│   └── Interfaces/
│       ├── ISubscriberRepository.cs
│       ├── ICampaignRepository.cs
│       └── ICampaignRecipientRepository.cs
│
├── OriginHairCollective.Newsletter.Infrastructure/
│   ├── Data/
│   │   ├── NewsletterDbContext.cs
│   │   └── NewsletterDbSeeder.cs
│   └── Repositories/
│       ├── SubscriberRepository.cs
│       ├── CampaignRepository.cs
│       └── CampaignRecipientRepository.cs
│
├── OriginHairCollective.Newsletter.Application/
│   ├── Consumers/
│   │   ├── UserRegisteredNewsletterConsumer.cs
│   │   └── CampaignSendConsumer.cs
│   ├── Dtos/
│   │   ├── SubscribeRequestDto.cs
│   │   ├── SubscribeResponseDto.cs
│   │   ├── SubscriberDto.cs
│   │   ├── SubscriberStatsDto.cs
│   │   ├── CreateCampaignDto.cs
│   │   ├── UpdateCampaignDto.cs
│   │   ├── CampaignDto.cs
│   │   ├── CampaignDetailDto.cs
│   │   ├── CampaignRecipientDto.cs
│   │   └── PagedResultDto.cs
│   ├── Email/
│   │   ├── IEmailSender.cs
│   │   ├── IEmailContentProcessor.cs
│   │   ├── EmailMessage.cs
│   │   ├── EmailSendResult.cs
│   │   ├── SmtpEmailSender.cs
│   │   └── EmailContentProcessor.cs
│   ├── Mapping/
│   │   └── NewsletterMapping.cs
│   └── Services/
│       ├── INewsletterSubscriptionService.cs
│       ├── NewsletterSubscriptionService.cs
│       ├── INewsletterAdminService.cs
│       ├── NewsletterAdminService.cs
│       ├── ITrackingService.cs
│       └── TrackingService.cs
│
└── OriginHairCollective.Newsletter.Api/
    ├── Controllers/
    │   ├── SubscriptionController.cs
    │   ├── TrackingController.cs
    │   └── AdminNewsletterController.cs
    ├── BackgroundServices/
    │   └── CampaignSchedulerService.cs
    ├── appsettings.json
    └── Program.cs
```

---

## 17. Configuration

### Newsletter API `appsettings.json`

```json
{
  "ConnectionStrings": {
    "NewsletterDb": "Data Source=newsletter.db"
  },
  "Email": {
    "Provider": "Smtp",
    "Smtp": {
      "Host": "localhost",
      "Port": 1025,
      "UseSsl": false,
      "Username": "",
      "Password": ""
    }
  },
  "Brands": {
    "OriginHairCollective": {
      "DisplayName": "Origin Hair Collective",
      "ShortName": "Origin",
      "BaseUrl": "https://originhair.com",
      "FromEmail": "newsletter@originhair.com",
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
      "FromEmail": "newsletter@manehaus.com",
      "FromName": "Mane Haus",
      "InstagramHandle": "@ManeHaus",
      "InstagramUrl": "https://instagram.com/manehaus",
      "ContactEmail": "hello@manehaus.com",
      "Tagline": "Luxury hair, boldly redefined."
    }
  },
  "Newsletter": {
    "BatchSize": 50,
    "BatchDelayMs": 1000,
    "SchedulerIntervalMinutes": 1
  }
}
```

### Newsletter API `Program.cs` Registration

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Database
builder.Services.AddDbContext<NewsletterDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("NewsletterDb")));

// Brand resolution
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IBrandResolver, HttpBrandResolver>();
builder.Services.Configure<BrandSettings>(builder.Configuration.GetSection("Brands"));

// Repositories
builder.Services.AddScoped<ISubscriberRepository, SubscriberRepository>();
builder.Services.AddScoped<ICampaignRepository, CampaignRepository>();
builder.Services.AddScoped<ICampaignRecipientRepository, CampaignRecipientRepository>();

// Services
builder.Services.AddScoped<INewsletterSubscriptionService, NewsletterSubscriptionService>();
builder.Services.AddScoped<INewsletterAdminService, NewsletterAdminService>();
builder.Services.AddScoped<ITrackingService, TrackingService>();

// Email
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<IEmailContentProcessor, EmailContentProcessor>();

// Background Services
builder.Services.AddHostedService<CampaignSchedulerService>();

// MassTransit
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<UserRegisteredNewsletterConsumer>();
    x.AddConsumer<CampaignSendConsumer>();
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.ConfigureEndpoints(context);
    });
});

// Auth
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* JWT config */ });
builder.Services.AddAuthorization();

builder.Services.AddControllers();

var app = builder.Build();

// Ensure DB created and seeded
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<NewsletterDbContext>();
    await db.Database.EnsureCreatedAsync();
}

app.MapDefaultEndpoints();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

---

## 18. Testing Strategy

### Unit Tests

- **Service layer tests:** Verify subscription flow (create, confirm, unsubscribe), campaign CRUD, and send orchestration logic using mocked repositories and `IEmailSender`.
- **Email content processor tests:** Verify tracking pixel injection, link rewriting, and unsubscribe header insertion.
- **Consumer tests:** Verify `UserRegisteredNewsletterConsumer` creates subscribers correctly and `CampaignSendConsumer` processes batches and updates statuses.

### Integration Tests

- **Repository tests:** Verify EF Core queries against an in-memory or SQLite test database.
- **API endpoint tests:** Use `WebApplicationFactory<Program>` to test the full HTTP pipeline including authentication, validation, and response codes.
- **MassTransit test harness:** Use `MassTransit.Testing` to verify event publishing and consumer behavior end-to-end.

### Key Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Subscribe with new email (Origin) | Creates pending subscriber with `Brand = OriginHairCollective`, publishes `SubscriptionRequestedEvent` with `Brand` |
| Subscribe with new email (Mane Haus) | Creates pending subscriber with `Brand = ManeHaus`, publishes `SubscriptionRequestedEvent` with `Brand` |
| Same email subscribes to both brands | Two separate subscriber records created, each with its own confirmation token |
| Subscribe with existing active email (same brand) | Returns 200, no duplicate created |
| Subscribe with existing active email (different brand) | Creates new pending subscriber for the other brand |
| Subscribe with unsubscribed email (same brand) | Resets to pending, issues new confirmation token |
| Confirm with valid token | Sets status to Active, clears token, brand preserved from original record |
| Confirm with invalid/expired token | Returns 404 |
| Unsubscribe with valid token | Sets status to Unsubscribed, only affects the specific brand subscription |
| Send campaign to tagged audience | Only matching active subscribers **for the campaign's brand** receive it |
| Send campaign already sent | Returns 400 |
| Batch send with partial failures | Failed recipients marked, campaign still completes |
| Tracking pixel fires | OpenedAt set only on first open |
| Admin endpoints without auth | Returns 401 |
| Admin endpoints with non-admin role | Returns 403 |
| Admin list subscribers with brand filter | Returns only subscribers for the specified brand |
| Admin create campaign with brand | Campaign created with specified brand, cannot be changed later |
| Origin coming soon page email signup | Subscriber created with `Brand = OriginHairCollective`, confirmation email uses Origin branding |
| Mane Haus coming soon page email signup | Subscriber created with `Brand = ManeHaus`, confirmation email uses Mane Haus branding |

---

## 19. Observability

The Newsletter service integrates with the existing OpenTelemetry infrastructure provided by `ServiceDefaults`.

### Metrics

All metrics are tagged with a `brand` dimension for per-brand dashboards:

- `newsletter.subscribers.total` — Gauge of active subscribers (tagged by `brand`).
- `newsletter.campaigns.sent` — Counter of campaigns sent (tagged by `brand`).
- `newsletter.emails.sent` — Counter of individual emails sent (tagged by `brand`).
- `newsletter.emails.bounced` — Counter of bounced emails (tagged by `brand`).
- `newsletter.emails.opened` — Counter of opened emails (tagged by `brand`).

### Tracing

- Distributed traces for the full subscription flow (HTTP → Service → Repository → Event Publish).
- Distributed traces for campaign send (Event Consume → Batch Process → Email Send → Status Update).

### Health Checks

Standard health check endpoints inherited from `ServiceDefaults`:
- `GET /health` — Includes database connectivity check.
- `GET /alive` — Liveness probe.

---

## 20. Implementation Phases

### Phase 1: Core Subscription Management with Brand Support

- Newsletter service scaffold (all four layers).
- `Brand` enum integration via `Shared.Contracts`.
- `IBrandResolver` and `BrandSettings` registration.
- Subscriber CRUD with double opt-in flow, brand-scoped `(Email, Brand)` uniqueness.
- Public subscribe/confirm/unsubscribe endpoints with `X-Brand` header resolution.
- API Gateway and Aspire integration.
- `SubscriptionRequestedEvent` (with `Brand`) published; Notification service consumer sends brand-specific confirmation email.
- Admin subscriber listing and stats endpoints with brand filtering.

### Phase 2: Coming Soon Page Integration

- Wire Origin Hair Collective coming soon page email signup to `POST /api/newsletters/subscribe` with `X-Brand: OriginHairCollective` interceptor.
- Create Mane Haus coming soon page Angular project with brand-specific design tokens and Mane Haus identity.
- Wire Mane Haus coming soon page email signup to `POST /api/newsletters/subscribe` with `X-Brand: ManeHaus` interceptor.
- Register both coming soon apps in Angular workspace configuration.
- Brand-specific confirmation email templates (Origin vs Mane Haus branding, logos, colors, footer).

### Phase 3: Campaign Management and Delivery

- Campaign CRUD (draft, update, delete) with mandatory `Brand` field.
- Send campaign flow with batch processing via `CampaignSendConsumer` using brand-specific `FromName`/`FromEmail`.
- SMTP email sender implementation.
- Brand-aware `IEmailContentProcessor` with brand-specific footer, logo, unsubscribe URL.
- Tracking pixel and click-tracking endpoints.
- Campaign metrics (aggregate counters on `Campaign` entity).
- Admin campaign endpoints with brand filter and recipient status view.

### Phase 4: Automation and Integration

- `CampaignSchedulerService` for scheduled sends (processes all brands).
- `UserRegisteredNewsletterConsumer` for auto-subscribe at registration, brand-scoped by `UserRegisteredEvent.Brand`.
- Order-based opt-in subscription, brand-scoped by `OrderCreatedEvent.Brand`.
- Subscriber tagging and audience segmentation for campaigns (within a brand).

### Phase 5: Advanced Features (Future)

- SendGrid / Amazon SES email provider support.
- Bounce and complaint webhook handlers.
- A/B testing for subject lines.
- Email template management (reusable layouts per brand).
- Subscriber import/export (CSV) with brand column.
- Analytics dashboard data endpoints with brand dimension.

---

## 21. Dependencies

### New NuGet Packages

No new external packages are required beyond what is already in `Directory.Packages.props`. The implementation uses:

| Dependency | Already Available | Purpose |
|------------|-------------------|---------|
| `Microsoft.EntityFrameworkCore.Sqlite` | Yes (9.0.0) | Database |
| `MassTransit` | Yes (8.3.1) | Event bus |
| `MassTransit.RabbitMQ` | Yes (8.3.1) | RabbitMQ transport |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | Yes (9.0.0) | Admin auth |
| `System.Net.Mail` (BCL) | Yes (built-in) | SMTP sending |

### Cross-Service Changes

| Service | Change | Impact |
|---------|--------|--------|
| **Shared.Contracts** | Add 5 new event records with `Brand` field; add `Brand` enum | Low — additive only |
| **Identity** | Publish `UserRegisteredEvent` (with `Brand`) on registration, add `NewsletterOptIn` to `RegisterDto` | Low — new event, optional DTO field |
| **Notification** | Add 2 enum values, add 1–2 new consumers that read `Brand` from events for brand-specific email templates | Low — additive only |
| **API Gateway** | Add newsletter route and cluster; CORS update for Mane Haus origins | Low — configuration only |
| **Aspire AppHost** | Add newsletter project reference; register Mane Haus coming soon app | Low — additive |
| **Angular Workspace** | Add `mane-haus-coming-soon` project; update Origin coming soon with brand interceptor | Medium — new project + interceptor wiring |
| **ServiceDefaults** | Add `BrandSettings`, `BrandConfig`, `IBrandResolver` shared infrastructure | Low — shared utility code |

---

## 22. Coming Soon Page Integration

This section details how the Origin Hair Collective coming soon page and the Mane Haus coming soon page integrate with the Newsletter service for pre-launch email collection.

### 22.1 Architecture

Both coming soon pages are lightweight Angular applications that display brand-specific landing content and an email signup form. The email signup form posts to the Newsletter service's public `POST /api/newsletters/subscribe` endpoint. The `X-Brand` header on the request tells the Newsletter service which brand the subscriber is signing up for.

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│  Origin Coming Soon Page    │     │  Mane Haus Coming Soon Page │
│                             │     │                             │
│  ┌───────────────────────┐  │     │  ┌───────────────────────┐  │
│  │  lib-email-signup     │  │     │  │  lib-email-signup     │  │
│  │  component            │  │     │  │  component            │  │
│  └──────────┬────────────┘  │     │  └──────────┬────────────┘  │
│             │               │     │             │               │
│  onEmailSubmit() ──────────────────────────────────────────┐    │
│  X-Brand: Origin            │     │  X-Brand: ManeHaus     │    │
│  HairCollective             │     │                        │    │
└─────────────┬───────────────┘     └────────────┬───────────┘    │
              │                                   │               │
              └───────────────┬───────────────────┘               │
                              │                                   │
                   ┌──────────▼──────────────┐                    │
                   │  POST /api/newsletters/ │                    │
                   │  subscribe              │                    │
                   │                         │                    │
                   │  Newsletter Service     │                    │
                   │  creates Subscriber     │◄────────────────────
                   │  with Brand column      │
                   └─────────────────────────┘
```

### 22.2 Origin Hair Collective Coming Soon Page

**Location:** `projects/origin-hair-collective-coming-soon/`

The existing coming soon page is updated to:

1. Add `provideHttpClient` with the `brandInterceptor('OriginHairCollective')` to `app.config.ts`.
2. Update the `onEmailSubmit` handler in `app.ts` to call `POST /api/newsletters/subscribe`.
3. Add success/error feedback UI after form submission.

**Updated `app.config.ts`:**
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { brandInterceptor } from 'components';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([brandInterceptor('OriginHairCollective')])),
  ],
};
```

**Updated `app.ts`:**
```typescript
@Component({ ... })
export class App {
  private readonly http = inject(HttpClient);

  protected readonly socialLinks: SocialLink[] = [
    { platform: 'instagram', href: 'https://instagram.com/originhaircollective' },
    { platform: 'email', href: 'mailto:hello@originhaircollective.com' },
  ];

  protected submitted = false;
  protected error = false;

  onEmailSubmit(email: string): void {
    this.http.post('/api/newsletters/subscribe', { email })
      .subscribe({
        next: () => { this.submitted = true; this.error = false; },
        error: () => { this.error = true; }
      });
  }
}
```

**Subscriber flow:**
1. Visitor enters email on Origin coming soon page.
2. `POST /api/newsletters/subscribe` is sent with `X-Brand: OriginHairCollective` header.
3. Newsletter service creates a `Subscriber` with `Brand = OriginHairCollective`, `Status = Pending`.
4. `SubscriptionRequestedEvent` published with `Brand = OriginHairCollective`.
5. Notification service sends a confirmation email branded with Origin Hair Collective identity.
6. Visitor clicks confirmation link → subscriber becomes `Active` for Origin brand.

### 22.3 Mane Haus Coming Soon Page

**Location:** `projects/mane-haus-coming-soon/` (new)

A new Angular application with Mane Haus brand identity. Structurally identical to the Origin coming soon page but with:

- Mane Haus logo (via `<lib-logo brand="mane-haus" />`).
- Mane Haus tagline: "Luxury hair, boldly redefined."
- Mane Haus social links and handle.
- Mane Haus brand-specific color palette and imagery.
- `brandInterceptor('ManeHaus')` in the HTTP client configuration.

**`app.config.ts`:**
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([brandInterceptor('ManeHaus')])),
  ],
};
```

**Subscriber flow:**
1. Visitor enters email on Mane Haus coming soon page.
2. `POST /api/newsletters/subscribe` is sent with `X-Brand: ManeHaus` header.
3. Newsletter service creates a `Subscriber` with `Brand = ManeHaus`, `Status = Pending`.
4. `SubscriptionRequestedEvent` published with `Brand = ManeHaus`.
5. Notification service sends a confirmation email branded with Mane Haus identity.
6. Visitor clicks confirmation link → subscriber becomes `Active` for Mane Haus brand.

### 22.4 Cross-Brand Subscription

If a visitor subscribes on both coming soon pages with the same email address, two separate subscriber records are created — one for each brand. Each has its own:

- Confirmation token and confirmation flow.
- Unsubscribe token and unsubscribe flow.
- Status (can be Active on one brand, Unsubscribed on the other).
- Tag list.

Unsubscribing from one brand does not affect the other brand's subscription.

### 22.5 Confirmation Email Branding

The confirmation email sent by the Notification service differs by brand:

| Element | Origin Hair Collective | Mane Haus |
|---------|----------------------|-----------|
| Subject | "Confirm your Origin Hair Collective subscription" | "Confirm your Mane Haus subscription" |
| From | Origin Hair Collective <newsletter@originhair.com> | Mane Haus <newsletter@manehaus.com> |
| Logo | Origin Hair Collective logo | Mane Haus logo |
| Body text | "Thank you for joining the Origin Hair Collective community..." | "Thank you for joining the Mane Haus community..." |
| Confirmation URL | `https://originhair.com/api/newsletters/confirm?token=...` | `https://manehaus.com/api/newsletters/confirm?token=...` |
| Footer | Origin Hair Collective branding, Instagram, contact | Mane Haus branding, Instagram, contact |

### 22.6 Angular Workspace Registration

Both coming soon pages are registered in `angular.json`:

```json
{
  "origin-hair-collective-coming-soon": {
    "projectType": "application",
    "root": "projects/origin-hair-collective-coming-soon",
    "...": "existing configuration"
  },
  "mane-haus-coming-soon": {
    "projectType": "application",
    "root": "projects/mane-haus-coming-soon",
    "sourceRoot": "projects/mane-haus-coming-soon/src",
    "prefix": "app",
    "architect": {
      "build": { "builder": "@angular/build:application", "..." : "..." },
      "serve": { "builder": "@angular/build:dev-server", "...": "..." },
      "test": { "builder": "@angular/build:unit-test" }
    }
  }
}
```

Development commands:
```bash
ng serve origin-hair-collective-coming-soon   # Origin coming soon on localhost:4200
ng serve mane-haus-coming-soon                # Mane Haus coming soon on localhost:4201
```
