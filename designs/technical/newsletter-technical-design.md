# Newsletter Service — Technical Design

## 1. Overview

This document describes the technical design for adding newsletter capabilities to the Origin Hair Collective platform. The feature enables the business to build a subscriber list, compose newsletter campaigns, and deliver email content to opted-in customers — covering product launches, promotions, hair care tips, and company updates.

The design follows the existing microservices architecture, event-driven patterns, and layered project conventions already established in the codebase.

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

### Non-Goals

- Rich drag-and-drop email template builder (HTML templates will be managed as raw content).
- A/B testing of subject lines or content variants (future enhancement).
- Real-time push notifications or SMS newsletter delivery.
- Paid subscription tiers or premium newsletter content.

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
┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│   Angular    │────▶│  API Gateway  │────▶│  Newsletter API   │
│   Frontend   │     │   (YARP)      │     │  /api/newsletters  │
└──────────────┘     └───────────────┘     └────────┬─────────┘
                                                     │
                          ┌──────────────────────────┤
                          │                          │
                          ▼                          ▼
                   ┌─────────────┐          ┌──────────────────┐
                   │  RabbitMQ   │          │  Newsletter DB   │
                   │ (MassTransit)│          │   (SQLite)       │
                   └──────┬──────┘          └──────────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
     ┌──────────────┐ ┌────────┐ ┌────────────┐
     │  Identity    │ │ Order  │ │ Notification│
     │  Service     │ │Service │ │  Service    │
     └──────────────┘ └────────┘ └────────────┘
```

**Key relationships:**

- **Identity Service** publishes `UserRegisteredEvent` — Newsletter service auto-creates a subscriber record when users opt in during registration.
- **Order Service** publishes `OrderCreatedEvent` — Newsletter service can subscribe customers who opted in at checkout.
- **Newsletter Service** publishes `NewsletterSentEvent` — Notification service logs the send for audit purposes.
- **Newsletter Service** owns its subscriber list, campaigns, and delivery tracking independently.

---

## 4. Domain Model

### 4.1 Entities

#### `Subscriber`

The core entity representing a newsletter subscriber.

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

Represents a single newsletter edition or email blast.

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
    public string? TargetTag { get; set; }             // null = all active subscribers
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

| Column             | Type         | Constraints                  |
|--------------------|--------------|------------------------------|
| Id                 | GUID         | PK                           |
| Email              | TEXT         | NOT NULL, UNIQUE INDEX       |
| FirstName          | TEXT         | NULLABLE                     |
| LastName           | TEXT         | NULLABLE                     |
| UserId             | GUID         | NULLABLE, INDEX              |
| Status             | INTEGER      | NOT NULL (enum)              |
| ConfirmationToken  | TEXT         | NULLABLE                     |
| ConfirmedAt        | DATETIME     | NULLABLE                     |
| CreatedAt          | DATETIME     | NOT NULL                     |
| UnsubscribedAt     | DATETIME     | NULLABLE                     |
| UnsubscribeToken   | TEXT         | NULLABLE, UNIQUE INDEX       |

#### `SubscriberTags`

| Column       | Type     | Constraints                        |
|--------------|----------|------------------------------------|
| Id           | GUID     | PK                                 |
| SubscriberId | GUID     | NOT NULL, FK → Subscribers, INDEX  |
| Tag          | TEXT     | NOT NULL                           |
| CreatedAt    | DATETIME | NOT NULL                           |

**Composite Index:** (`SubscriberId`, `Tag`) UNIQUE

#### `Campaigns`

| Column            | Type         | Constraints       |
|-------------------|--------------|--------------------|
| Id                | GUID         | PK                 |
| Subject           | TEXT         | NOT NULL           |
| HtmlBody          | TEXT         | NOT NULL           |
| PlainTextBody     | TEXT         | NULLABLE           |
| Status            | INTEGER      | NOT NULL (enum)    |
| ScheduledAt       | DATETIME     | NULLABLE           |
| SentAt            | DATETIME     | NULLABLE           |
| TargetTag         | TEXT         | NULLABLE           |
| TotalRecipients   | INTEGER      | NOT NULL, DEFAULT 0|
| TotalSent         | INTEGER      | NOT NULL, DEFAULT 0|
| TotalOpened       | INTEGER      | NOT NULL, DEFAULT 0|
| TotalClicked      | INTEGER      | NOT NULL, DEFAULT 0|
| TotalBounced      | INTEGER      | NOT NULL, DEFAULT 0|
| TotalUnsubscribed | INTEGER      | NOT NULL, DEFAULT 0|
| CreatedByUserId   | GUID         | NOT NULL           |
| CreatedAt         | DATETIME     | NOT NULL           |
| UpdatedAt         | DATETIME     | NULLABLE           |

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

### 6.1 Public Endpoints (No Authentication)

#### Subscribe

```
POST /api/newsletters/subscribe
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
1. Validate email format.
2. If the email already exists and is `Active`, return `200` with an informational message.
3. If the email already exists and is `Unsubscribed`, reset status to `Pending` and issue a new confirmation token.
4. Generate a `ConfirmationToken` (cryptographic random, URL-safe).
5. Persist `Subscriber` with `Status = Pending`.
6. Publish `SubscriptionRequestedEvent` to trigger confirmation email via the Notification service.

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

