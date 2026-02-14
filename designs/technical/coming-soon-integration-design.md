# Coming Soon Page Integration — Technical Design

## 1. Overview

This document describes the technical design for the Angular frontend services and backend microservice additions needed to fully integrate the "coming soon" landing page with the Origin Hair Collective platform. The coming-soon app currently renders a pre-launch page with an email signup form, branding, and social links — but the email signup is a stub (`console.log`) with no backend connectivity.

This design covers:

1. **Angular frontend services** — HttpClient setup, `NewsletterService`, environment configuration, and user feedback mechanisms for the coming-soon app.
2. **Analytics microservice** — A new lightweight microservice to track page visits, email signup conversions, and referral sources for pre-launch business intelligence.
3. **Backend integration changes** — YARP gateway routing, CORS configuration, and Aspire orchestration updates required to connect the coming-soon app to existing services.

The design follows the existing microservices architecture, event-driven patterns, and layered project conventions already established in the codebase.

---

## 2. Goals and Non-Goals

### Goals

- Connect the coming-soon email signup form to the existing Newsletter microservice (`POST /subscribe`).
- Provide clear success/error feedback to visitors after submitting their email.
- Track anonymous page visits, signup conversions, and referral sources for pre-launch analytics.
- Expose analytics data to admins through API endpoints (consumed by the admin dashboard in a future phase).
- Follow the existing architectural patterns — clean architecture layers, event-driven messaging, database-per-service.
- Keep the coming-soon app lightweight — minimal dependencies, fast load time, small bundle.

### Non-Goals

- Admin dashboard UI for analytics (future phase — backend endpoints only).
- A/B testing of landing page variants.
- Referral/waitlist position tracking (e.g., "You are #42 on the waitlist").
- Social media OAuth login or user accounts on the coming-soon page.
- Server-side rendering (SSR) for the coming-soon page.
- Real-time analytics dashboards or WebSocket-based live visitor counts.

---

## 3. Architecture Overview

### 3.1 System Context

```
┌──────────────────────┐
│  Coming Soon App     │
│  (Angular SPA)       │
│  Standalone deploy   │
└──────────┬───────────┘
           │
      HTTPS (fetch)
           │
┌──────────▼───────────┐
│  API Gateway (YARP)  │
│  /api/newsletters/*  │
│  /api/analytics/*    │
└──────┬─────────┬─────┘
       │         │
       ▼         ▼
┌────────────┐ ┌──────────────────┐
│ Newsletter │ │ Analytics        │
│ Service    │ │ Service (NEW)    │
│ /subscribe │ │ /events, /stats  │
└──────┬─────┘ └────────┬─────────┘
       │                │
       ▼                ▼
┌────────────┐ ┌──────────────────┐
│newsletter  │ │analytics.db      │
│.db (SQLite)│ │(SQLite)          │
└────────────┘ └──────────────────┘
       │                │
       ▼                ▼
┌─────────────────────────────────┐
│         RabbitMQ (MassTransit)  │
└─────────────────────────────────┘
```

### 3.2 Key Relationships

- **Coming-soon app** calls the Newsletter API through the YARP gateway to subscribe emails.
- **Coming-soon app** calls the Analytics API through the YARP gateway to record page visits and track conversions.
- **Newsletter Service** publishes `SubscriptionRequestedEvent` — the Analytics service consumes this to correlate signups with page visit data.
- **Analytics Service** publishes `AnalyticsEventRecordedEvent` — the Notification service can consume this for admin alerts (e.g., milestone notifications like "100th subscriber").

---

## 4. Angular Frontend Changes (Coming-Soon App)

### 4.1 App Configuration

Add `HttpClient` and configure the API base URL via environment files.

#### `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api',
};
```

#### `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiBaseUrl: '/api',
};
```

#### `src/app/app.config.ts` (Updated)

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

### 4.2 Newsletter Service

A lightweight Angular service to interact with the Newsletter API.

#### `src/app/services/newsletter.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SubscribeRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
}

export interface SubscribeResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/newsletters`;

  subscribe(request: SubscribeRequest): Observable<SubscribeResponse> {
    return this.http
      .post<SubscribeResponse>(`${this.baseUrl}/subscribe`, request)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Something went wrong. Please try again.';
    if (error.status === 429) {
      message = 'Too many requests. Please wait a moment and try again.';
    } else if (error.status === 400) {
      message = 'Please enter a valid email address.';
    } else if (error.status === 0) {
      message = 'Unable to connect. Please check your internet connection.';
    }
    return throwError(() => new Error(message));
  }
}
```

