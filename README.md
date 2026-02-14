<p align="center">
  <img src="designs/ui/images/GitHub%20README%20Banner.png" alt="CrownCommerce" />
</p>

<p align="center">
  Multi-brand premium hair e-commerce platform built with a microservices architecture.
</p>

---

## Brands

| Brand | Description | Status |
|-------|-------------|--------|
| **Origin Hair Collective** | Premium hair | Active |
| **Mane Haus** | Luxury hair | Coming Soon |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | .NET 9 / C# 13 |
| **Frontend** | Angular 21, Angular Material, SCSS |
| **Orchestration** | .NET Aspire 9 |
| **API Gateway** | YARP 2.2 |
| **Messaging** | MassTransit 8.3 + RabbitMQ |
| **Data** | EF Core 9 + SQLite |
| **Real-time** | SignalR |
| **Observability** | OpenTelemetry |
| **Testing** | Playwright 1.58, Vitest, Storybook |

## Architecture

The platform is composed of nine domain-driven microservices behind a YARP reverse proxy, orchestrated by .NET Aspire.

```
                         ┌──────────────┐
                         │  Angular SPA │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │ YARP Gateway │
                         └──────┬───────┘
                                │
    ┌────────┬─────────┬────────┼────────┬──────────┬───────────┐
    │        │         │        │        │          │           │
┌───▼──┐ ┌──▼──┐ ┌───▼───┐ ┌──▼───┐ ┌──▼───┐ ┌───▼────┐ ┌───▼────┐
│Catlog│ │Chat │ │Content│ │Ident │ │Inqury│ │Notific │ │Newslet │
└──────┘ └─────┘ └───────┘ └──────┘ └──────┘ └────────┘ └────────┘
    │        │         │        │        │          │           │
    └────────┴─────────┴────────┼────────┴──────────┴───────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
               ┌────▼──┐  ┌───▼────┐  ┌───▼───┐
               │ Order │  │Payment │  │RbbitMQ│
               └───────┘  └────────┘  └───────┘
```

## Project Structure

```
src/
  Aspire/
    CrownCommerce.AppHost                     # Aspire orchestrator
    CrownCommerce.ServiceDefaults             # Shared service configuration
  Gateway/
    CrownCommerce.ApiGateway                  # YARP reverse proxy
  Services/
    Catalog/       (.Core, .Infrastructure, .Application, .Api)
    Chat/          (.Core, .Infrastructure, .Application, .Api)
    Content/       (.Core, .Infrastructure, .Application, .Api)
    Identity/      (.Core, .Infrastructure, .Application, .Api)
    Inquiry/       (.Core, .Infrastructure, .Application, .Api)
    Newsletter/    (.Core, .Infrastructure, .Application, .Api)
    Notification/  (.Core, .Infrastructure, .Application, .Api)
    Order/         (.Core, .Infrastructure, .Application, .Api)
    Payment/       (.Core, .Infrastructure, .Application, .Api)
  Shared/
    CrownCommerce.Shared.Contracts            # Cross-service message contracts
  CrownCommerce.Web/
    projects/
      api/                                    # Shared HTTP client library
      components/                             # Shared UI component library
      crown-commerce-admin/                   # Admin dashboard (all brands)
      origin-hair-collective/                 # Origin Hair Collective marketing site
      origin-hair-collective-coming-soon/     # Origin Hair Collective pre-launch
      mane-haus/                              # Mane Haus marketing site
      mane-haus-coming-soon/                  # Mane Haus pre-launch
designs/
  ui/                                         # UI designs (.pen files)
  technical/                                  # Technical design documents
docs/                                         # Business plans & documentation
```

Each service follows a consistent layered architecture: **Core** (domain entities and interfaces) > **Infrastructure** (EF Core, repositories) > **Application** (DTOs, services, mapping) > **Api** (REST endpoints).

## Services

| Service | Description |
|---------|-------------|
| **Catalog** | Hair products and origins management |
| **Chat** | AI-powered customer chat with SignalR |
| **Content** | Dynamic site content (hero, testimonials, trust bar) |
| **Identity** | Authentication and authorization (JWT) |
| **Inquiry** | Customer inquiry intake and tracking |
| **Newsletter** | Campaign management and subscriber distribution |
| **Notification** | Email/SMS notifications via event consumers |
| **Order** | Order creation and lifecycle management |
| **Payment** | Payment processing and refunds |

## Frontend

The Angular workspace contains seven projects across platform and brand-specific apps:

### Platform (shared across all brands)

**API Library** (`projects/api`) — Shared HTTP client service abstractions consumed by all apps.

**Component Library** (`projects/components`) — Reusable UI components shared across apps:

`Badge` `BenefitCard` `Button` `ChatMessage` `ChatTypingIndicator` `ChatWidget` `CloseButton` `CountdownTimer` `Divider` `EmailSignup` `FooterLinkColumn` `Logo` `ProductCard` `SectionHeader` `SocialIcons` `TestimonialCard` `TrustBarItem`

**Admin Dashboard** (`projects/crown-commerce-admin`) — Back-office application for managing products, origins, inquiries, subscribers, content, and testimonials across all brands.

### Brand: Origin Hair Collective

**Marketing Site** (`projects/origin-hair-collective`) — Customer-facing storefront with product showcases, brand story, testimonials, and an AI-powered chat widget.

**Coming Soon** (`projects/origin-hair-collective-coming-soon`) — Pre-launch landing page with countdown timer and email signup.

### Brand: Mane Haus

**Marketing Site** (`projects/mane-haus`) — Customer-facing storefront.

**Coming Soon** (`projects/mane-haus-coming-soon`) — Pre-launch landing page with countdown timer and email signup.

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 22+](https://nodejs.org/)
- [Aspire workload](https://learn.microsoft.com/en-us/dotnet/aspire/) (for AppHost orchestration)

## Getting Started

```bash
# Install Aspire workload (requires admin/elevated terminal on Windows)
dotnet workload install aspire

# Build the solution
dotnet build CrownCommerce.sln

# Build and serve the Angular app
cd src/CrownCommerce.Web
npm install
npx ng build components
npx ng serve origin-hair-collective
```

## Testing

```bash
# Unit tests (Vitest)
cd src/CrownCommerce.Web
npm test

# E2E tests — Marketing site (Playwright)
npm run e2e
npm run e2e:ui

# E2E tests — Admin dashboard
npm run e2e:admin
npm run e2e:admin:ui

# E2E tests — Coming soon page
npm run e2e:coming-soon
npm run e2e:coming-soon:ui

# Component development (Storybook)
npm run storybook
```

> **Note:** The AppHost project requires the Aspire workload. All other C# projects compile without it.