#### List Subscribers

```
GET /api/newsletters/admin/subscribers?page=1&pageSize=25&status=Active&tag=promotions
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
GET /api/newsletters/admin/subscribers/stats
```

**Response:** `200 OK`
```json
{
  "totalActive": 142,
  "totalPending": 8,
  "totalUnsubscribed": 23,
  "recentSubscribers": 12
}
```

#### Remove Subscriber (Admin)

```
DELETE /api/newsletters/admin/subscribers/{id}
```

**Response:** `204 No Content`

#### List Campaigns

```
GET /api/newsletters/admin/campaigns?page=1&pageSize=10&status=Sent
```

**Response:** `200 OK` with paginated campaign list including metrics.

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
  "scheduledAt": "2026-03-01T09:00:00Z"
}
```

**Response:** `201 Created`

**Behavior:**
1. Validate required fields.
2. Create campaign with `Status = Draft` (or `Scheduled` if `scheduledAt` is provided).
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
2. Query active subscribers (filtered by `TargetTag` if set).
3. Create `CampaignRecipient` records with `Status = Queued`.
4. Set `Campaign.Status = Sending`, `Campaign.TotalRecipients`.
5. Publish `CampaignSendRequestedEvent` to begin asynchronous delivery.

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

```csharp
// Triggers confirmation email via Notification service
public sealed record SubscriptionRequestedEvent(
    Guid SubscriberId,
    string Email,
    string? FirstName,
    string ConfirmationToken,
    DateTime OccurredAt);

// Informational — subscriber is now active
public sealed record SubscriberConfirmedEvent(
    Guid SubscriberId,
    string Email,
    DateTime OccurredAt);

// Informational — subscriber opted out
public sealed record SubscriberUnsubscribedEvent(
    Guid SubscriberId,
    string Email,
    DateTime OccurredAt);

// Triggers batch email delivery
public sealed record CampaignSendRequestedEvent(
    Guid CampaignId,
    string Subject,
    int TotalRecipients,
    DateTime OccurredAt);

// Published after all recipients have been processed
public sealed record CampaignCompletedEvent(
    Guid CampaignId,
    int TotalSent,
    int TotalFailed,
    DateTime OccurredAt);
```

### Events Consumed by Newsletter Service

```csharp
// Existing event — Newsletter service adds a consumer to auto-subscribe
// customers who opt in during registration
public sealed record UserRegisteredEvent(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    bool NewsletterOptIn,
    DateTime OccurredAt);