### 4.3 Analytics Service

A lightweight Angular service that records page visits and tracks signup sources.

#### `src/app/services/analytics.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AnalyticsEvent {
  eventType: string;
  sessionId: string;
  referrer?: string;
  userAgent?: string;
  metadata?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/analytics`;
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  trackPageView(): void {
    this.track({
      eventType: 'page_view',
      sessionId: this.sessionId,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      metadata: {
        url: window.location.href,
        screen: `${window.screen.width}x${window.screen.height}`,
      },
    });
  }

  trackSignupAttempt(email: string): void {
    this.track({
      eventType: 'signup_attempt',
      sessionId: this.sessionId,
      metadata: { emailDomain: email.split('@')[1] ?? 'unknown' },
    });
  }

  trackSignupSuccess(): void {
    this.track({
      eventType: 'signup_success',
      sessionId: this.sessionId,
    });
  }

  trackSignupError(error: string): void {
    this.track({
      eventType: 'signup_error',
      sessionId: this.sessionId,
      metadata: { error },
    });
  }

  trackSocialClick(platform: string): void {
    this.track({
      eventType: 'social_click',
      sessionId: this.sessionId,
      metadata: { platform },
    });
  }

  private track(event: AnalyticsEvent): void {
    // Fire-and-forget — analytics failures should never impact UX
    this.http.post(`${this.baseUrl}/events`, event).subscribe({
      error: () => {}, // Silently ignore analytics errors
    });
  }

  private getOrCreateSessionId(): string {
    const key = 'analytics_session_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  }
}
```

### 4.4 App Component Updates

Update the root component to wire up the services and provide user feedback.

#### `src/app/app.ts` (Updated)

```typescript
import { Component, inject, signal } from '@angular/core';
import { LogoComponent, DividerComponent, BadgeComponent, SocialIconsComponent, EmailSignupComponent } from 'components';
import type { SocialLink } from 'components';
import { NewsletterService } from './services/newsletter.service';
import { AnalyticsService } from './services/analytics.service';

@Component({
  selector: 'app-root',
  imports: [LogoComponent, DividerComponent, BadgeComponent, SocialIconsComponent, EmailSignupComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly newsletterService = inject(NewsletterService);
  private readonly analyticsService = inject(AnalyticsService);

  protected readonly socialLinks: SocialLink[] = [
    { platform: 'instagram', href: 'https://instagram.com/originhaircollective' },
    { platform: 'email', href: 'mailto:hello@originhaircollective.com' },
  ];

  protected readonly submitState = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  protected readonly feedbackMessage = signal<string>('');

  constructor() {
    this.analyticsService.trackPageView();
  }

  onEmailSubmit(email: string): void {
    if (this.submitState() === 'loading') return;

    this.submitState.set('loading');
    this.analyticsService.trackSignupAttempt(email);

    this.newsletterService
      .subscribe({ email, tags: ['coming-soon'] })
      .subscribe({
        next: (response) => {
          this.submitState.set('success');
          this.feedbackMessage.set(response.message);
          this.analyticsService.trackSignupSuccess();
        },
        error: (err: Error) => {
          this.submitState.set('error');
          this.feedbackMessage.set(err.message);
          this.analyticsService.trackSignupError(err.message);
        },
      });
  }

  onSocialClick(platform: string): void {
    this.analyticsService.trackSocialClick(platform);
  }
}
```

### 4.5 Template Updates

Add feedback UI below the email signup form.

#### `src/app/app.html` (Additions)

Add the following below the `<lib-email-signup>` element:

```html
@if (submitState() === 'loading') {
  <p class="feedback feedback--loading">Submitting...</p>
}
@if (submitState() === 'success') {
  <p class="feedback feedback--success">{{ feedbackMessage() }}</p>
}
@if (submitState() === 'error') {
  <p class="feedback feedback--error">{{ feedbackMessage() }}</p>
}
```

### 4.6 Feedback Styles

#### `src/app/app.scss` (Additions)

