# Multi-Brand Platform Rename Design

## 1. Context

The codebase was originally built as a single-brand platform for **Origin Hair Collective**. It has since evolved into a multi-brand platform — a second brand, **Mane Haus**, already has a coming-soon site in the Angular workspace. The admin dashboard, shared services, component library, and API gateway serve all brands, but the naming still reflects the original single-brand assumption.

This document designs a rename that separates _platform infrastructure_ (shared, brand-agnostic) from _brand-specific_ assets (marketing sites, brand theming, content).

### Current Brands

| Brand | Type | Status |
|-------|------|--------|
| Origin Hair Collective | Luxury hair extensions | Active (marketing site, coming-soon, admin) |
| Mane Haus | Luxury hair extensions & styling | Coming soon |

---

## 2. Platform Name

**Proposed name: `CrownCommerce`**

Rationale:
- "Crown" is already established in the loyalty program ("Crown Rewards")
- Evokes premium beauty/hair without being tied to a single brand
- Works as a technical namespace: `CrownCommerce.Catalog.Api`
- Short, memorable, and distinct from both brand names

Alternatives considered:
- `StrandPlatform` — too literal
- `HairCommerce` — too generic, sounds like a template
- `LuxeCommerce` — conflicts with the "Luxe" loyalty tier name

---

## 3. Rename Map

### 3.1 Solution & Repository

| Current | Renamed |
|---------|---------|
| `OriginHairCollective.sln` | `CrownCommerce.sln` |
| Repo folder `OriginHairCollective/` | `CrownCommerce/` (or keep as-is if renaming the repo root is disruptive) |

### 3.2 .NET Projects (40 projects)

All follow the pattern `OriginHairCollective.<Domain>.<Layer>` → `CrownCommerce.<Domain>.<Layer>`.

**Aspire:**

| Current | Renamed |
|---------|---------|
| `OriginHairCollective.AppHost` | `CrownCommerce.AppHost` |
| `OriginHairCollective.ServiceDefaults` | `CrownCommerce.ServiceDefaults` |

**Gateway:**

| Current | Renamed |
|---------|---------|
| `OriginHairCollective.ApiGateway` | `CrownCommerce.ApiGateway` |

**Shared:**

| Current | Renamed |
|---------|---------|
| `OriginHairCollective.Shared.Contracts` | `CrownCommerce.Shared.Contracts` |

**Services (9 services x 4 layers = 36 projects):**

Pattern: `OriginHairCollective.{Service}.{Layer}` → `CrownCommerce.{Service}.{Layer}`

Example:
| Current | Renamed |
|---------|---------|
| `OriginHairCollective.Catalog.Api` | `CrownCommerce.Catalog.Api` |
| `OriginHairCollective.Catalog.Application` | `CrownCommerce.Catalog.Application` |
| `OriginHairCollective.Catalog.Core` | `CrownCommerce.Catalog.Core` |
| `OriginHairCollective.Catalog.Infrastructure` | `CrownCommerce.Catalog.Infrastructure` |

Same pattern applies to: `Chat`, `Content`, `Identity`, `Inquiry`, `Newsletter`, `Notification`, `Order`, `Payment`.

### 3.3 Folder Structure

```
src/
  Aspire/
    CrownCommerce.AppHost/
    CrownCommerce.ServiceDefaults/
  Gateway/
    CrownCommerce.ApiGateway/
  Services/                                    # unchanged — services are platform-level
    Catalog/
      CrownCommerce.Catalog.Core/
      CrownCommerce.Catalog.Infrastructure/
      CrownCommerce.Catalog.Application/
      CrownCommerce.Catalog.Api/
    ...
  Shared/
    CrownCommerce.Shared.Contracts/
  CrownCommerce.Web/                           # renamed from OriginHairCollective.Web
    projects/
      api/                                     # shared API client library (unchanged)
      components/                              # shared component library (unchanged)
      crown-commerce-admin/                    # renamed — serves ALL brands
      origin-hair-collective/                  # brand-specific marketing site
      origin-hair-collective-coming-soon/      # brand-specific coming soon
      mane-haus-coming-soon/                   # brand-specific coming soon (fix typo: main → mane)
designs/
  ui/
    admin.pen                                  # renamed from admin-site.pen
    origin-hair-collective/                    # brand-specific designs
      marketing-site.pen
      coming-soon.pen
      kim-k.pen
      ig.pen
    mane-haus/                                 # brand-specific designs
      coming-soon.pen
  technical/                                   # unchanged
docs/                                          # unchanged
```

