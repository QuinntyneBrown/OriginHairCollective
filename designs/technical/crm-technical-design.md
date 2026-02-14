# Customer Relationship Management (CRM) — Technical Design

## 1. Overview

This document describes the technical design for adding comprehensive Customer Relationship Management (CRM) capabilities to the CrownCommerce platform. The CRM feature enables the business to identify, track, and nurture relationships with different customer segments including potential wholesale customers (e.g., wig makers), individual retail customers, hair stylists, and hair salons. The system provides tools for managing interactions, scheduling follow-ups, and automating email communications.

The CRM service follows the existing microservices architecture, event-driven patterns, and layered project conventions established in the codebase, and supports multi-brand operations (Origin Hair Collective and Mane Haus).

---

## 2. Goals and Non-Goals

### Goals

- **Track multiple customer segments:**
  - Individual customers (retail buyers)
  - Leads (potential wholesale customers like wig makers)
  - Hair stylists
  - Hair salons
- **Manage customer relationships:**
  - Log all interactions (calls, emails, meetings, notes)
  - Track customer lifecycle stages (Lead → Qualified → Customer → VIP)
  - Maintain detailed contact information and preferences
- **Automate follow-ups:**
  - Schedule follow-up tasks and reminders
  - Trigger automated emails based on customer events
  - Track completed and pending follow-ups
- **Support business intelligence:**
  - Segment customers by type, status, and custom tags
  - Track relationship health and engagement metrics
  - Identify high-value customers and opportunities
- **Integrate with existing services:**
  - Auto-create customer records from orders
  - Link inquiries to CRM contacts
  - Trigger notifications for follow-ups
  - Support brand-scoped data (Origin Hair Collective vs Mane Haus)

### Non-Goals

- Full marketing automation platform (use Newsletter service for campaigns)
- Built-in email client (trigger emails via Notification service)
- Sales forecasting and pipeline analytics (future enhancement)
- Customer support ticketing system (future enhancement)
- Mobile app for field sales (future phase)
- Third-party CRM integration (Salesforce, HubSpot) in initial phase

---

## 3. Architecture Overview

The CRM capability is implemented as a new **CRM microservice** following the standard four-layer structure:

```
src/Services/Crm/
├── CrownCommerce.Crm.Core           # Domain entities, enums, interfaces
├── CrownCommerce.Crm.Infrastructure  # EF Core DbContext, repositories
├── CrownCommerce.Crm.Application     # DTOs, services, MassTransit consumers
└── CrownCommerce.Crm.Api             # ASP.NET controllers, Program.cs
```

### Service Interaction Diagram

```
┌──────────────────────────┐
│    Admin Dashboard       │
│  (Angular Frontend)      │
│  Manages all CRM data    │
└────────────┬─────────────┘
             │
    ┌────────▼─────────┐
    │   API Gateway    │
    │   (YARP)         │
    │   Routes /api/crm│
    └────────┬─────────┘
             │
    ┌────────▼─────────────────────┐
    │      CRM API                 │
    │      /api/crm                │
    │                              │
    │  • Customers                 │
    │  • Leads                     │
    │  • Hair Stylists             │
    │  • Hair Salons               │
    │  • Interactions              │
    │  • Follow-ups                │
    └───┬──────────────┬───────────┘
        │              │
 ┌──────┘              └──────┐
 ▼                            ▼
┌────────────┐        ┌──────────────┐
│  RabbitMQ  │        │   CRM DB     │
│(MassTransit)│       │  (SQLite)    │
└──────┬─────┘        │              │
       │              │  Contacts,   │
   ┌───┴────┐         │  Interactions│
   ▼        ▼         │  Follow-ups  │
┌────────┐┌────────┐  └──────────────┘
│ Order  ││Notific │
│Service ││Service │
└────────┘└────────┘
```

**Key relationships:**

- **Order Service** publishes `OrderCreatedEvent` — CRM service creates/updates customer records automatically
- **Inquiry Service** data can be linked to CRM contacts for context
- **CRM Service** publishes `FollowUpDueEvent` — Notification service sends reminder emails
- **CRM Service** publishes `CustomerInteractionLoggedEvent` — for audit and analytics
- **Identity Service** provides authentication for admin users accessing CRM data
- **Newsletter Service** can leverage CRM segments for targeted campaigns