```scss
.feedback {
  font-family: var(--font-body);
  font-size: 0.875rem;
  text-align: center;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  animation: fadeIn 0.3s ease-in;

  &--loading {
    color: var(--color-text-secondary);
  }

  &--success {
    color: var(--color-gold);
    background: var(--color-gold-15);
    border: 1px solid var(--color-gold-border);
  }

  &--error {
    color: #e57373;
    background: rgba(229, 115, 115, 0.08);
    border: 1px solid rgba(229, 115, 115, 0.19);
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 4.7 File Structure (Frontend Changes)

```
origin-hair-collective-coming-soon/src/
├── app/
│   ├── app.ts                          # Updated — inject services, add signals
│   ├── app.html                        # Updated — add feedback UI
│   ├── app.scss                        # Updated — add feedback styles
│   ├── app.config.ts                   # Updated — add provideHttpClient()
│   ├── app.routes.ts                   # Unchanged
│   └── services/
│       ├── newsletter.service.ts       # NEW — Newsletter API client
│       └── analytics.service.ts        # NEW — Analytics event tracker
├── environments/
│   ├── environment.ts                  # NEW — dev environment config
│   └── environment.prod.ts            # NEW — prod environment config
└── ...
```

---

## 5. Analytics Microservice (New)

### 5.1 Purpose

A lightweight microservice for recording and querying anonymous visitor analytics for the coming-soon page. Tracks page views, signup funnel events, referral sources, and social link clicks. This data helps the business understand pre-launch engagement and optimize the landing page.

### 5.2 Project Structure

```
src/Services/Analytics/
├── OriginHairCollective.Analytics.Core/
│   ├── Entities/
│   │   ├── AnalyticsEvent.cs
│   │   └── DailyAggregate.cs
│   ├── Enums/
│   │   └── EventType.cs
│   └── Interfaces/
│       ├── IAnalyticsEventRepository.cs
│       └── IDailyAggregateRepository.cs
│
├── OriginHairCollective.Analytics.Infrastructure/
│   ├── Data/
│   │   ├── AnalyticsDbContext.cs
│   │   └── AnalyticsDbSeeder.cs
│   └── Repositories/
│       ├── AnalyticsEventRepository.cs
│       └── DailyAggregateRepository.cs
│
├── OriginHairCollective.Analytics.Application/
│   ├── Dtos/
│   │   ├── RecordEventDto.cs
│   │   ├── AnalyticsEventDto.cs
│   │   ├── DailyStatsDto.cs
│   │   ├── FunnelStatsDto.cs
│   │   └── ReferrerStatsDto.cs
│   ├── Mapping/
│   │   └── AnalyticsMapping.cs
│   ├── Services/
│   │   ├── IAnalyticsService.cs
│   │   ├── AnalyticsService.cs
│   │   ├── IAggregationService.cs
│   │   └── AggregationService.cs
│   └── Consumers/
│       └── SubscriptionRequestedAnalyticsConsumer.cs
│
└── OriginHairCollective.Analytics.Api/
    ├── Controllers/
    │   ├── EventsController.cs
    │   └── AdminAnalyticsController.cs
    ├── BackgroundServices/
    │   └── DailyAggregationService.cs
    ├── appsettings.json
    └── Program.cs
