# Content Service -- Requirements

## Overview
The Content Service manages all CMS-style content for Origin Hair Collective: static pages (Our Story, Hair Care Guide, Shipping Info, Returns Policy, Ambassador Program), FAQs, customer testimonials, and the community gallery.

## API Endpoints

### Pages
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/pages` | List all published pages |
| GET | `/pages/{slug}` | Get a page by slug |

### FAQs
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/faqs` | List all published FAQs |
| GET | `/faqs/category/{category}` | List FAQs by category |

### Testimonials
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/testimonials` | List approved testimonials |
| POST | `/testimonials` | Submit a new testimonial |

### Gallery
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/gallery` | List all published gallery images |
| GET | `/gallery/category/{category}` | List images by category |

## Domain Entities

### ContentPage
- Id, Slug (unique), Title, Body, SortOrder, IsPublished, CreatedAt, UpdatedAt?

### FaqItem
- Id, Question, Answer, Category, SortOrder, IsPublished

### Testimonial
- Id, CustomerName, CustomerLocation?, Content, Rating, ImageUrl?, IsApproved, CreatedAt

### GalleryImage
- Id, Title, Description?, ImageUrl, Category, SortOrder, IsPublished, CreatedAt

## Business Rules
1. Only published content is returned in public endpoints
2. New testimonials require admin approval (IsApproved defaults to false)
3. Page slugs must be unique
4. Rating must be between 1-5

## Event Contracts
- None (read-heavy, no cross-service events)

## Dependencies
- None (standalone content service)

## Database
- SQLite: `content.db`
- Tables: Pages, Faqs, Testimonials, GalleryImages
- Seed data: 5 pages, 6 FAQs, 3 testimonials

## Implementation Roadmap

### Phase 1 -- Foundation (current)
- [x] Core entities, enums, interfaces
- [x] Infrastructure: DbContext, seeder, repositories
- [x] Application: DTOs, mapping, services
- [x] API: Controllers, Program.cs

### Phase 2 -- Admin Management
- [ ] CRUD endpoints for admin (create/update/delete pages, FAQs)
- [ ] Testimonial approval workflow
- [ ] Gallery image upload with storage

### Phase 3 -- Advanced Features
- [ ] Full-text search across content
- [ ] Content versioning
- [ ] Rich text / markdown rendering