---

## 4. Domain Model

### 4.1 Entities

#### `Contact`

The base entity for all CRM contacts. Uses table-per-hierarchy inheritance with a discriminator field.

```csharp
public abstract class Contact
{
    public Guid Id { get; set; }
    public required string ContactType { get; set; }  // Customer, Lead, HairStylist, HairSalon
    public required string Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? Notes { get; set; }
    public ContactStatus Status { get; set; }
    public Brand? Brand { get; set; }                 // For retail customers
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public ICollection<Interaction> Interactions { get; set; } = [];
    public ICollection<FollowUp> FollowUps { get; set; } = [];
    public ICollection<ContactTag> Tags { get; set; } = [];
}
```

#### `Customer`

Individual retail customers who have purchased or may purchase products.

```csharp
public sealed class Customer : Contact
{
    public Customer()
    {
        ContactType = "Customer";
    }

    public Guid? UserId { get; set; }                 // Link to Identity service user
    public DateTime? FirstPurchaseDate { get; set; }
    public DateTime? LastPurchaseDate { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public CustomerTier Tier { get; set; }            // Standard, VIP, Elite
    public string? PreferredContactMethod { get; set; } // Email, Phone, SMS
    public bool MarketingOptIn { get; set; }
}
```

#### `Lead`

Potential wholesale customers (wig makers, boutique owners, etc.) who haven't purchased yet.

```csharp
public sealed class Lead : Contact
{
    public Lead()
    {
        ContactType = "Lead";
    }

    public required string Company { get; set; }
    public string? JobTitle { get; set; }
    public LeadSource Source { get; set; }            // Website, Referral, Trade Show, Cold Outreach
    public LeadStatus LeadStatus { get; set; }        // New, Contacted, Qualified, Negotiating, Won, Lost
    public int EstimatedAnnualRevenue { get; set; }
    public string? Industry { get; set; }             // "Wig Manufacturing", "Salon Chain", etc.
    public DateTime? QualifiedDate { get; set; }
    public DateTime? ConvertedDate { get; set; }
    public Guid? ConvertedToCustomerId { get; set; }  // If lead becomes customer
}
```

#### `HairStylist`

Individual hair stylists who may purchase products or recommend them to clients.

```csharp
public sealed class HairStylist : Contact
{
    public HairStylist()
    {
        ContactType = "HairStylist";
    }

    public string? SalonAffiliation { get; set; }
    public Guid? SalonId { get; set; }                // Link to HairSalon entity
    public string? LicenseNumber { get; set; }
    public int YearsExperience { get; set; }
    public string? Specialties { get; set; }          // "Extensions, Coloring, Braiding"
    public string? InstagramHandle { get; set; }
    public string? TikTokHandle { get; set; }
    public int FollowerCount { get; set; }
    public bool InfluencerProgram { get; set; }       // Enrolled in influencer/affiliate program
}
```

#### `HairSalon`

Hair salons that may become wholesale customers or referral partners.

```csharp
public sealed class HairSalon : Contact
{
    public HairSalon()
    {
        ContactType = "HairSalon";
    }

    public required string BusinessName { get; set; }
    public string? Website { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerEmail { get; set; }
    public string? OwnerPhone { get; set; }
    public int NumberOfChairs { get; set; }
    public int NumberOfStylists { get; set; }
    public bool WholesaleAccount { get; set; }
    public DateTime? AccountCreatedDate { get; set; }
    public decimal MonthlyPurchaseVolume { get; set; }
    public ICollection<HairStylist> Stylists { get; set; } = [];
}
```

#### `Interaction`

Records all interactions with contacts (calls, emails, meetings, notes).

```csharp
public sealed class Interaction
{
    public Guid Id { get; set; }
    public Guid ContactId { get; set; }
    public Contact? Contact { get; set; }
    public InteractionType Type { get; set; }         // Call, Email, Meeting, Note, SMS
    public required string Subject { get; set; }
    public required string Description { get; set; }
    public InteractionDirection Direction { get; set; } // Inbound, Outbound
    public DateTime InteractionDate { get; set; }
    public int DurationMinutes { get; set; }
    public string? Outcome { get; set; }              // "Interested", "Not Interested", "Follow-up Required"
    public Guid? RelatedInquiryId { get; set; }       // Link to Inquiry service
    public Guid? RelatedOrderId { get; set; }         // Link to Order service
    public Guid CreatedByUserId { get; set; }         // Admin who logged the interaction
    public DateTime CreatedAt { get; set; }
}
```