```

### 5.3 Domain Model

#### `AnalyticsEvent`

Represents a single tracked event from a visitor session.

```csharp
public sealed class AnalyticsEvent
{
    public Guid Id { get; set; }
    public required string EventType { get; set; }       // page_view, signup_attempt, signup_success, etc.
    public required string SessionId { get; set; }        // Anonymous session identifier
    public string? Referrer { get; set; }                 // HTTP referrer URL
    public string? UserAgent { get; set; }                // Browser user agent string
    public string? IpHash { get; set; }                   // SHA256 hash of IP (privacy-preserving)
    public string? MetadataJson { get; set; }             // JSON-serialized key/value metadata
    public DateTime CreatedAt { get; set; }
}
```

#### `DailyAggregate`

Pre-computed daily rollup for fast admin dashboard queries.

```csharp
public sealed class DailyAggregate
{
    public Guid Id { get; set; }
    public required DateOnly Date { get; set; }
    public required string EventType { get; set; }
    public int Count { get; set; }
    public int UniqueSessionCount { get; set; }
    public DateTime ComputedAt { get; set; }
}
```

#### Enums

```csharp
public enum EventType
{
    PageView,
    SignupAttempt,
    SignupSuccess,
    SignupError,
    SocialClick
}
```

### 5.4 Database Schema (SQLite — `analytics.db`)

#### `AnalyticsEvents`

| Column       | Type     | Constraints                   |
|--------------|----------|-------------------------------|
| Id           | GUID     | PK                            |
| EventType    | TEXT     | NOT NULL, INDEX               |
| SessionId    | TEXT     | NOT NULL, INDEX               |
| Referrer     | TEXT     | NULLABLE                      |
| UserAgent    | TEXT     | NULLABLE                      |
| IpHash       | TEXT     | NULLABLE                      |
| MetadataJson | TEXT     | NULLABLE                      |
| CreatedAt    | DATETIME | NOT NULL, INDEX               |

**Composite Index:** (`EventType`, `CreatedAt`)

#### `DailyAggregates`

| Column             | Type    | Constraints                          |
|--------------------|---------|--------------------------------------|
| Id                 | GUID    | PK                                   |
| Date               | DATE    | NOT NULL                             |
| EventType          | TEXT    | NOT NULL                             |
| Count              | INTEGER | NOT NULL, DEFAULT 0                  |
| UniqueSessionCount | INTEGER | NOT NULL, DEFAULT 0                  |
| ComputedAt         | DATETIME| NOT NULL                             |

**Composite Index:** (`Date`, `EventType`) UNIQUE

---

## 6. Analytics API Design

### 6.1 Public Endpoints (No Authentication)

#### Record Event

```
POST /api/analytics/events
```

**Request Body:**
```json
{
  "eventType": "page_view",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "referrer": "https://instagram.com/originhaircollective",
  "userAgent": "Mozilla/5.0 ...",
  "metadata": {
    "url": "https://originhair.com",
    "screen": "1920x1080"
  }
}
```

**Response:** `202 Accepted`
```json
{
  "message": "Event recorded."
}
```

**Behavior:**
1. Validate `eventType` against allowed values.
2. Validate `sessionId` is a valid UUID format.
3. Hash the client IP address with SHA256 for privacy-preserving unique visitor counting.
4. Serialize `metadata` map to JSON string.
5. Persist `AnalyticsEvent` record.
6. Return 202 immediately (fire-and-forget from the client perspective).

**Rate Limiting:** 60 requests per minute per IP to prevent abuse.

### 6.2 Admin Endpoints (Requires JWT Authentication, Admin Role)

#### Daily Stats

```
GET /api/analytics/admin/stats/daily?from=2026-01-01&to=2026-02-13
```

**Response:** `200 OK`
```json
{
  "days": [
    {
      "date": "2026-02-12",
      "pageViews": 342,
      "uniqueVisitors": 218,
      "signupAttempts": 45,
      "signupSuccesses": 38,
      "signupErrors": 7,
      "socialClicks": 23,
      "conversionRate": 17.43
    }
  ],
  "totals": {
    "pageViews": 4821,
    "uniqueVisitors": 2915,
    "signupAttempts": 612,
    "signupSuccesses": 523,
    "conversionRate": 17.94
  }
}
```

#### Funnel Stats

```
GET /api/analytics/admin/stats/funnel?from=2026-01-01&to=2026-02-13
```

**Response:** `200 OK`
```json
{
  "steps": [
    { "name": "Page View", "count": 4821, "percentage": 100.0 },
    { "name": "Signup Attempt", "count": 612, "percentage": 12.69 },
    { "name": "Signup Success", "count": 523, "percentage": 10.85 }
  ],
  "overallConversionRate": 10.85
}
```

#### Referrer Stats

```
GET /api/analytics/admin/stats/referrers?from=2026-01-01&to=2026-02-13&limit=10
```

**Response:** `200 OK`
```json
{
  "referrers": [
    { "source": "instagram.com", "visits": 1245, "signups": 189, "conversionRate": 15.18 },
    { "source": "direct", "visits": 2100, "signups": 210, "conversionRate": 10.00 },
    { "source": "google.com", "visits": 876, "signups": 98, "conversionRate": 11.19 }
  ]
}
```

#### Recent Events (Raw)

```
GET /api/analytics/admin/events?page=1&pageSize=50&eventType=signup_success
```

**Response:** `200 OK` with paginated event list.

---

## 7. Event Contracts

New event records added to `OriginHairCollective.Shared.Contracts`:

### Events Published by Analytics Service

```csharp
/// Published when a notable analytics milestone is reached
public sealed record AnalyticsMilestoneReachedEvent(
    string MilestoneType,           // e.g., "subscriber_count", "page_views"
    int Value,                       // e.g., 100, 500, 1000
    DateTime OccurredAt);