### 3.4 Angular Workspace

| Current Project Name | Renamed | Reason |
|---------------------|---------|--------|
| `api` | `api` | Already brand-agnostic |
| `components` | `components` | Already brand-agnostic |
| `origin-hair-collective` | `origin-hair-collective` | Brand-specific — keep |
| `origin-hair-collective-admin` | `crown-commerce-admin` | Serves all brands |
| `origin-hair-collective-coming-soon` | `origin-hair-collective-coming-soon` | Brand-specific — keep |
| `main-haus-coming-soon` | `mane-haus-coming-soon` | Fix typo (`main` → `mane`) |

**package.json:**

| Current | Renamed |
|---------|---------|
| `"name": "origin-hair-collective.web"` | `"name": "crown-commerce-web"` |

### 3.5 C# Namespaces

All namespaces follow project names implicitly. Renaming the `.csproj` files renames the default namespaces automatically.

`OriginHairCollective.Catalog.Api.Controllers` → `CrownCommerce.Catalog.Api.Controllers`

Every `using OriginHairCollective.*` statement across all `.cs` files must be updated.

### 3.6 Aspire AppHost References

```csharp
// Before
Projects.OriginHairCollective_Catalog_Api
builder.AddNpmApp("angular", "../../OriginHairCollective.Web", "start")

// After
Projects.CrownCommerce_Catalog_Api
builder.AddNpmApp("angular", "../../CrownCommerce.Web", "start")
```

Service names in Aspire (`"catalog-api"`, `"identity-api"`, etc.) remain unchanged — they are already brand-agnostic.

### 3.7 YARP Gateway

Route names, cluster names, and API paths (`/api/catalog/**`, `/api/identity/**`, etc.) remain unchanged — they are already brand-agnostic.

### 3.8 Seeded Data

| Current | Change? |
|---------|---------|
| `admin@originhair.com` | Consider changing to `admin@crowncommerce.com` or keeping as a brand-specific seed |
| `Admin123!` | No change |

---

## 4. Multi-Brand Architecture Considerations

### 4.1 What Becomes Multi-Tenant

Services that must support multi-brand data need a `BrandId` or tenant discriminator:

| Service | Multi-Brand? | Notes |
|---------|-------------|-------|
| **Catalog** | Yes | Products belong to a brand |
| **Content** | Yes | Hero, testimonials, trust bar are brand-specific |
| **Chat** | Yes | Conversations are brand-scoped |
| **Inquiry** | Yes | Inquiries arrive for a specific brand |
| **Newsletter** | Yes | Subscribers and campaigns are brand-scoped |
| **Identity** | Shared | Admin users manage all brands; customers may span brands |
| **Notification** | Shared | Sends notifications on behalf of any brand |
| **Order** | Yes | Orders are placed under a brand |
| **Payment** | Yes | Payments are tied to brand orders |

**Approach:** Add a `BrandId` (GUID) column to relevant entities. Seed a `Brands` table in a shared location or in the Identity service. Filter all queries by brand context derived from the request (header, JWT claim, or route).

### 4.2 Admin Dashboard — Multi-Brand Support

The renamed `crown-commerce-admin` app needs:

- **Brand switcher** in the toolbar — select which brand to manage
- **Brand context** sent with every API request (e.g., `X-Brand-Id` header)
- **Brand-aware sidebar** — show/hide features per brand capability
- **Super-admin view** — cross-brand analytics and settings

### 4.3 Component Library — Theming

The shared component library (`projects/components`) should support brand theming via CSS custom properties:

```scss
// Brand theme tokens (set at app root)
:root {
  --brand-primary: #8B6914;        // Origin Hair Collective gold
  --brand-accent: #D4A84B;
  --brand-font-display: 'Playfair Display', serif;
}

:root[data-brand="mane-haus"] {
  --brand-primary: #1A1A2E;        // Mane Haus dark navy
  --brand-accent: #C9A96E;
  --brand-font-display: 'Cormorant Garamond', serif;
}
```

Components consume tokens — never hard-code brand colors.

### 4.4 API Library — Brand Context

The shared `projects/api` library should inject brand context into requests:

```typescript
// Interceptor adds brand header to all outgoing requests
@Injectable()
export class BrandInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    const brandId = inject(BrandService).activeBrandId();
    return next.handle(req.clone({
      setHeaders: { 'X-Brand-Id': brandId }
    }));
  }
}
```

---

## 5. Rename Execution Plan

The rename should be executed in phases to keep the codebase buildable at each step.

### Phase 1 — Backend Rename (low risk, no runtime impact)

1. Rename `.csproj` files and folders: `OriginHairCollective.*` → `CrownCommerce.*`
2. Update `CrownCommerce.sln` — regenerate project references
3. Find-and-replace all `using OriginHairCollective` → `using CrownCommerce` across `.cs` files
4. Find-and-replace all `namespace OriginHairCollective` → `namespace CrownCommerce`
5. Update Aspire AppHost `Projects.*` references
6. Update AppHost npm app path reference
7. Verify: `dotnet build CrownCommerce.sln`

### Phase 2 — Frontend Rename

1. Rename `OriginHairCollective.Web/` folder → `CrownCommerce.Web/`
2. Rename Angular project `origin-hair-collective-admin` → `crown-commerce-admin` in `angular.json`
3. Fix typo: `main-haus-coming-soon` → `mane-haus-coming-soon` in `angular.json` and folder name
4. Update `package.json` name
5. Update npm script names referencing old project names
6. Verify: `npm run build` for all projects

### Phase 3 — Cleanup & Documentation

1. Update `README.md` — new project name, updated structure
2. Update design file organization (brand-specific subfolders)
3. Update `CLAUDE.md` / memory files if applicable
4. Update any CI/CD pipelines or GitHub Actions
5. Update seeded admin email if desired

### Phase 4 — Multi-Tenant Data Model (separate effort)

1. Add `Brand` entity and seed table
2. Add `BrandId` to tenant-scoped entities
3. Add brand filtering middleware/query filters
4. Add brand switcher to admin UI
5. Add brand theming to component library

---

## 6. Files Changed — Full Blast Radius

| Category | Count | Description |
|----------|-------|-------------|
| `.csproj` files | 40 | Rename files and folders |
| `.sln` file | 1 | Regenerate with new project paths |
| `.cs` files (namespaces) | ~200+ | `using` and `namespace` statements |
| `angular.json` | 1 | Rename admin project, fix typo |
| `package.json` | 1 | Update package name and scripts |
| Aspire `Program.cs` | 1 | Update `Projects.*` references and npm path |
| Folder renames | ~42 | All project folders |
| Documentation | 3-5 | README, design docs, memory files |

**No changes required to:**
- YARP route/cluster config (already generic)
- Aspire service names (`"catalog-api"`, etc.)
- API URL paths (`/api/catalog/**`, etc.)
- RabbitMQ queue/exchange names
- Database file names (per-service SQLite)

---

## 7. Summary

```
Before (single-brand):
  OriginHairCollective.Catalog.Api
  OriginHairCollective.Identity.Api
  origin-hair-collective-admin

After (multi-brand platform):
  CrownCommerce.Catalog.Api          ← platform service
  CrownCommerce.Identity.Api         ← platform service
  crown-commerce-admin               ← manages all brands
  origin-hair-collective/            ← brand-specific site
  mane-haus-coming-soon/             ← brand-specific site
```

The platform becomes **CrownCommerce** — a multi-brand commerce engine. Individual brands (Origin Hair Collective, Mane Haus, and future brands) are tenants that plug into the shared services, admin UI, and component library.
