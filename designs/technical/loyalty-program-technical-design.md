# Loyalty Service — Technical Design

## 1. Overview

This document describes the technical design for adding a customer loyalty program ("Crown Rewards") to the Origin Hair Collective platform. The feature enables customers to earn points on purchases and engagement activities, progress through tiered membership levels, redeem points for discounts and rewards, and refer friends for mutual benefits.

The design follows the existing microservices architecture, event-driven patterns, and layered project conventions already established in the codebase.

---

## 2. Goals and Non-Goals

### Goals

- Award points to customers on completed purchases, with tier-based multipliers.
- Track customer tier status (Starter, Luxe, Elite, Icon) based on rolling annual spend.
- Allow customers to redeem points for discounts at checkout.
- Support engagement-based point earning (account creation, reviews, referrals, newsletter subscription).
- Provide admin endpoints to manage bonus point events, manually adjust points, and view program analytics.
- Integrate with existing services via MassTransit events — react to order completion, payment, refund, registration, and newsletter subscription events.
- Expose a referral system with unique codes, fraud detection, and conversion tracking.
- Track points lifecycle: pending → active → redeemed/expired.
- Send points expiration warnings and tier change notifications via the Notification and Newsletter services.

### Non-Goals

- Physical loyalty cards or POS integration (online-only program).
- Gamification features such as badges, challenges, or leaderboards (future enhancement).
- Multi-currency points or cross-brand coalition programs.
- Gift card or store credit system (distinct from loyalty points).
- A/B testing of point values or tier thresholds (future enhancement).

---

## 3. Architecture Overview

The loyalty capability is implemented as a new **Loyalty microservice** (`Loyalty`) following the same four-layer structure used by the existing services:

```
src/Services/Loyalty/
├── OriginHairCollective.Loyalty.Core           # Domain entities, enums, interfaces
├── OriginHairCollective.Loyalty.Infrastructure  # EF Core DbContext, repositories
├── OriginHairCollective.Loyalty.Application     # DTOs, services, MassTransit consumers
└── OriginHairCollective.Loyalty.Api             # ASP.NET controllers, Program.cs
```

### Service Interaction Diagram

```
┌──────────────┐     ┌───────────────┐     ┌───────────────────┐
│   Angular    │────▶│  API Gateway  │────▶│   Loyalty API      │
│   Frontend   │     │   (YARP)      │     │  /api/loyalty       │
└──────────────┘     └───────────────┘     └────────┬──────────┘
                                                     │
                          ┌──────────────────────────┤
                          │                          │
                          ▼                          ▼
                   ┌─────────────┐          ┌──────────────────┐
                   │  RabbitMQ   │          │   Loyalty DB     │
                   │ (MassTransit)│          │   (SQLite)       │
                   └──────┬──────┘          └──────────────────┘
                          │
           ┌──────────────┼──────────────┬──────────────┐
           ▼              ▼              ▼              ▼
    ┌────────────┐ ┌───────────┐ ┌────────────┐ ┌────────────────┐
    │  Identity  │ │  Order    │ │  Payment   │ │  Newsletter    │
    │  Service   │ │  Service  │ │  Service   │ │  Service       │
    └────────────┘ └───────────┘ └────────────┘ └────────────────┘
```

**Key relationships:**

- **Order Service** publishes `OrderCreatedEvent` — Loyalty service creates pending points for the order.
- **Order Service** publishes `OrderStatusChangedEvent` — Loyalty service activates pending points when order is delivered, or voids them on cancellation.
- **Payment Service** publishes `PaymentCompletedEvent` — Loyalty service validates the order amount for points calculation.
- **Payment Service** publishes `RefundIssuedEvent` — Loyalty service deducts points proportional to refund amount.
- **Identity Service** publishes `UserRegisteredEvent` — Loyalty service creates a loyalty account and awards sign-up bonus points.
- **Newsletter Service** publishes `SubscriberConfirmedEvent` — Loyalty service awards newsletter subscription points.
- **Loyalty Service** publishes `PointsEarnedEvent`, `PointsRedeemedEvent`, `TierChangedEvent`, `PointsExpiringEvent` — consumed by Notification and Newsletter services.

---

## 4. Domain Model

### 4.1 Entities

#### LoyaltyAccount

The central entity representing a customer's loyalty membership.

```csharp
public sealed class LoyaltyAccount
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public LoyaltyTier CurrentTier { get; set; }
    public int LifetimePointsEarned { get; set; }
    public int LifetimePointsRedeemed { get; set; }
    public decimal AnnualSpend { get; set; }
    public DateTime AnnualSpendResetDate { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public DateTime EnrolledAt { get; set; }
    public DateTime? LastActivityAt { get; set; }
    public bool IsActive { get; set; }
    public List<PointTransaction> PointTransactions { get; set; } = [];
    public List<Referral> Referrals { get; set; } = [];
    public string ReferralCode { get; set; }
}
```

**Computed properties:**