```

### Events Consumed by Analytics Service

```csharp
// Existing event from Newsletter Service
// Analytics service correlates newsletter signups with page visit sessions
public sealed record SubscriptionRequestedEvent(
    Guid SubscriberId,
    string Email,
    string? FirstName,
    string ConfirmationToken,
    DateTime OccurredAt);
```

---

## 8. MassTransit Consumers

### 8.1 Analytics Service Consumers

| Consumer | Listens To | Behavior |
|----------|-----------|----------|
| `SubscriptionRequestedAnalyticsConsumer` | `SubscriptionRequestedEvent` | Records a `signup_confirmed_backend` event to correlate frontend signup attempts with backend-confirmed subscriptions. Links the subscriber to the most recent session that sent a `signup_success` event. |

### 8.2 Notification Service Consumers (New)

| Consumer | Listens To | Behavior |
|----------|-----------|----------|
| `AnalyticsMilestoneNotificationConsumer` | `AnalyticsMilestoneReachedEvent` | Logs the milestone in `NotificationLog` with `Type = AnalyticsMilestone`. Future: sends admin notification (email or push). |

### Required Enum Updates

Add to `NotificationType` in the Notification service:
```csharp
AnalyticsMilestone
```

---

## 9. Repository Interfaces

```csharp
public interface IAnalyticsEventRepository
{
    Task AddAsync(AnalyticsEvent analyticsEvent, CancellationToken ct = default);
    Task<(IReadOnlyList<AnalyticsEvent> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize, string? eventType, CancellationToken ct = default);
    Task<int> GetCountAsync(string eventType, DateTime from, DateTime to, CancellationToken ct = default);
    Task<int> GetUniqueSessionCountAsync(
        string eventType, DateTime from, DateTime to, CancellationToken ct = default);
    Task<IReadOnlyList<(string Referrer, int Count)>> GetTopReferrersAsync(
        DateTime from, DateTime to, int limit, CancellationToken ct = default);
    Task<IReadOnlyList<(string Referrer, int SignupCount)>> GetReferrerSignupsAsync(
        DateTime from, DateTime to, int limit, CancellationToken ct = default);
}