// Existing event — auto-subscribe at checkout if opted in
// (OrderCreatedEvent already exists in Shared.Contracts)
// Newsletter consumer checks for an opt-in flag
```

**Note:** `UserRegisteredEvent` is a new event that would need to be published by the Identity service when a user registers. The `OrderCreatedEvent` already exists; the Newsletter service adds its own consumer that only acts if the customer opted in (determined by a new `NewsletterOptIn` field on the order or a separate subscription check).

---

## 8. MassTransit Consumers

### 8.1 Newsletter Service Consumers

| Consumer | Listens To | Behavior |
|----------|-----------|----------|
| `UserRegisteredNewsletterConsumer` | `UserRegisteredEvent` | If `NewsletterOptIn = true`, create subscriber with `Status = Active` (implicit consent via registration), set `UserId` link. |
| `CampaignSendConsumer` | `CampaignSendRequestedEvent` | Fetches all `Queued` recipients for the campaign, sends emails in batches via `IEmailSender`, updates `CampaignRecipient` statuses, publishes `CampaignCompletedEvent` when done. |

### 8.2 Notification Service Consumers (New)

| Consumer | Listens To | Behavior |
|----------|-----------|----------|
| `SubscriptionConfirmationConsumer` | `SubscriptionRequestedEvent` | Sends the double opt-in confirmation email with the confirmation link. Logs to `NotificationLog` with `Type = NewsletterConfirmation`. |
| `CampaignCompletedNotificationConsumer` | `CampaignCompletedEvent` | Logs the campaign completion in `NotificationLog` for audit. |

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
    },
    "FromName": "Origin Hair Collective",
    "FromEmail": "hello@originhair.com"
  }
}
```

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
3. **Inject unsubscribe link:** Add the subscriber-specific unsubscribe URL to the email footer and the `List-Unsubscribe` header (RFC 8058 compliance).

```csharp
public interface IEmailContentProcessor
{
    string ProcessHtml(string htmlBody, Guid campaignId, Guid subscriberId, string unsubscribeToken);
}
```

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
    List<string> Tags,
    DateTime? ConfirmedAt,
    DateTime CreatedAt,
    DateTime? UnsubscribedAt);

public sealed record SubscriberStatsDto(
    int TotalActive,
    int TotalPending,
    int TotalUnsubscribed,
    int RecentSubscribers);

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
    DateTime? ScheduledAt);

public sealed record UpdateCampaignDto(
    string? Subject,
    string? HtmlBody,
    string? PlainTextBody,
    string? TargetTag,
    DateTime? ScheduledAt);