- `AvailablePoints` — sum of all active, non-expired, non-redeemed point transactions.
- `PendingPoints` — sum of all pending (not yet activated) point transactions.

#### PointTransaction

An immutable ledger entry for every points event (earn, redeem, expire, adjust).

```csharp
public sealed class PointTransaction
{
    public Guid Id { get; set; }
    public Guid LoyaltyAccountId { get; set; }
    public TransactionType Type { get; set; }
    public PointSource Source { get; set; }
    public int Points { get; set; }
    public PointStatus Status { get; set; }
    public string? Description { get; set; }
    public Guid? RelatedOrderId { get; set; }
    public Guid? RelatedReferralId { get; set; }
    public Guid? BonusEventId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ActivatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public LoyaltyAccount? LoyaltyAccount { get; set; }
}
```

#### Referral

Tracks a referral relationship between two customers.

```csharp
public sealed class Referral
{
    public Guid Id { get; set; }
    public Guid ReferrerAccountId { get; set; }
    public required string ReferralCode { get; set; }
    public required string ReferredEmail { get; set; }
    public Guid? ReferredAccountId { get; set; }
    public ReferralStatus Status { get; set; }
    public Guid? QualifyingOrderId { get; set; }
    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public LoyaltyAccount? ReferrerAccount { get; set; }
}
```

#### BonusEvent

Admin-created promotional events that modify points earning for a time period.

```csharp
public sealed class BonusEvent
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public BonusEventType EventType { get; set; }
    public decimal Multiplier { get; set; }
    public int? FlatBonus { get; set; }
    public Guid? TargetProductId { get; set; }
    public string? TargetCategory { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

#### TierHistory

Audit log for tier changes.

```csharp
public sealed class TierHistory
{
    public Guid Id { get; set; }
    public Guid LoyaltyAccountId { get; set; }
    public LoyaltyTier PreviousTier { get; set; }
    public LoyaltyTier NewTier { get; set; }
    public TierChangeReason Reason { get; set; }
    public decimal AnnualSpendAtChange { get; set; }
    public DateTime ChangedAt { get; set; }
    public LoyaltyAccount? LoyaltyAccount { get; set; }
}
```

### 4.2 Enums

```csharp
public enum LoyaltyTier
{
    Starter = 0,
    Luxe = 1,
    Elite = 2,
    Icon = 3
}

public enum TransactionType
{
    Earn = 0,
    Redeem = 1,
    Expire = 2,
    Adjust = 3,      // Manual admin adjustment
    Deduct = 4        // Refund-related deduction
}

public enum PointSource
{
    Purchase = 0,
    SignUp = 1,
    ProfileCompletion = 2,
    ProductReview = 3,
    SocialShare = 4,
    NewsletterSubscription = 5,
    Referral = 6,
    Birthday = 7,
    Anniversary = 8,
    BonusEvent = 9,
    AdminAdjustment = 10,
    Backfill = 11
}

public enum PointStatus
{
    Pending = 0,      // Awaiting order delivery
    Active = 1,       // Available for redemption
    Redeemed = 2,     // Used in a redemption
    Expired = 3,      // Past expiration date
    Voided = 4        // Cancelled order or fraud
}

public enum ReferralStatus
{
    Pending = 0,      // Link used, no qualifying purchase yet
    Completed = 1,    // Referred customer made qualifying purchase
    Expired = 2,      // No purchase within 30 days
    Flagged = 3       // Suspected fraud, under review
}

public enum BonusEventType
{
    GlobalMultiplier = 0,     // Applies to all purchases
    CategoryMultiplier = 1,   // Applies to specific product category
    ProductMultiplier = 2,    // Applies to specific product
    FlatBonus = 3             // Flat bonus points per qualifying order
}

public enum TierChangeReason
{
    SpendThresholdReached = 0,
    AnnualReset = 1,
    AdminAdjustment = 2,
    AccountCreation = 3
}
```

### 4.3 Interfaces

```csharp
public interface ILoyaltyAccountRepository
{
    Task<LoyaltyAccount?> GetByIdAsync(Guid id);
    Task<LoyaltyAccount?> GetByUserIdAsync(Guid userId);
    Task<LoyaltyAccount?> GetByEmailAsync(string email);
    Task<LoyaltyAccount?> GetByReferralCodeAsync(string referralCode);
    Task<List<LoyaltyAccount>> GetByTierAsync(LoyaltyTier tier);
    Task<List<LoyaltyAccount>> GetAllAsync(int page, int pageSize);
    Task AddAsync(LoyaltyAccount account);
    Task UpdateAsync(LoyaltyAccount account);
}

public interface IPointTransactionRepository
{
    Task<PointTransaction?> GetByIdAsync(Guid id);
    Task<List<PointTransaction>> GetByAccountIdAsync(Guid accountId, int page, int pageSize);
    Task<List<PointTransaction>> GetPendingByOrderIdAsync(Guid orderId);
    Task<List<PointTransaction>> GetExpiringBeforeAsync(DateTime date);
    Task<int> GetAvailablePointsAsync(Guid accountId);
    Task<int> GetPendingPointsAsync(Guid accountId);
    Task AddAsync(PointTransaction transaction);
    Task UpdateAsync(PointTransaction transaction);
    Task UpdateRangeAsync(List<PointTransaction> transactions);
}

