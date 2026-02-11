<p align="center">
  <img src="designs/ui/images/GitHub%20README%20Banner%20(1280x320).png" alt="Origin Hair Collective" />
</p>

<p align="center">
  Premium hair extensions e-commerce platform built with a microservices architecture.
</p>

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | .NET 9 / C# 13 |
| **Frontend** | Angular 21, SCSS |
| **Orchestration** | .NET Aspire 9 |
| **API Gateway** | YARP 2.2 |
| **Messaging** | MassTransit 8.3 + RabbitMQ |
| **Data** | EF Core 9 + SQLite |
| **Real-time** | SignalR |
| **Observability** | OpenTelemetry |
| **Testing** | Playwright, Vitest, Storybook |

## Architecture

The platform is composed of eight domain-driven microservices behind a YARP reverse proxy, orchestrated by .NET Aspire.

```
                         ┌──────────────┐
                         │  Angular SPA │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │ YARP Gateway │
                         └──────┬───────┘
                                │
          ┌─────────┬───────────┼───────────┬──────────┐
          │         │           │           │          │
     ┌────▼──┐ ┌───▼───┐ ┌────▼───┐ ┌────▼───┐ ┌───▼────┐
     │Catalog│ │ Chat  │ │Content │ │Identity│ │Inquiry │  ...
     └───────┘ └───────┘ └────────┘ └────────┘ └────────┘
          │         │           │           │          │
          └─────────┴───────────┴─────┬─────┴──────────┘
                                      │
                               ┌──────▼──────┐
                               │  RabbitMQ   │
                               └─────────────┘
```

## Project Structure

```
src/
  Aspire/
    OriginHairCollective.AppHost              # Aspire orchestrator
    OriginHairCollective.ServiceDefaults      # Shared service configuration
  Gateway/
    OriginHairCollective.ApiGateway           # YARP reverse proxy
  Services/
    Catalog/    (.Core, .Infrastructure, .Application, .Api)
    Chat/       (.Core, .Infrastructure, .Application, .Api)
    Content/    (.Core, .Infrastructure, .Application, .Api)
    Identity/   (.Core, .Infrastructure, .Application, .Api)
    Inquiry/    (.Core, .Infrastructure, .Application, .Api)
    Notification/ (.Core, .Infrastructure, .Application, .Api)
    Order/      (.Core, .Infrastructure, .Application, .Api)
    Payment/    (.Core, .Infrastructure, .Application, .Api)
  Shared/
    OriginHairCollective.Shared.Contracts     # Cross-service message contracts
  OriginHairCollective.Web/
    projects/
      components/                     # Shared component library
      origin-hair-collective/         # Customer-facing marketing site
      origin-hair-collective-admin/   # Admin dashboard
designs/
  ui/                                 # UI designs (.pen files)
  technical/                          # Technical design documents
```

Each service follows a consistent layered architecture: **Core** (domain entities and interfaces) > **Infrastructure** (EF Core, repositories) > **Application** (DTOs, services, mapping) > **Api** (REST endpoints).

## Frontend

The Angular workspace contains three projects:

**Component Library** (`projects/components`) — Reusable UI components shared across apps:

`Badge` `BenefitCard` `Button` `ChatMessage` `ChatTypingIndicator` `ChatWidget` `CloseButton` `Divider` `FooterLinkColumn` `Logo` `ProductCard` `SectionHeader` `SocialIcons` `TestimonialCard` `TrustBarItem`

**Marketing Site** (`projects/origin-hair-collective`) — Customer-facing storefront with product showcases, brand story, testimonials, and an AI-powered chat widget.

**Admin Dashboard** (`projects/origin-hair-collective-admin`) — Back-office application for managing products, inquiries, content, and testimonials.

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 22+](https://nodejs.org/)
- [Aspire workload](https://learn.microsoft.com/en-us/dotnet/aspire/) (for AppHost orchestration)

## Getting Started

```bash
# Install Aspire workload (requires admin/elevated terminal on Windows)
dotnet workload install aspire

# Build the solution
dotnet build OriginHairCollective.sln

# Build and serve the Angular app
cd src/OriginHairCollective.Web
npm install
npx ng build components
npx ng serve origin-hair-collective
```

## Testing

```bash
# Unit tests (Vitest)
cd src/OriginHairCollective.Web
npm test

# E2E tests (Playwright)
npm run e2e

# E2E with UI mode
npm run e2e:ui

# Admin E2E tests
npm run e2e:admin

# Component development (Storybook)
npm run storybook
```

> **Note:** The AppHost project requires the Aspire workload. All other C# projects compile without it.