public interface IDailyAggregateRepository
{
    Task<IReadOnlyList<DailyAggregate>> GetByDateRangeAsync(
        DateOnly from, DateOnly to, CancellationToken ct = default);
    Task UpsertAsync(DailyAggregate aggregate, CancellationToken ct = default);
    Task UpsertBatchAsync(IReadOnlyList<DailyAggregate> aggregates, CancellationToken ct = default);
}
```

---

## 10. Service Layer

```csharp
public interface IAnalyticsService
{
    Task RecordEventAsync(RecordEventDto request, string? ipAddress, CancellationToken ct = default);
    Task<DailyStatsDto> GetDailyStatsAsync(DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<FunnelStatsDto> GetFunnelStatsAsync(DateOnly from, DateOnly to, CancellationToken ct = default);
    Task<ReferrerStatsDto> GetReferrerStatsAsync(
        DateOnly from, DateOnly to, int limit, CancellationToken ct = default);
    Task<PagedResultDto<AnalyticsEventDto>> GetEventsAsync(
        int page, int pageSize, string? eventType, CancellationToken ct = default);
}

public interface IAggregationService
{
    Task AggregateAsync(DateOnly date, CancellationToken ct = default);
}
```

---

## 11. Data Transfer Objects

### Public DTOs

```csharp
public sealed record RecordEventDto(
    string EventType,
    string SessionId,
    string? Referrer,
    string? UserAgent,
    Dictionary<string, string>? Metadata);

public sealed record RecordEventResponseDto(string Message);
```

### Admin DTOs

```csharp
public sealed record DailyStatsDto(
    IReadOnlyList<DayStatsDto> Days,
    TotalStatsDto Totals);

public sealed record DayStatsDto(
    DateOnly Date,
    int PageViews,
    int UniqueVisitors,
    int SignupAttempts,
    int SignupSuccesses,
    int SignupErrors,
    int SocialClicks,
    double ConversionRate);

public sealed record TotalStatsDto(
    int PageViews,
    int UniqueVisitors,
    int SignupAttempts,
    int SignupSuccesses,
    double ConversionRate);

public sealed record FunnelStatsDto(
    IReadOnlyList<FunnelStepDto> Steps,
    double OverallConversionRate);

public sealed record FunnelStepDto(
    string Name,
    int Count,
    double Percentage);

public sealed record ReferrerStatsDto(
    IReadOnlyList<ReferrerDto> Referrers);

public sealed record ReferrerDto(
    string Source,
    int Visits,
    int Signups,
    double ConversionRate);

public sealed record AnalyticsEventDto(
    Guid Id,
    string EventType,
    string SessionId,
    string? Referrer,
    Dictionary<string, string>? Metadata,
    DateTime CreatedAt);

public sealed record PagedResultDto<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize);
```

---

## 12. Background Aggregation

A `BackgroundService` runs daily to compute aggregate statistics from raw events into the `DailyAggregates` table. This pre-computation enables fast admin dashboard queries without scanning the full events table.

```csharp
public sealed class DailyAggregationService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Aggregate yesterday's data (or any day that hasn't been aggregated yet)
            // For each EventType, compute Count and UniqueSessionCount
            // Upsert into DailyAggregates table
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}
```

The aggregation runs hourly so that admin stats for the current day are reasonably up-to-date. Each run is idempotent — re-aggregating the same date simply overwrites with current values.

### Milestone Detection

During aggregation, the service checks for notable milestones and publishes `AnalyticsMilestoneReachedEvent`:

| Milestone | Trigger |
|-----------|---------|
| Subscriber count | 50, 100, 250, 500, 1000 total `signup_success` events |
| Page views | 1000, 5000, 10000 total `page_view` events |

---

## 13. Integration Points

### 13.1 API Gateway

Add routes and clusters to `src/Gateway/OriginHairCollective.ApiGateway/appsettings.json`:

```json
{
  "analytics-route": {
    "ClusterId": "analytics-cluster",
    "Match": {
      "Path": "/api/analytics/{**catch-all}"
    },
    "Transforms": [
      { "PathRemovePrefix": "/api/analytics" }
    ]
  }
}
```

```json
{
  "analytics-cluster": {
    "Destinations": {
      "analytics-api": {
        "Address": "http://analytics-api"
      }
    }
  }
}
```

**Note:** The Newsletter service route already exists in the gateway configuration. No changes needed for newsletter routing.

### 13.2 CORS Configuration

The coming-soon app may be deployed on a different subdomain (e.g., `originhair.com`) than the API gateway (e.g., `api.originhair.com`). Add CORS to the API Gateway:

```csharp
// In API Gateway Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("ComingSoon", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? ["http://localhost:4200"])
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// ...

app.UseCors("ComingSoon");
```

Gateway `appsettings.json` addition:
```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:4200",
      "https://originhair.com",
      "https://www.originhair.com"
    ]
  }
}
```

### 13.3 Aspire AppHost

Add the Analytics service to `src/Aspire/OriginHairCollective.AppHost/Program.cs`:

```csharp
var analyticsApi = builder.AddProject<Projects.OriginHairCollective_Analytics_Api>("analytics-api")
    .WithReference(messaging);

var apiGateway = builder.AddProject<Projects.OriginHairCollective_ApiGateway>("api-gateway")
    .WithReference(catalogApi)
    .WithReference(inquiryApi)
    .WithReference(orderApi)
    .WithReference(paymentApi)
    .WithReference(contentApi)
    .WithReference(notificationApi)
    .WithReference(identityApi)
    .WithReference(chatApi)
    .WithReference(newsletterApi)
    .WithReference(analyticsApi);     // Add analytics-api reference