public interface IReferralRepository
{
    Task<Referral?> GetByIdAsync(Guid id);
    Task<Referral?> GetByCodeAndEmailAsync(string code, string email);
    Task<List<Referral>> GetByReferrerIdAsync(Guid referrerAccountId);
    Task<int> GetCompletedCountByReferrerIdAsync(Guid referrerAccountId);
    Task AddAsync(Referral referral);
    Task UpdateAsync(Referral referral);
}

public interface IBonusEventRepository
{
    Task<BonusEvent?> GetByIdAsync(Guid id);
    Task<List<BonusEvent>> GetActiveEventsAsync(DateTime asOf);
    Task<List<BonusEvent>> GetAllAsync(int page, int pageSize);
    Task AddAsync(BonusEvent bonusEvent);
    Task UpdateAsync(BonusEvent bonusEvent);
    Task DeleteAsync(Guid id);
}

public interface ITierHistoryRepository
{
    Task<List<TierHistory>> GetByAccountIdAsync(Guid accountId);
    Task AddAsync(TierHistory tierHistory);
}
```

---

## 5. Application Layer

### 5.1 DTOs

```
Dtos/
├── LoyaltyAccountDto.cs
├── LoyaltyAccountSummaryDto.cs
├── PointTransactionDto.cs
├── PointBalanceDto.cs
├── RedeemPointsDto.cs
├── RedemptionResultDto.cs
├── ReferralDto.cs
├── ReferralStatsDto.cs
├── CreateReferralDto.cs
├── BonusEventDto.cs
├── CreateBonusEventDto.cs
├── UpdateBonusEventDto.cs
├── TierHistoryDto.cs
├── TierProgressDto.cs
├── AdminPointAdjustmentDto.cs
├── LoyaltyProgramStatsDto.cs
└── PointsExpirationForecastDto.cs
```

#### Key DTO Definitions

```csharp
public record LoyaltyAccountDto(
    Guid Id,
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    LoyaltyTier CurrentTier,
    int AvailablePoints,
    int PendingPoints,
    int LifetimePointsEarned,
    int LifetimePointsRedeemed,
    decimal AnnualSpend,
    string ReferralCode,
    DateTime EnrolledAt,
    DateTime? LastActivityAt
);

public record TierProgressDto(
    LoyaltyTier CurrentTier,
    LoyaltyTier? NextTier,
    decimal CurrentAnnualSpend,
    decimal? NextTierThreshold,
    decimal? SpendToNextTier,
    decimal ProgressPercentage,
    int DaysUntilReset
);

public record PointBalanceDto(
    int Available,
    int Pending,
    int ExpiringWithin30Days,
    decimal RedemptionValue       // Available points ÷ 100
);

public record RedeemPointsDto(
    int PointsToRedeem,
    Guid OrderId
);

public record RedemptionResultDto(
    bool Success,
    int PointsRedeemed,
    decimal DiscountAmount,
    int RemainingBalance,
    string? ErrorMessage
);

public record LoyaltyProgramStatsDto(
    int TotalMembers,
    int ActiveMembers,
    Dictionary<LoyaltyTier, int> MembersByTier,
    long TotalPointsOutstanding,
    decimal PointsLiabilityValue,
    decimal RedemptionRate,
    int TotalReferrals,
    int CompletedReferrals
);
```

### 5.2 Services

```
Services/
├── ILoyaltyService.cs
├── LoyaltyService.cs
├── IPointsService.cs
├── PointsService.cs
├── ITierService.cs
├── TierService.cs
├── IReferralService.cs
├── ReferralService.cs
├── IBonusEventService.cs
├── BonusEventService.cs
└── IPointsExpirationService.cs
    PointsExpirationService.cs