#### `FollowUp`

Scheduled follow-up tasks and reminders.

```csharp
public sealed class FollowUp
{
    public Guid Id { get; set; }
    public Guid ContactId { get; set; }
    public Contact? Contact { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public FollowUpType Type { get; set; }            // Call, Email, Meeting, Task
    public DateTime DueDate { get; set; }
    public FollowUpStatus Status { get; set; }        // Pending, Completed, Cancelled, Overdue
    public FollowUpPriority Priority { get; set; }    // Low, Normal, High, Urgent
    public DateTime? CompletedDate { get; set; }
    public string? CompletionNotes { get; set; }
    public Guid AssignedToUserId { get; set; }        // Admin responsible for follow-up
    public bool EmailReminderSent { get; set; }
    public Guid? RelatedInteractionId { get; set; }   // If created from an interaction
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

#### `ContactTag`

Support for custom tagging and segmentation.

```csharp
public sealed class ContactTag
{
    public Guid Id { get; set; }
    public Guid ContactId { get; set; }
    public required string Tag { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### 4.2 Enums

```csharp
public enum ContactStatus
{
    Active,
    Inactive,
    Archived,
    Blocked
}

public enum CustomerTier
{
    Standard,
    VIP,
    Elite
}

public enum LeadSource
{
    Website,
    Referral,
    TradeShow,
    ColdOutreach,
    SocialMedia,
    Other
}

public enum LeadStatus
{
    New,
    Contacted,
    Qualified,
    Negotiating,
    Won,
    Lost
}

public enum InteractionType
{
    Call,
    Email,
    Meeting,
    Note,
    SMS,
    InPerson
}

public enum InteractionDirection
{
    Inbound,
    Outbound
}

public enum FollowUpType
{
    Call,
    Email,
    Meeting,
    Task
}

public enum FollowUpStatus
{
    Pending,
    Completed,
    Cancelled,
    Overdue
}

public enum FollowUpPriority
{
    Low,
    Normal,
    High,
    Urgent
}

public enum Brand
{
    OriginHairCollective,
    ManeHaus
}
```

---

## 5. API Design

### 5.1 Customers API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/crm/customers` | List all customers (with pagination, filtering) | Admin |
| GET | `/api/crm/customers/{id}` | Get customer details | Admin |
| POST | `/api/crm/customers` | Create new customer | Admin |
| PUT | `/api/crm/customers/{id}` | Update customer | Admin |
| DELETE | `/api/crm/customers/{id}` | Archive customer | Admin |
| GET | `/api/crm/customers/{id}/interactions` | Get customer interactions | Admin |
| GET | `/api/crm/customers/{id}/orders` | Get customer orders (via Order service) | Admin |

### 5.2 Leads API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/crm/leads` | List all leads (with filtering by status) | Admin |
| GET | `/api/crm/leads/{id}` | Get lead details | Admin |
| POST | `/api/crm/leads` | Create new lead | Admin |
| PUT | `/api/crm/leads/{id}` | Update lead | Admin |
| PUT | `/api/crm/leads/{id}/status` | Update lead status | Admin |
| POST | `/api/crm/leads/{id}/convert` | Convert lead to customer | Admin |
| DELETE | `/api/crm/leads/{id}` | Archive lead | Admin |

### 5.3 Hair Stylists API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/crm/stylists` | List all hair stylists | Admin |
| GET | `/api/crm/stylists/{id}` | Get stylist details | Admin |
| POST | `/api/crm/stylists` | Create new stylist | Admin |
| PUT | `/api/crm/stylists/{id}` | Update stylist | Admin |
| DELETE | `/api/crm/stylists/{id}` | Archive stylist | Admin |
| GET | `/api/crm/stylists/{id}/salon` | Get associated salon | Admin |

### 5.4 Hair Salons API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/crm/salons` | List all hair salons | Admin |
| GET | `/api/crm/salons/{id}` | Get salon details | Admin |
| POST | `/api/crm/salons` | Create new salon | Admin |
| PUT | `/api/crm/salons/{id}` | Update salon | Admin |
| DELETE | `/api/crm/salons/{id}` | Archive salon | Admin |
| GET | `/api/crm/salons/{id}/stylists` | Get salon's stylists | Admin |

### 5.5 Interactions API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/crm/interactions` | List all interactions (filtered by contact, date) | Admin |
| GET | `/api/crm/interactions/{id}` | Get interaction details | Admin |
| POST | `/api/crm/interactions` | Log new interaction | Admin |
| PUT | `/api/crm/interactions/{id}` | Update interaction | Admin |
| DELETE | `/api/crm/interactions/{id}` | Delete interaction | Admin |

### 5.6 Follow-ups API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/crm/followups` | List all follow-ups (filtered by status, user) | Admin |
| GET | `/api/crm/followups/due` | Get overdue and due-today follow-ups | Admin |
| GET | `/api/crm/followups/{id}` | Get follow-up details | Admin |
| POST | `/api/crm/followups` | Create new follow-up | Admin |
| PUT | `/api/crm/followups/{id}` | Update follow-up | Admin |
| PUT | `/api/crm/followups/{id}/complete` | Mark follow-up as completed | Admin |
| DELETE | `/api/crm/followups/{id}` | Cancel follow-up | Admin |

### 5.7 Tags API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/crm/tags` | List all unique tags | Admin |
| POST | `/api/crm/contacts/{id}/tags` | Add tag to contact | Admin |
| DELETE | `/api/crm/contacts/{id}/tags/{tag}` | Remove tag from contact | Admin |

---

## 6. DTOs

### 6.1 Request DTOs

```csharp
// Customers
public sealed class CreateCustomerDto
{
    public required string Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? Notes { get; set; }
    public Brand? Brand { get; set; }
    public string? PreferredContactMethod { get; set; }
    public bool MarketingOptIn { get; set; }
}

public sealed class UpdateCustomerDto : CreateCustomerDto
{
    public CustomerTier Tier { get; set; }
}

// Leads
public sealed class CreateLeadDto
{
    public required string Name { get; set; }
    public required string Company { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? JobTitle { get; set; }
    public LeadSource Source { get; set; }
    public int EstimatedAnnualRevenue { get; set; }
    public string? Industry { get; set; }
    public string? Notes { get; set; }
}

public sealed class UpdateLeadStatusDto
{
    public LeadStatus Status { get; set; }
    public string? Notes { get; set; }
}

public sealed class ConvertLeadDto
{
    public Brand Brand { get; set; }
    public string? ConversionNotes { get; set; }
}

// Hair Stylists
public sealed class CreateHairStylistDto
{
    public required string Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? SalonAffiliation { get; set; }
    public Guid? SalonId { get; set; }
    public string? LicenseNumber { get; set; }
    public int YearsExperience { get; set; }
    public string? Specialties { get; set; }
    public string? InstagramHandle { get; set; }
    public string? TikTokHandle { get; set; }
    public int FollowerCount { get; set; }
    public bool InfluencerProgram { get; set; }
    public string? Notes { get; set; }
}

// Hair Salons
public sealed class CreateHairSalonDto
{
    public required string Name { get; set; }
    public required string BusinessName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Website { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerEmail { get; set; }
    public string? OwnerPhone { get; set; }
    public int NumberOfChairs { get; set; }
    public int NumberOfStylists { get; set; }
    public bool WholesaleAccount { get; set; }
    public string? Notes { get; set; }
}

// Interactions
public sealed class CreateInteractionDto
{
    public Guid ContactId { get; set; }
    public InteractionType Type { get; set; }
    public required string Subject { get; set; }
    public required string Description { get; set; }
    public InteractionDirection Direction { get; set; }
    public DateTime InteractionDate { get; set; }
    public int DurationMinutes { get; set; }
    public string? Outcome { get; set; }
}

// Follow-ups
public sealed class CreateFollowUpDto
{
    public Guid ContactId { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public FollowUpType Type { get; set; }
    public DateTime DueDate { get; set; }
    public FollowUpPriority Priority { get; set; }
    public Guid AssignedToUserId { get; set; }
}

public sealed class CompleteFollowUpDto
{
    public required string CompletionNotes { get; set; }
}
```

### 6.2 Response DTOs

```csharp
public sealed class CustomerDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public ContactStatus Status { get; set; }
    public CustomerTier Tier { get; set; }
    public Brand? Brand { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime? FirstPurchaseDate { get; set; }
    public DateTime? LastPurchaseDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> Tags { get; set; }
}

public sealed class LeadDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Company { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public LeadSource Source { get; set; }
    public LeadStatus LeadStatus { get; set; }
    public int EstimatedAnnualRevenue { get; set; }
    public string? Industry { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? QualifiedDate { get; set; }
    public List<string> Tags { get; set; }
}

public sealed class HairStylistDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? SalonAffiliation { get; set; }
    public Guid? SalonId { get; set; }
    public int YearsExperience { get; set; }
    public string? Specialties { get; set; }
    public bool InfluencerProgram { get; set; }
    public int FollowerCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class HairSalonDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string BusinessName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public bool WholesaleAccount { get; set; }
    public int NumberOfStylists { get; set; }
    public decimal MonthlyPurchaseVolume { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class InteractionDto
{
    public Guid Id { get; set; }
    public Guid ContactId { get; set; }
    public string ContactName { get; set; }
    public InteractionType Type { get; set; }
    public string Subject { get; set; }
    public string Description { get; set; }
    public InteractionDirection Direction { get; set; }
    public DateTime InteractionDate { get; set; }
    public int DurationMinutes { get; set; }
    public string? Outcome { get; set; }
    public string CreatedByUserName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class FollowUpDto
{
    public Guid Id { get; set; }
    public Guid ContactId { get; set; }
    public string ContactName { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public FollowUpType Type { get; set; }
    public DateTime DueDate { get; set; }
    public FollowUpStatus Status { get; set; }
    public FollowUpPriority Priority { get; set; }
    public string AssignedToUserName { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

---

## 7. Event Contracts

New events published by the CRM service for cross-service integration:

```csharp
namespace CrownCommerce.Shared.Contracts;

public sealed class CustomerCreatedEvent
{
    public Guid CustomerId { get; set; }
    public string Name { get; set; }
    public string? Email { get; set; }
    public Brand? Brand { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class LeadConvertedEvent
{
    public Guid LeadId { get; set; }
    public Guid CustomerId { get; set; }
    public string CompanyName { get; set; }
    public DateTime ConvertedAt { get; set; }
}

public sealed class FollowUpDueEvent
{
    public Guid FollowUpId { get; set; }
    public Guid ContactId { get; set; }
    public string ContactName { get; set; }
    public string? ContactEmail { get; set; }
    public string FollowUpTitle { get; set; }
    public DateTime DueDate { get; set; }
    public Guid AssignedToUserId { get; set; }
}

public sealed class InteractionLoggedEvent
{
    public Guid InteractionId { get; set; }
    public Guid ContactId { get; set; }
    public InteractionType Type { get; set; }
    public string Subject { get; set; }
    public DateTime InteractionDate { get; set; }
}
```

Events consumed by the CRM service:

```csharp
// From Order service
public sealed class OrderCreatedEvent
{
    public Guid OrderId { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; }
    public string CustomerEmail { get; set; }
    public decimal TotalAmount { get; set; }
    public Brand Brand { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

---

## 8. Service Implementation

### 8.1 Repository Interfaces

```csharp
public interface IContactRepository
{
    Task<List<Contact>> GetAllAsync(CancellationToken ct);
    Task<Contact?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<Contact> AddAsync(Contact contact, CancellationToken ct);
    Task UpdateAsync(Contact contact, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
    Task<List<Contact>> SearchAsync(string query, CancellationToken ct);
    Task<List<Contact>> GetByTypeAsync(string contactType, CancellationToken ct);
}

public interface ICustomerRepository : IContactRepository
{
    Task<List<Customer>> GetByBrandAsync(Brand brand, CancellationToken ct);
    Task<List<Customer>> GetByTierAsync(CustomerTier tier, CancellationToken ct);
    Task<Customer?> GetByUserIdAsync(Guid userId, CancellationToken ct);
}

public interface ILeadRepository : IContactRepository
{
    Task<List<Lead>> GetByStatusAsync(LeadStatus status, CancellationToken ct);
    Task<List<Lead>> GetBySourceAsync(LeadSource source, CancellationToken ct);
}

public interface IHairStylistRepository : IContactRepository
{
    Task<List<HairStylist>> GetBySalonIdAsync(Guid salonId, CancellationToken ct);
    Task<List<HairStylist>> GetInfluencersAsync(CancellationToken ct);
}

public interface IHairSalonRepository : IContactRepository
{
    Task<List<HairSalon>> GetWholesaleAccountsAsync(CancellationToken ct);
}

public interface IInteractionRepository
{
    Task<List<Interaction>> GetAllAsync(CancellationToken ct);
    Task<Interaction?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<List<Interaction>> GetByContactIdAsync(Guid contactId, CancellationToken ct);
    Task<Interaction> AddAsync(Interaction interaction, CancellationToken ct);
    Task UpdateAsync(Interaction interaction, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public interface IFollowUpRepository
{
    Task<List<FollowUp>> GetAllAsync(CancellationToken ct);
    Task<FollowUp?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<List<FollowUp>> GetByContactIdAsync(Guid contactId, CancellationToken ct);
    Task<List<FollowUp>> GetByUserIdAsync(Guid userId, CancellationToken ct);
    Task<List<FollowUp>> GetDueFollowUpsAsync(DateTime date, CancellationToken ct);
    Task<List<FollowUp>> GetOverdueFollowUpsAsync(CancellationToken ct);
    Task<FollowUp> AddAsync(FollowUp followUp, CancellationToken ct);
    Task UpdateAsync(FollowUp followUp, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
```

### 8.2 Service Interfaces

```csharp
public interface ICustomerService
{
    Task<List<CustomerDto>> GetAllAsync(CancellationToken ct);
    Task<CustomerDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<CustomerDto> CreateAsync(CreateCustomerDto dto, CancellationToken ct);
    Task<CustomerDto> UpdateAsync(Guid id, UpdateCustomerDto dto, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public interface ILeadService
{
    Task<List<LeadDto>> GetAllAsync(CancellationToken ct);
    Task<LeadDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<LeadDto> CreateAsync(CreateLeadDto dto, CancellationToken ct);
    Task<LeadDto> UpdateAsync(Guid id, CreateLeadDto dto, CancellationToken ct);
    Task<LeadDto> UpdateStatusAsync(Guid id, UpdateLeadStatusDto dto, CancellationToken ct);
    Task<CustomerDto> ConvertToCustomerAsync(Guid id, ConvertLeadDto dto, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public interface IHairStylistService
{
    Task<List<HairStylistDto>> GetAllAsync(CancellationToken ct);
    Task<HairStylistDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<HairStylistDto> CreateAsync(CreateHairStylistDto dto, CancellationToken ct);
    Task<HairStylistDto> UpdateAsync(Guid id, CreateHairStylistDto dto, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public interface IHairSalonService
{
    Task<List<HairSalonDto>> GetAllAsync(CancellationToken ct);
    Task<HairSalonDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<HairSalonDto> CreateAsync(CreateHairSalonDto dto, CancellationToken ct);
    Task<HairSalonDto> UpdateAsync(Guid id, CreateHairSalonDto dto, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public interface IInteractionService
{
    Task<List<InteractionDto>> GetAllAsync(CancellationToken ct);
    Task<InteractionDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<List<InteractionDto>> GetByContactIdAsync(Guid contactId, CancellationToken ct);
    Task<InteractionDto> CreateAsync(CreateInteractionDto dto, Guid userId, CancellationToken ct);
    Task<InteractionDto> UpdateAsync(Guid id, CreateInteractionDto dto, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public interface IFollowUpService
{
    Task<List<FollowUpDto>> GetAllAsync(CancellationToken ct);
    Task<List<FollowUpDto>> GetDueFollowUpsAsync(CancellationToken ct);
    Task<FollowUpDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<List<FollowUpDto>> GetByContactIdAsync(Guid contactId, CancellationToken ct);
    Task<FollowUpDto> CreateAsync(CreateFollowUpDto dto, CancellationToken ct);
    Task<FollowUpDto> UpdateAsync(Guid id, CreateFollowUpDto dto, CancellationToken ct);
    Task<FollowUpDto> CompleteAsync(Guid id, CompleteFollowUpDto dto, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
```

### 8.3 Background Services

```csharp
// Service that runs periodically to check for due follow-ups and trigger notifications
public sealed class FollowUpReminderService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await CheckAndSendRemindersAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
        }
    }

    private async Task CheckAndSendRemindersAsync(CancellationToken ct)
    {
        // Check for follow-ups due today that haven't had reminders sent
        // Publish FollowUpDueEvent to trigger email notifications
    }
}
```

---

## 9. Database Schema

The CRM service uses SQLite with Entity Framework Core. Key schema elements:

**Contacts table** (with discriminator for inheritance):
- Uses TPH (Table-Per-Hierarchy) for Contact, Customer, Lead, HairStylist, HairSalon
- Discriminator column: `ContactType` (string)

**Interactions table:**
- Foreign key to Contacts
- Indexed on ContactId and InteractionDate

**FollowUps table:**
- Foreign key to Contacts
- Indexed on DueDate, Status, and AssignedToUserId

**ContactTags table:**
- Many-to-many relationship via join table
- Indexed on Tag for filtering

---

## 10. Integration Points

### 10.1 API Gateway (YARP)

Add route configuration to `appsettings.json`:

```json
{
  "ReverseProxy": {
    "Routes": {
      "crm-route": {
        "ClusterId": "crm-cluster",
        "Match": {
          "Path": "/api/crm/{**catch-all}"
        }
      }
    },
    "Clusters": {
      "crm-cluster": {
        "Destinations": {
          "destination1": {
            "Address": "http://crm-api"
          }
        }
      }
    }
  }
}
```

### 10.2 Aspire AppHost

Register the CRM API in `Program.cs`:

```csharp
var crmApi = builder.AddProject<Projects.CrownCommerce_Crm_Api>("crm-api")
    .WithReference(messaging)
    .WithExternalHttpEndpoints();
```

### 10.3 MassTransit Consumers

```csharp
// Automatically create/update customer records when orders are placed
public sealed class OrderCreatedConsumer : IConsumer<OrderCreatedEvent>
{
    public async Task Consume(ConsumeContext<OrderCreatedEvent> context)
    {
        // Find or create customer
        // Update purchase statistics (TotalOrders, TotalSpent, LastPurchaseDate)
        // Publish CustomerCreatedEvent if new
    }
}
```

---

## 11. Phased Implementation Plan

### Phase 1: Core CRM Infrastructure (MVP)

**Goal:** Basic CRM capability to track customers and leads

**Deliverables:**
- Domain model (Contact, Customer, Lead entities)
- Core repositories and services
- Database schema and migrations
- REST API endpoints for customers and leads
- Basic admin authentication
- Integration with API Gateway and Aspire

**Acceptance Criteria:**
- ✅ Admin can create, read, update, and delete customers
- ✅ Admin can create, read, update, and delete leads
- ✅ Admin can view customer order history (via Order service)
- ✅ Customer records are automatically created from OrderCreatedEvent
- ✅ All data persists to SQLite database
- ✅ API is accessible through API Gateway at `/api/crm/*`

**Estimated Effort:** 3-4 days

---

### Phase 2: Interactions and Follow-ups

**Goal:** Enable relationship tracking and task management

**Deliverables:**
- Interaction entity and API
- FollowUp entity and API
- Background service for follow-up reminders
- Event integration with Notification service
- Contact tagging system

**Acceptance Criteria:**
- ✅ Admin can log interactions (calls, emails, meetings, notes) for any contact
- ✅ Admin can schedule follow-ups with due dates and priorities
- ✅ Admin receives email reminders for due and overdue follow-ups
- ✅ Admin can mark follow-ups as completed with completion notes
- ✅ Admin can add custom tags to contacts for segmentation
- ✅ Dashboard shows overdue and due-today follow-ups

**Estimated Effort:** 2-3 days

---

### Phase 3: Hair Stylists and Salons

**Goal:** Track professional relationships in the hair industry

**Deliverables:**
- HairStylist entity and API
- HairSalon entity and API
- Relationship between stylists and salons
- Influencer program tracking
- Wholesale account management

**Acceptance Criteria:**
- ✅ Admin can create and manage hair stylist profiles
- ✅ Admin can create and manage hair salon profiles
- ✅ Admin can associate stylists with salons
- ✅ Admin can flag stylists as influencer program participants
- ✅ Admin can track salon wholesale accounts and purchase volumes
- ✅ Admin can view all stylists associated with a salon

**Estimated Effort:** 2-3 days

---

### Phase 4: Advanced Features and Analytics

**Goal:** Enhanced CRM capabilities and business intelligence

**Deliverables:**
- Lead scoring system
- Customer tier automation (Standard → VIP → Elite)
- Advanced search and filtering
- CRM dashboard with metrics
- Export functionality (CSV, Excel)
- Integration with Newsletter service for segmented campaigns

**Acceptance Criteria:**
- ✅ System automatically promotes customers to VIP/Elite based on spending
- ✅ Admin can search contacts by name, email, company, tags
- ✅ Admin can filter leads by status, source, and estimated revenue
- ✅ Dashboard displays KPIs (total customers, leads by status, follow-up completion rate)
- ✅ Admin can export contact lists to CSV
- ✅ Admin can create newsletter campaigns targeted at CRM segments

**Estimated Effort:** 3-4 days

---

### Phase 5: Email Automation

**Goal:** Automated email workflows based on customer behavior

**Deliverables:**
- Email template system
- Automated email triggers (welcome, follow-up, abandoned cart)
- Email sequence/drip campaign builder
- Email performance tracking

**Acceptance Criteria:**
- ✅ System sends automated welcome email to new customers
- ✅ System sends follow-up emails based on interaction outcomes
- ✅ Admin can create email sequences with timed delays
- ✅ Admin can view email open and click rates
- ✅ Customers can opt out of automated emails

**Estimated Effort:** 4-5 days

---

## 12. Testing Strategy

### Unit Tests
- Repository methods (CRUD operations)
- Service layer business logic (lead conversion, customer tier calculation)
- DTO mapping correctness

### Integration Tests
- API endpoint responses
- Database queries and relationships
- MassTransit event publishing and consuming
- Authentication and authorization

### End-to-End Tests (Playwright)
- Admin dashboard CRM workflows
- Creating and managing contacts
- Logging interactions and completing follow-ups
- Lead conversion flow

---

## 13. Security Considerations

- **Authentication:** All CRM endpoints require JWT authentication (admin only)
- **Authorization:** Only users with "Admin" role can access CRM data
- **Data Privacy:** Comply with GDPR/CCPA for customer data storage and deletion
- **Audit Logging:** Track all CRM data changes with user and timestamp
- **Email Opt-out:** Honor marketing opt-out preferences
- **Data Encryption:** Use HTTPS for all API communications
- **Rate Limiting:** Protect API endpoints from abuse

---

## 14. Future Enhancements

- **Mobile App:** Field sales app for iOS/Android
- **Salesforce Integration:** Sync CRM data with Salesforce
- **AI Insights:** Predictive lead scoring and churn risk analysis
- **SMS Integration:** Send SMS reminders and follow-ups
- **Calendar Integration:** Sync follow-ups with Google Calendar/Outlook
- **Social Media Integration:** Track social media interactions
- **Reporting:** Advanced business intelligence dashboards
- **Workflow Automation:** Visual workflow builder for complex automations
- **Multi-currency Support:** Track international customers and orders
- **Custom Fields:** Admin-configurable custom fields for contacts

---

## 15. Success Metrics

- **Adoption:** % of admin users actively using CRM features
- **Data Quality:** % of customer records with complete contact information
- **Follow-up Completion:** % of follow-ups completed on time
- **Lead Conversion:** % of leads converted to customers
- **Customer Retention:** Repeat purchase rate for CRM-tracked customers
- **Time to Response:** Average time from inquiry to first interaction
- **Engagement:** Average number of interactions per customer
- **Revenue Impact:** Incremental revenue attributed to CRM-tracked relationships

---

## 16. Documentation Requirements

- **API Documentation:** OpenAPI/Swagger for all endpoints
- **Admin User Guide:** How to use CRM features in admin dashboard
- **Integration Guide:** How other services integrate with CRM events
- **Database Schema:** Entity relationship diagrams
- **Deployment Guide:** How to deploy and configure CRM service

---

## Conclusion

This CRM feature provides CrownCommerce with a comprehensive system to manage customer relationships across multiple segments (retail customers, wholesale leads, hair stylists, and salons). The phased approach allows for iterative delivery of value while maintaining the existing microservices architecture and patterns. The design emphasizes flexibility, scalability, and integration with existing platform services.