```

---

## 14. Analytics API Configuration

### `appsettings.json`

```json
{
  "ConnectionStrings": {
    "AnalyticsDb": "Data Source=analytics.db"
  },
  "Analytics": {
    "AggregationIntervalHours": 1,
    "EventRetentionDays": 365,
    "RateLimitPerMinute": 60
  },
  "Jwt": {
    "Key": "configured-via-secrets",
    "Issuer": "OriginHairCollective.Identity",
    "Audience": "OriginHairCollective"
  }
}
```

### `Program.cs`

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Database
builder.Services.AddDbContext<AnalyticsDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("AnalyticsDb")
        ?? "Data Source=analytics.db"));

// Repositories
builder.Services.AddScoped<IAnalyticsEventRepository, AnalyticsEventRepository>();
builder.Services.AddScoped<IDailyAggregateRepository, DailyAggregateRepository>();

// Services
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IAggregationService, AggregationService>();

// Background Services
builder.Services.AddHostedService<DailyAggregationService>();

// MassTransit
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<SubscriptionRequestedAnalyticsConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        var connectionString = builder.Configuration.GetConnectionString("messaging");
        if (!string.IsNullOrEmpty(connectionString))
            cfg.Host(connectionString);
        cfg.ConfigureEndpoints(context);
    });
});

// Auth (for admin endpoints)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]
                    ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLong!"))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();

// Ensure DB created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AnalyticsDbContext>();
    await db.Database.EnsureCreatedAsync();
}

app.MapDefaultEndpoints();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

---

## 15. Security Considerations

### 15.1 Authentication and Authorization

| Endpoint Group | Auth Required | Role Required |
|----------------|---------------|---------------|
| `POST /events` | No | — |
| `GET /admin/*` | Yes (JWT) | Admin |

### 15.2 Privacy

- **IP addresses** are never stored in raw form. Only a SHA256 hash is persisted for unique visitor counting.
- **Email addresses** are never sent to the Analytics service. The frontend only sends the email domain (e.g., `gmail.com`) as metadata for aggregate insight.
- **User agent strings** are stored for device/browser analytics but are not used for fingerprinting.
- **Session IDs** are anonymous UUIDs with no link to personal identity.

### 15.3 Rate Limiting

- `POST /events` — 60 requests per minute per IP to prevent abuse and bot traffic inflation.
- Admin endpoints are protected by authentication; standard rate limiting is sufficient.

### 15.4 Input Validation

- `eventType` validated against an allowlist of known event types (`page_view`, `signup_attempt`, `signup_success`, `signup_error`, `social_click`).
- `sessionId` validated as UUID format.
- `metadata` values limited to 500 characters each, max 10 key-value pairs.
- `referrer` URL validated and truncated to 2000 characters.

---

## 16. Testing Strategy

### 16.1 Angular Unit Tests (Vitest)

| Test Suite | Scenarios |
|-----------|-----------|
| `NewsletterService` | Successful subscribe call, 400 error handling, 429 rate limit handling, network error handling |
| `AnalyticsService` | Session ID creation and persistence, event tracking calls, silent error handling |
| `App` component | Submit state transitions (idle → loading → success), error state display, loading state prevents double-submit |

### 16.2 Angular E2E Tests (Playwright)

| Scenario | Expected Behavior |
|----------|-------------------|
| Submit valid email | Shows loading state, displays success message |
| Submit already subscribed email | Shows appropriate message ("already subscribed") |
| Submit invalid email | Shows error message |
| Network failure | Shows connection error message |
| Double-click prevention | Only one request sent while loading |
| Page load | Analytics page_view event fired |

### 16.3 Backend Unit Tests

| Test Suite | Scenarios |
|-----------|-----------|
| `AnalyticsService` | Event recording with IP hash, daily stats computation, funnel calculation, referrer aggregation |
| `AggregationService` | Daily rollup correctness, idempotent re-aggregation, milestone detection |
| `SubscriptionRequestedAnalyticsConsumer` | Event correlation with existing session |

### 16.4 Backend Integration Tests

| Test Suite | Scenarios |
|-----------|-----------|
| Repository tests | CRUD against SQLite test database, paged queries, date range filtering |
| API endpoint tests | `WebApplicationFactory<Program>` for full HTTP pipeline including rate limiting and validation |
| MassTransit tests | Consumer behavior via MassTransit test harness |

### Key Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Record valid event | Persists event with hashed IP, returns 202 |
| Record event with invalid type | Returns 400 |
| Record event exceeding rate limit | Returns 429 |
| Get daily stats for date range | Returns correct aggregated counts |
| Get funnel stats | Correct step percentages and conversion rate |
| Get referrer stats | Grouped by domain, sorted by visit count |
| Admin endpoint without auth | Returns 401 |
| Daily aggregation runs | Creates/updates DailyAggregate records |
| Milestone reached | Publishes `AnalyticsMilestoneReachedEvent` |

---

## 17. Observability

The Analytics service integrates with the existing OpenTelemetry infrastructure from `ServiceDefaults`.

### Metrics

- `analytics.events.recorded` — Counter of events recorded (tagged by `eventType`).
- `analytics.events.rate_limited` — Counter of rate-limited requests.
- `analytics.aggregation.duration` — Histogram of daily aggregation processing time.
- `analytics.unique_sessions.daily` — Gauge of unique sessions for the current day.

### Tracing

- Distributed traces for event recording (HTTP → Service → Repository).
- Distributed traces for aggregation background service runs.

### Health Checks

Standard health check endpoints from `ServiceDefaults`:
- `GET /health` — Includes database connectivity check.
- `GET /alive` — Liveness probe.

---

## 18. Dependencies

### New NuGet Packages

No new packages required beyond what is already in `Directory.Packages.props`:

| Dependency | Already Available | Purpose |
|------------|-------------------|---------|
| `Microsoft.EntityFrameworkCore.Sqlite` | Yes (9.0.0) | Database |
| `MassTransit` | Yes (8.3.1) | Event bus |
| `MassTransit.RabbitMQ` | Yes (8.3.1) | RabbitMQ transport |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | Yes (9.0.0) | Admin auth |

### Frontend npm Packages

No new npm packages required. The Angular app uses built-in `HttpClient` from `@angular/common/http`.

### Cross-Service Changes

| Service | Change | Impact |
|---------|--------|--------|
| **Shared.Contracts** | Add `AnalyticsMilestoneReachedEvent` record | Low — additive only |
| **Notification** | Add `AnalyticsMilestone` enum value, add 1 new consumer | Low — additive only |
| **API Gateway** | Add analytics route/cluster, add CORS configuration | Low — configuration only |
| **Aspire AppHost** | Add analytics project reference | Low — one line |

---

## 19. Implementation Phases

### Phase 1: Angular Frontend Integration

- Add `provideHttpClient()` to app config.
- Create environment files with `apiBaseUrl`.
- Implement `NewsletterService` with error handling.
- Update `App` component with signals for submit state and feedback messages.
- Update template with loading/success/error feedback UI.
- Update styles with feedback styling.
- **Result:** Email signup form is connected to the existing Newsletter API.

### Phase 2: Analytics Microservice Scaffold

- Create Analytics microservice with all four clean architecture layers.
- Implement `AnalyticsEvent` entity, `AnalyticsDbContext`, and `AnalyticsEventRepository`.
- Build public `POST /events` endpoint with rate limiting and input validation.
- Register in Aspire AppHost and API Gateway.
- **Result:** Backend can receive and persist analytics events.

### Phase 3: Angular Analytics Integration

- Implement `AnalyticsService` in the coming-soon app.
- Wire up page view tracking on app initialization.
- Wire up signup funnel events (attempt, success, error).
- Wire up social link click tracking.
- **Result:** Coming-soon page sends analytics events to the backend.

### Phase 4: Analytics Admin Endpoints

- Implement `DailyAggregate` entity and repository.
- Build `DailyAggregationService` background service.
- Implement admin endpoints (daily stats, funnel stats, referrer stats).
- Add JWT authentication to admin endpoints.
- **Result:** Admins can query pre-launch analytics via API.

### Phase 5: Event Integration

- Add `AnalyticsMilestoneReachedEvent` to Shared.Contracts.
- Implement `SubscriptionRequestedAnalyticsConsumer` to correlate newsletter signups.
- Implement milestone detection in the aggregation service.
- Add `AnalyticsMilestoneNotificationConsumer` to the Notification service.
- **Result:** Cross-service event correlation and admin milestone notifications.

### Phase 6: CORS and Deployment Configuration

- Configure CORS on the API Gateway for production domains.
- Set up production environment files for the Angular app.
- Configure angular.json `fileReplacements` for environment swapping.
- Test end-to-end with production-like configuration.
- **Result:** System is deployable with proper cross-origin support.

---

## 20. Summary

This design adds two categories of changes to support the coming-soon page:

**Angular Frontend (2 new services, component updates):**
- `NewsletterService` connects the email signup form to the existing Newsletter API.
- `AnalyticsService` tracks visitor behavior for pre-launch business intelligence.
- `App` component updated with reactive submit states and user feedback UI.

**Backend (1 new microservice, gateway config):**
- **Analytics Service** — New lightweight microservice following existing patterns (clean architecture, SQLite, MassTransit, JWT admin auth).
- **API Gateway** — CORS configuration and analytics route addition.
- **Aspire AppHost** — Analytics service orchestration.

The design keeps the coming-soon app lightweight (no new npm dependencies, minimal Angular services) while providing the business with actionable pre-launch data through the analytics service.