```

#### ILoyaltyService

Top-level orchestrator for loyalty operations.

```csharp
public interface ILoyaltyService
{
    Task<LoyaltyAccountDto> EnrollAsync(Guid userId, string email, string firstName, string lastName);
    Task<LoyaltyAccountDto?> GetAccountAsync(Guid userId);
    Task<LoyaltyAccountDto?> GetAccountByEmailAsync(string email);
    Task<TierProgressDto> GetTierProgressAsync(Guid userId);
    Task<PointBalanceDto> GetPointBalanceAsync(Guid userId);
    Task SetDateOfBirthAsync(Guid userId, DateTime dateOfBirth);
}
```

#### IPointsService

Handles all points earning, redemption, and deduction logic.

```csharp
public interface IPointsService
{
    Task<PointTransactionDto> EarnPurchasePointsAsync(Guid userId, Guid orderId, decimal orderSubtotal);
    Task<PointTransactionDto> EarnEngagementPointsAsync(Guid userId, PointSource source);
    Task ActivatePendingPointsAsync(Guid orderId);
    Task VoidPendingPointsAsync(Guid orderId);
    Task<RedemptionResultDto> RedeemAsync(Guid userId, RedeemPointsDto dto);
    Task DeductForRefundAsync(Guid userId, Guid orderId, decimal refundAmount, decimal originalAmount);
    Task RestoreRedeemedPointsAsync(Guid orderId);
    Task<List<PointTransactionDto>> GetTransactionHistoryAsync(Guid userId, int page, int pageSize);
}
```

#### ITierService

Manages tier evaluation, upgrades, and annual resets.

```csharp
public interface ITierService
{
    LoyaltyTier EvaluateTier(decimal annualSpend);
    decimal GetMultiplier(LoyaltyTier tier);
    int GetExpirationMonths(LoyaltyTier tier);
    int GetBirthdayBonus(LoyaltyTier tier);
    int GetReferralBonus(LoyaltyTier tier);
    decimal GetFreeShippingThreshold(LoyaltyTier tier);
    Task ProcessTierChangeAsync(LoyaltyAccount account, decimal newAnnualSpend);
    Task ProcessAnnualResetsAsync();
}
```

### 5.3 Tier Configuration

Tier rules are defined as constants for easy adjustment without code changes.

```csharp
public static class TierConfiguration
{
    public static readonly Dictionary<LoyaltyTier, TierDefinition> Tiers = new()
    {
        [LoyaltyTier.Starter] = new(
            SpendThreshold: 0m,
            PointsMultiplier: 1.0m,
            ExpirationMonths: 12,
            BirthdayBonus: 50,
            ReferralBonus: 100,
            FreeShippingThreshold: decimal.MaxValue   // No free shipping
        ),
        [LoyaltyTier.Luxe] = new(
            SpendThreshold: 250m,
            PointsMultiplier: 1.5m,
            ExpirationMonths: 15,
            BirthdayBonus: 75,
            ReferralBonus: 125,
            FreeShippingThreshold: 100m
        ),
        [LoyaltyTier.Elite] = new(
            SpendThreshold: 600m,
            PointsMultiplier: 2.0m,
            ExpirationMonths: 18,
            BirthdayBonus: 100,
            ReferralBonus: 150,
            FreeShippingThreshold: 75m
        ),
        [LoyaltyTier.Icon] = new(
            SpendThreshold: 1200m,
            PointsMultiplier: 3.0m,
            ExpirationMonths: 24,
            BirthdayBonus: 200,
            ReferralBonus: 200,
            FreeShippingThreshold: 0m               // Always free
        )
    };

    public const int PointsPerDollarRedemption = 100;  // 100 points = $1
    public const int SignUpBonus = 50;
    public const int ProfileCompletionBonus = 25;
    public const int ProductReviewBonus = 15;
    public const int SocialShareBonus = 10;
    public const int NewsletterBonus = 10;
    public const int AnniversaryBonus = 25;
    public const int MaxReviewsPerMonth = 5;
    public const int MaxSharesPerMonth = 3;
    public const decimal MaxRedemptionPercentage = 0.50m;  // 50% of order
    public const decimal MinReferralOrderAmount = 50m;
}

public record TierDefinition(
    decimal SpendThreshold,
    decimal PointsMultiplier,
    int ExpirationMonths,
    int BirthdayBonus,
    int ReferralBonus,
    decimal FreeShippingThreshold
);
```

### 5.4 MassTransit Consumers

```
Consumers/
├── UserRegisteredConsumer.cs
├── OrderCreatedConsumer.cs
├── OrderStatusChangedConsumer.cs
├── PaymentCompletedConsumer.cs
├── RefundIssuedConsumer.cs
└── SubscriberConfirmedConsumer.cs
```

#### Consumer Behaviors

| Consumer | Trigger Event | Action |
|----------|--------------|--------|
| `UserRegisteredConsumer` | `UserRegisteredEvent` | Create loyalty account, award 50 sign-up points |
| `OrderCreatedConsumer` | `OrderCreatedEvent` | Calculate points with tier multiplier + bonus events, create pending point transactions |
| `OrderStatusChangedConsumer` | `OrderStatusChangedEvent` (status = Delivered) | Activate pending points, update annual spend, evaluate tier change |
| `OrderStatusChangedConsumer` | `OrderStatusChangedEvent` (status = Cancelled) | Void pending points |
| `PaymentCompletedConsumer` | `PaymentCompletedEvent` | Validate payment amount matches expected order amount for points |
| `RefundIssuedConsumer` | `RefundIssuedEvent` | Deduct points proportional to refund, restore redeemed points if applicable |
| `SubscriberConfirmedConsumer` | `SubscriberConfirmedEvent` | Award 10 newsletter subscription points (one-time) |

---

## 6. Events Published

New events published by the Loyalty service, added to `OriginHairCollective.Shared.Contracts`:

```csharp
public record PointsEarnedEvent(
    Guid LoyaltyAccountId,
    Guid UserId,
    string CustomerEmail,
    int PointsEarned,
    int NewBalance,
    PointSource Source,
    Guid? RelatedOrderId,
    DateTime OccurredAt
);