public sealed record CampaignDto(
    Guid Id,
    string Subject,
    string Status,
    string? TargetTag,
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
    Task<Subscriber?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<Subscriber?> GetByConfirmationTokenAsync(string token, CancellationToken ct = default);
    Task<Subscriber?> GetByUnsubscribeTokenAsync(string token, CancellationToken ct = default);
    Task<(IReadOnlyList<Subscriber> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, SubscriberStatus? status, string? tag, CancellationToken ct = default);
    Task<IReadOnlyList<Subscriber>> GetActiveByTagAsync(string? tag, CancellationToken ct = default);
    Task<SubscriberStats> GetStatsAsync(CancellationToken ct = default);
    Task AddAsync(Subscriber subscriber, CancellationToken ct = default);
    Task UpdateAsync(Subscriber subscriber, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

public interface ICampaignRepository
{
    Task<Campaign?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IReadOnlyList<Campaign> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, CampaignStatus? status, CancellationToken ct = default);
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

---

## 15. Service Layer

```csharp
public interface INewsletterSubscriptionService
{
    Task<SubscribeResponseDto> SubscribeAsync(SubscribeRequestDto request, CancellationToken ct = default);
    Task ConfirmAsync(string token, CancellationToken ct = default);
    Task UnsubscribeAsync(string token, CancellationToken ct = default);
}

public interface INewsletterAdminService
{
    Task<PagedResultDto<SubscriberDto>> GetSubscribersAsync(
        int page, int pageSize, SubscriberStatus? status, string? tag, CancellationToken ct = default);
    Task<SubscriberStatsDto> GetSubscriberStatsAsync(CancellationToken ct = default);
    Task DeleteSubscriberAsync(Guid id, CancellationToken ct = default);
    Task<CampaignDetailDto> CreateCampaignAsync(CreateCampaignDto request, Guid userId, CancellationToken ct = default);
    Task<CampaignDetailDto> UpdateCampaignAsync(Guid id, UpdateCampaignDto request, CancellationToken ct = default);
    Task<PagedResultDto<CampaignDto>> GetCampaignsAsync(
        int page, int pageSize, CampaignStatus? status, CancellationToken ct = default);
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
│   │   └── NewsletterMappingExtensions.cs
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
    },
    "FromName": "Origin Hair Collective",
    "FromEmail": "newsletter@originhair.com"
  },
  "Newsletter": {
    "BaseUrl": "https://originhair.com",
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
| Subscribe with new email | Creates pending subscriber, publishes `SubscriptionRequestedEvent` |
| Subscribe with existing active email | Returns 200, no duplicate created |
| Subscribe with unsubscribed email | Resets to pending, issues new confirmation token |
| Confirm with valid token | Sets status to Active, clears token |
| Confirm with invalid/expired token | Returns 404 |
| Unsubscribe with valid token | Sets status to Unsubscribed |
| Send campaign to tagged audience | Only matching active subscribers receive it |
| Send campaign already sent | Returns 400 |
| Batch send with partial failures | Failed recipients marked, campaign still completes |
| Tracking pixel fires | OpenedAt set only on first open |
| Admin endpoints without auth | Returns 401 |
| Admin endpoints with non-admin role | Returns 403 |

---

## 19. Observability

The Newsletter service integrates with the existing OpenTelemetry infrastructure provided by `ServiceDefaults`.

### Metrics

- `newsletter.subscribers.total` — Gauge of active subscribers.
- `newsletter.campaigns.sent` — Counter of campaigns sent.
- `newsletter.emails.sent` — Counter of individual emails sent.
- `newsletter.emails.bounced` — Counter of bounced emails.
- `newsletter.emails.opened` — Counter of opened emails.

### Tracing

- Distributed traces for the full subscription flow (HTTP → Service → Repository → Event Publish).
- Distributed traces for campaign send (Event Consume → Batch Process → Email Send → Status Update).

### Health Checks

Standard health check endpoints inherited from `ServiceDefaults`:
- `GET /health` — Includes database connectivity check.
- `GET /alive` — Liveness probe.

---

## 20. Implementation Phases

### Phase 1: Core Subscription Management

- Newsletter service scaffold (all four layers).
- Subscriber CRUD with double opt-in flow.
- Public subscribe/confirm/unsubscribe endpoints.
- API Gateway and Aspire integration.
- `SubscriptionRequestedEvent` published; Notification service consumer sends confirmation email.
- Admin subscriber listing and stats endpoints.

### Phase 2: Campaign Management and Delivery

- Campaign CRUD (draft, update, delete).
- Send campaign flow with batch processing via `CampaignSendConsumer`.
- SMTP email sender implementation.
- Tracking pixel and click-tracking endpoints.
- Campaign metrics (aggregate counters on `Campaign` entity).
- Admin campaign endpoints with recipient status view.

### Phase 3: Automation and Integration

- `CampaignSchedulerService` for scheduled sends.
- `UserRegisteredNewsletterConsumer` for auto-subscribe at registration.
- Order-based opt-in subscription.
- Subscriber tagging and audience segmentation for campaigns.

### Phase 4: Advanced Features (Future)

- SendGrid / Amazon SES email provider support.
- Bounce and complaint webhook handlers.
- A/B testing for subject lines.
- Email template management (reusable layouts).
- Subscriber import/export (CSV).
- Analytics dashboard data endpoints.

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
| **Shared.Contracts** | Add 5 new event records | Low — additive only |
| **Identity** | Publish `UserRegisteredEvent` on registration, add `NewsletterOptIn` to `RegisterDto` | Low — new event, optional DTO field |
| **Notification** | Add 2 enum values, add 1–2 new consumers | Low — additive only |
| **API Gateway** | Add newsletter route and cluster | Low — configuration only |
| **Aspire AppHost** | Add newsletter project reference | Low — one line |