public record PointsRedeemedEvent(
    Guid LoyaltyAccountId,
    Guid UserId,
    string CustomerEmail,
    int PointsRedeemed,
    decimal DiscountAmount,
    Guid OrderId,
    int RemainingBalance,
    DateTime OccurredAt
);

public record TierChangedEvent(
    Guid LoyaltyAccountId,
    Guid UserId,
    string CustomerEmail,
    string CustomerName,
    LoyaltyTier PreviousTier,
    LoyaltyTier NewTier,
    TierChangeReason Reason,
    DateTime OccurredAt
);

public record PointsExpiringEvent(
    Guid LoyaltyAccountId,
    Guid UserId,
    string CustomerEmail,
    int PointsExpiring,
    DateTime ExpirationDate,
    int DaysUntilExpiration,
    DateTime OccurredAt
);

public record ReferralCompletedEvent(
    Guid ReferralId,
    Guid ReferrerAccountId,
    string ReferrerEmail,
    string ReferredEmail,
    int PointsAwarded,
    DateTime OccurredAt
);
```

---

## 7. API Endpoints

### 7.1 Customer Endpoints (Authenticated)

All customer endpoints require JWT authentication. The `userId` is extracted from the token claims.

```
GET    /api/loyalty/account                  → LoyaltyAccountDto
GET    /api/loyalty/balance                  → PointBalanceDto
GET    /api/loyalty/tier-progress            → TierProgressDto
GET    /api/loyalty/transactions?page&size   → PagedList<PointTransactionDto>
POST   /api/loyalty/redeem                   → RedemptionResultDto
PUT    /api/loyalty/date-of-birth            → NoContent

GET    /api/loyalty/referral                 → ReferralDto (get own code + stats)
GET    /api/loyalty/referral/stats           → ReferralStatsDto
POST   /api/loyalty/referral/validate/{code} → ReferralValidationDto (public, for checkout)
```

### 7.2 Admin Endpoints

Admin endpoints require JWT authentication with the `Admin` role.

```
GET    /api/admin/loyalty/stats                      → LoyaltyProgramStatsDto
GET    /api/admin/loyalty/accounts?page&size&tier     → PagedList<LoyaltyAccountSummaryDto>
GET    /api/admin/loyalty/accounts/{id}               → LoyaltyAccountDto
POST   /api/admin/loyalty/accounts/{id}/adjust        → PointTransactionDto
GET    /api/admin/loyalty/accounts/{id}/transactions  → PagedList<PointTransactionDto>
GET    /api/admin/loyalty/accounts/{id}/tier-history   → List<TierHistoryDto>

GET    /api/admin/loyalty/bonus-events                → List<BonusEventDto>
GET    /api/admin/loyalty/bonus-events/{id}           → BonusEventDto
POST   /api/admin/loyalty/bonus-events                → BonusEventDto
PUT    /api/admin/loyalty/bonus-events/{id}           → BonusEventDto
DELETE /api/admin/loyalty/bonus-events/{id}           → NoContent

GET    /api/admin/loyalty/referrals?status             → PagedList<ReferralDto>
PUT    /api/admin/loyalty/referrals/{id}/review        → ReferralDto

GET    /api/admin/loyalty/expiration-forecast          → PointsExpirationForecastDto
```

### 7.3 Controllers

```csharp
// Customer-facing loyalty operations
[ApiController]
[Route("api/loyalty")]
[Authorize]
public class LoyaltyController : ControllerBase
{
    // GET  /api/loyalty/account
    // GET  /api/loyalty/balance
    // GET  /api/loyalty/tier-progress
    // GET  /api/loyalty/transactions
    // POST /api/loyalty/redeem
    // PUT  /api/loyalty/date-of-birth
}

// Referral operations (partially public for code validation)
[ApiController]
[Route("api/loyalty/referral")]
public class ReferralController : ControllerBase
{
    // GET  /api/loyalty/referral           [Authorize]
    // GET  /api/loyalty/referral/stats     [Authorize]
    // POST /api/loyalty/referral/validate/{code}  [AllowAnonymous]
}

// Admin loyalty management
[ApiController]
[Route("api/admin/loyalty")]
[Authorize(Roles = "Admin")]
public class AdminLoyaltyController : ControllerBase
{
    // All admin endpoints listed above
}
```

---

## 8. Infrastructure Layer

### 8.1 Database Schema

```csharp
public class LoyaltyDbContext : DbContext
{
    public DbSet<LoyaltyAccount> LoyaltyAccounts => Set<LoyaltyAccount>();
    public DbSet<PointTransaction> PointTransactions => Set<PointTransaction>();
    public DbSet<Referral> Referrals => Set<Referral>();
    public DbSet<BonusEvent> BonusEvents => Set<BonusEvent>();
    public DbSet<TierHistory> TierHistories => Set<TierHistory>();
}
```

#### Indexes

```
LoyaltyAccount:
  - IX_LoyaltyAccount_UserId (unique)
  - IX_LoyaltyAccount_Email (unique)
  - IX_LoyaltyAccount_ReferralCode (unique)
  - IX_LoyaltyAccount_CurrentTier

PointTransaction:
  - IX_PointTransaction_LoyaltyAccountId_Status
  - IX_PointTransaction_RelatedOrderId
  - IX_PointTransaction_ExpiresAt (filtered: Status = Active)
  - IX_PointTransaction_CreatedAt

Referral:
  - IX_Referral_ReferralCode_ReferredEmail (unique)
  - IX_Referral_ReferrerAccountId
  - IX_Referral_Status

BonusEvent:
  - IX_BonusEvent_StartsAt_EndsAt (for active event queries)

TierHistory:
  - IX_TierHistory_LoyaltyAccountId_ChangedAt
```

### 8.2 Data Seeder

The `LoyaltyDbSeeder` will populate demo data for development:

- 10 sample loyalty accounts across all tiers
- 50+ point transactions showing various sources and statuses
- 5 referral records in various states
- 2 active bonus events and 1 expired event
- Tier history records showing upgrades

---

## 9. Background Jobs

### 9.1 Points Expiration Job

A hosted background service that runs daily to process point expirations.

```csharp
public class PointsExpirationBackgroundService : BackgroundService
{
    // Runs daily at 2:00 AM UTC
    // 1. Find all Active point transactions where ExpiresAt <= now
    // 2. Update status to Expired
    // 3. Update LoyaltyAccount.LifetimePointsExpired
    // 4. Publish PointsExpiringEvent for notification
}
```

### 9.2 Expiration Warning Job

A hosted background service that sends advance warnings.

```csharp
public class ExpirationWarningBackgroundService : BackgroundService
{
    // Runs daily at 9:00 AM UTC
    // 1. Find accounts with points expiring in 90, 30, or 7 days
    // 2. Publish PointsExpiringEvent for each warning threshold
    // 3. Track which warnings have been sent to avoid duplicates
}
```

### 9.3 Birthday & Anniversary Job

```csharp
public class BirthdayAnniversaryBackgroundService : BackgroundService
{
    // Runs daily at 8:00 AM UTC
    // 1. Find accounts with DateOfBirth matching today (month + day)
    // 2. Award tier-appropriate birthday bonus points
    // 3. Find accounts with EnrolledAt anniversary matching today
    // 4. Award 25 anniversary bonus points
    // 5. Publish PointsEarnedEvent for each
}
```

### 9.4 Annual Tier Reset Job

```csharp
public class AnnualTierResetBackgroundService : BackgroundService
{
    // Runs daily at 1:00 AM UTC
    // 1. Find accounts where AnnualSpendResetDate <= today
    // 2. Evaluate new tier based on past 12 months spend
    // 3. Apply graceful downgrade (max one tier down)
    // 4. Reset AnnualSpend to 0, set new AnnualSpendResetDate
    // 5. Publish TierChangedEvent if tier changed
}
```

---

## 10. Points Calculation Logic

### 10.1 Purchase Points Flow

```
OrderCreatedEvent received
    │
    ▼
Lookup LoyaltyAccount by UserId or Email
    │
    ▼
Get current tier → determine base multiplier
    │
    ▼
Check active BonusEvents
    │
    ├─ GlobalMultiplier? → multiply base multiplier
    ├─ CategoryMultiplier for matching product? → multiply for those items
    ├─ ProductMultiplier for matching product? → multiply for those items
    └─ FlatBonus? → add flat bonus to total
    │
    ▼
Calculate: points = floor(orderSubtotal × effectiveMultiplier) + flatBonuses
    │
    ▼
Create PointTransaction(Status = Pending, Source = Purchase)
    │
    ▼
── Wait for OrderStatusChangedEvent (Delivered) ──
    │
    ▼
Update PointTransaction(Status = Active)
Set ExpiresAt based on tier's ExpirationMonths
Update LoyaltyAccount.LifetimePointsEarned
Update LoyaltyAccount.AnnualSpend
Evaluate tier upgrade
Publish PointsEarnedEvent
```

### 10.2 Redemption Flow

```
POST /api/loyalty/redeem { PointsToRedeem, OrderId }
    │
    ▼
Validate: PointsToRedeem >= 100 (minimum)
Validate: PointsToRedeem <= AvailablePoints
Validate: discount <= 50% of order subtotal
    │
    ▼
Calculate: discountAmount = PointsToRedeem / 100
    │
    ▼
Select oldest Active point transactions (FIFO)
Mark them as Redeemed until PointsToRedeem is satisfied
    │
    ▼
Create PointTransaction(Type = Redeem, Points = -PointsToRedeem)
Update LoyaltyAccount.LifetimePointsRedeemed
    │
    ▼
Return RedemptionResultDto with discount amount
    │
    ▼
Publish PointsRedeemedEvent
```

### 10.3 Refund Deduction Flow

```
RefundIssuedEvent received
    │
    ▼
Lookup original order's point transactions
    │
    ▼
Calculate: pointsToDeduct = floor(originalPoints × (refundAmount / originalOrderAmount))
    │
    ▼
If points were still Active → mark as Voided
If points were already Redeemed → create Deduct transaction (negative balance)
    │
    ▼
Update LoyaltyAccount.AnnualSpend -= refundAmount
Re-evaluate tier (possible downgrade)
    │
    ▼
If order had redeemed points applied → restore those points as Active
```

---

## 11. API Gateway Integration

Add loyalty routes to the YARP reverse proxy configuration:

```json
{
  "Routes": {
    "loyalty-route": {
      "ClusterId": "loyalty-cluster",
      "Match": {
        "Path": "/api/loyalty/{**catch-all}"
      }
    },
    "admin-loyalty-route": {
      "ClusterId": "loyalty-cluster",
      "Match": {
        "Path": "/api/admin/loyalty/{**catch-all}"
      }
    }
  },
  "Clusters": {
    "loyalty-cluster": {
      "Destinations": {
        "loyalty-api": {
          "Address": "https+http://loyalty-api"
        }
      }
    }
  }
}
```

---

## 12. Aspire AppHost Integration

Register the new service in the Aspire orchestrator:

```csharp
var loyaltyApi = builder.AddProject<Projects.OriginHairCollective_Loyalty_Api>("loyalty-api")
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
    .WithReference(loyaltyApi);    // ← New
```

---

## 13. Frontend Integration

### 13.1 Angular Components (Customer Site)

```
projects/origin-hair-collective/src/app/
├── loyalty/
│   ├── loyalty-dashboard/
│   │   ├── loyalty-dashboard.component.ts
│   │   ├── loyalty-dashboard.component.html
│   │   └── loyalty-dashboard.component.scss
│   ├── tier-progress-bar/
│   │   ├── tier-progress-bar.component.ts
│   │   ├── tier-progress-bar.component.html
│   │   └── tier-progress-bar.component.scss
│   ├── points-history/
│   │   ├── points-history.component.ts
│   │   ├── points-history.component.html
│   │   └── points-history.component.scss
│   ├── referral-card/
│   │   ├── referral-card.component.ts
│   │   ├── referral-card.component.html
│   │   └── referral-card.component.scss
│   ├── rewards-catalog/
│   │   ├── rewards-catalog.component.ts
│   │   ├── rewards-catalog.component.html
│   │   └── rewards-catalog.component.scss
│   └── services/
│       └── loyalty.service.ts
```

### 13.2 Angular Components (Admin Dashboard)

```
projects/origin-hair-collective-admin/src/app/
├── loyalty/
│   ├── loyalty-overview/
│   │   └── loyalty-overview.component.ts       # Program stats dashboard
│   ├── member-list/
│   │   └── member-list.component.ts            # Paginated member table
│   ├── member-detail/
│   │   └── member-detail.component.ts          # Single member view + adjust
│   ├── bonus-events/
│   │   └── bonus-events.component.ts           # CRUD for bonus events
│   ├── referral-review/
│   │   └── referral-review.component.ts        # Flagged referral queue
│   └── services/
│       └── admin-loyalty.service.ts
```

### 13.3 Shared Components (Component Library)

```
projects/components/src/lib/
├── crown-badge/
│   └── crown-badge.component.ts               # Tier badge icon
├── points-display/
│   └── points-display.component.ts            # Compact points balance
└── tier-indicator/
    └── tier-indicator.component.ts            # Tier name + color
```

### 13.4 Checkout Integration

The checkout flow needs to integrate with loyalty:

1. **Product pages** — Show "Earn X Crown Points with this purchase" based on user's tier multiplier.
2. **Cart page** — Display total points to be earned for the cart contents.
3. **Checkout page** — Add a "Redeem Points" section where members can apply points as a discount.
4. **Referral code input** — Allow entering a referral code during checkout for new customers.
5. **Order confirmation** — Show points earned (pending) and new balance after delivery.

---

## 14. Project Structure Summary

```
src/Services/Loyalty/
├── OriginHairCollective.Loyalty.Core/
│   ├── Entities/
│   │   ├── LoyaltyAccount.cs
│   │   ├── PointTransaction.cs
│   │   ├── Referral.cs
│   │   ├── BonusEvent.cs
│   │   └── TierHistory.cs
│   ├── Enums/
│   │   ├── LoyaltyTier.cs
│   │   ├── TransactionType.cs
│   │   ├── PointSource.cs
│   │   ├── PointStatus.cs
│   │   ├── ReferralStatus.cs
│   │   ├── BonusEventType.cs
│   │   └── TierChangeReason.cs
│   └── Interfaces/
│       ├── ILoyaltyAccountRepository.cs
│       ├── IPointTransactionRepository.cs
│       ├── IReferralRepository.cs
│       ├── IBonusEventRepository.cs
│       └── ITierHistoryRepository.cs
├── OriginHairCollective.Loyalty.Infrastructure/
│   ├── Data/
│   │   ├── LoyaltyDbContext.cs
│   │   └── LoyaltyDbSeeder.cs
│   └── Repositories/
│       ├── LoyaltyAccountRepository.cs
│       ├── PointTransactionRepository.cs
│       ├── ReferralRepository.cs
│       ├── BonusEventRepository.cs
│       └── TierHistoryRepository.cs
├── OriginHairCollective.Loyalty.Application/
│   ├── Dtos/
│   │   ├── LoyaltyAccountDto.cs
│   │   ├── LoyaltyAccountSummaryDto.cs
│   │   ├── PointTransactionDto.cs
│   │   ├── PointBalanceDto.cs
│   │   ├── RedeemPointsDto.cs
│   │   ├── RedemptionResultDto.cs
│   │   ├── ReferralDto.cs
│   │   ├── ReferralStatsDto.cs
│   │   ├── CreateReferralDto.cs
│   │   ├── BonusEventDto.cs
│   │   ├── CreateBonusEventDto.cs
│   │   ├── UpdateBonusEventDto.cs
│   │   ├── TierHistoryDto.cs
│   │   ├── TierProgressDto.cs
│   │   ├── AdminPointAdjustmentDto.cs
│   │   ├── LoyaltyProgramStatsDto.cs
│   │   └── PointsExpirationForecastDto.cs
│   ├── Configuration/
│   │   └── TierConfiguration.cs
│   ├── Mapping/
│   │   └── LoyaltyMapping.cs
│   ├── Services/
│   │   ├── ILoyaltyService.cs
│   │   ├── LoyaltyService.cs
│   │   ├── IPointsService.cs
│   │   ├── PointsService.cs
│   │   ├── ITierService.cs
│   │   ├── TierService.cs
│   │   ├── IReferralService.cs
│   │   ├── ReferralService.cs
│   │   ├── IBonusEventService.cs
│   │   ├── BonusEventService.cs
│   │   ├── IPointsExpirationService.cs
│   │   └── PointsExpirationService.cs
│   ├── Consumers/
│   │   ├── UserRegisteredConsumer.cs
│   │   ├── OrderCreatedConsumer.cs
│   │   ├── OrderStatusChangedConsumer.cs
│   │   ├── PaymentCompletedConsumer.cs
│   │   ├── RefundIssuedConsumer.cs
│   │   └── SubscriberConfirmedConsumer.cs
│   └── BackgroundServices/
│       ├── PointsExpirationBackgroundService.cs
│       ├── ExpirationWarningBackgroundService.cs
│       ├── BirthdayAnniversaryBackgroundService.cs
│       └── AnnualTierResetBackgroundService.cs
└── OriginHairCollective.Loyalty.Api/
    ├── Controllers/
    │   ├── LoyaltyController.cs
    │   ├── ReferralController.cs
    │   └── AdminLoyaltyController.cs
    └── Program.cs
```

---

## 15. Testing Strategy

### 15.1 Unit Tests

- **TierService** — verify tier evaluation for all spend thresholds and edge cases.
- **PointsService** — verify multiplier calculation, bonus event stacking, FIFO redemption, refund deduction.
- **ReferralService** — verify fraud detection rules, one-time referral constraints.
- **Background jobs** — verify expiration processing, birthday/anniversary detection.

### 15.2 Integration Tests

- **Consumer tests** — verify each MassTransit consumer correctly processes events and creates expected point transactions.
- **API endpoint tests** — verify authentication, authorization, request validation, and response shapes.
- **Database tests** — verify EF Core queries, indexes, and seeder.

### 15.3 E2E Tests (Playwright)

- Customer enrollment flow.
- Points balance display after a simulated purchase.
- Tier progress bar accuracy.
- Points redemption at checkout.
- Referral code generation and sharing.
- Admin bonus event creation.
- Admin point adjustment.

---

## 16. Migration and Launch Plan

### Phase 1: Service Scaffolding

1. Create the four-layer project structure.
2. Add project references to the solution file.
3. Register in AppHost and API Gateway.
4. Implement domain entities, enums, and DbContext.
5. Run initial EF Core migration.

### Phase 2: Core Functionality

1. Implement repositories and services.
2. Implement MassTransit consumers.
3. Implement customer API endpoints.
4. Implement admin API endpoints.
5. Add background jobs.

### Phase 3: Frontend

1. Build customer loyalty dashboard.
2. Build tier progress bar and points display components.
3. Integrate points redemption into checkout flow.
4. Build referral sharing interface.
5. Build admin loyalty management pages.

### Phase 4: Launch

1. Seed demo data for testing.
2. Run full E2E test suite.
3. Backfill points for existing customers (one-time migration script).
4. Send launch announcement via Newsletter service.
5. Activate "Double Points Launch Week" bonus event.
