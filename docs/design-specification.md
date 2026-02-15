# Origin Hair Collective - Design Specification

> Comprehensive brand and design system reference for all web applications, marketing materials, and content. Based on the master design file `designs/ui/markerting-site.pen`.

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Icons](#icons)
7. [Page Sections (Marketing Site)](#page-sections-marketing-site)
8. [Coming Soon Pages](#coming-soon-pages)
9. [Chat Widget](#chat-widget)
10. [Business Cards](#business-cards)
11. [Social Media & Marketing Materials](#social-media--marketing-materials)
12. [Favicon](#favicon)
13. [GitHub README Banner](#github-readme-banner)
14. [Responsive Breakpoints](#responsive-breakpoints)
15. [Design Tokens (CSS Variables)](#design-tokens-css-variables)

---

## Brand Identity

### Logo

The Origin Hair Collective logo is a **typographic wordmark** using the Fraunces typeface.

| Property | Value |
|----------|-------|
| **Primary text** | `ORIGIN` |
| **Secondary text** | `HAIR COLLECTIVE` |
| **Font** | Fraunces, SemiBold (600) |
| **Primary color** | `#C9A052` (Accent Gold) |
| **Secondary color** | `#9A9590` (Text Secondary) |
| **Letter spacing (primary)** | 4px (compact), 6px (medium), 12px (large/card) |
| **Letter spacing (secondary)** | 3px - 5px |
| **Layout** | Vertically stacked, center-aligned |

#### Logo Size Variants

| Context | Primary Font Size | Secondary Font Size | Letter Spacing | Gap |
|---------|-------------------|---------------------|----------------|-----|
| **Mobile header** | 22px | 8px | 4px / 3px | 2px |
| **Desktop header** | 22px | 8px | 4px / 3px | 2px |
| **Social media** | 18-20px | 9px | 6-8px | 4px |
| **Business card (front)** | 42px | 11px | 12px / 5px | 16px |
| **Business card (back)** | 18px | 8px | 3px / 2px | 2px |
| **GitHub banner** | 56px | 14px | 18px / 6px | 6px |

#### Logo Decorative Elements

- **Accent lines**: 1px gold (`#C9A052`) horizontal rules, width 32-48px, placed above/below the logo group
- Used in Coming Soon, Brand Story, and Social Media contexts

### Brand Voice

- **Premium** and **luxury** positioning
- **Community-centered** ("The Collective")
- **Empowering** women-focused language
- **Canadian Black-owned business** identity
- Tagline: *"Premium Hair. E-Commerce Platform."* (technical) or *"Premium Virgin Hair Crafted For Excellence"* (consumer)

---

## Color System

### Theme: Default (Dark Luxury)

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-gold` | `#C9A962` | Primary accent, CTAs, highlights |
| `accent-gold-deep` | `#8B7845` | Deep gold for subtle accents |
| `bg-primary` | `#1A1A1C` | Main background |
| `bg-surface` | `#242426` | Card/surface backgrounds |
| `bg-elevated` | `#2A2A2C` | Elevated surfaces, modals |
| `border-divider` | `#2A2A2C` | Subtle dividers |
| `border-primary` | `#3A3A3C` | Primary borders |
| `text-primary` | `#F5F5F0` | Main text, headings |
| `text-secondary` | `#6E6E70` | Secondary text, descriptions |
| `text-tertiary` | `#4A4A4C` | Tertiary text, hints |

### Theme: Warm (Warm Luxury)

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-gold` | `#C9A052` | Primary accent (warmer tone) |
| `bg-primary` | `#0B0A08` | Deep warm black background |
| `bg-surface` | `#161412` | Warm surface backgrounds |
| `border-divider` | `#1E1C18` | Warm dividers |
| `text-primary` | `#FAF7F0` | Warm white text |
| `text-secondary` | `#9A9590` | Warm secondary text |
| `text-tertiary` | `#6B6860` | Warm tertiary text |
| `text-muted` | `#4A4840` | Muted text (copyright, etc.) |

### Extended Palette (Hardcoded in Design)

| Color | Hex | Usage |
|-------|-----|-------|
| **Gold overlay** | `#C9A05215` | Icon backgrounds, card borders, pill backgrounds |
| **Gold border** | `#C9A05230` | Subtle gold borders on pills, inputs |
| **Gold muted** | `#C9A05240` | Decorative elements, dividers |
| **Deep black** | `#0B0A08` | Deepest background, overlays |
| **Surface dark** | `#161412` | Testimonial cards, section backgrounds |
| **Surface border** | `#1E1C18` | Card borders, dividers |
| **Rose/Terracotta** | `#B8816B` | Social handle accent (@OriginHairCollective) |
| **Dark text** | `#0B0A08` | Text on gold buttons |

### Gradient Definitions

**Final CTA gradient** (background):
```css
background: linear-gradient(180deg, #1A1508 0%, #0B0A08 100%);
```

**Coming Soon radial glow** (subtle gold wash):
```css
background: radial-gradient(ellipse at center 35%, rgba(201, 160, 82, 0.08) 0%, transparent 100%);
```

**Photo overlay** (image dimming):
```css
background: linear-gradient(180deg, rgba(11, 10, 8, 0.56) 0%, rgba(11, 10, 8, 0.8) 40%, rgba(11, 10, 8, 0.94) 75%, #0B0A08 100%);
```

---

## Typography

### Font Families

| Role | Family | Source |
|------|--------|--------|
| **Headings** | Fraunces | Google Fonts |
| **Body** | DM Sans | Google Fonts |

### Type Scale

#### Headings (Fraunces)

| Name | Mobile | Desktop | Weight | Letter Spacing | Line Height |
|------|--------|---------|--------|----------------|-------------|
| **Display** | 38px | 64-80px | 500 | -1 to -2px | 1.05-1.1 |
| **H1** | 28px | 48px | 500 | -0.5 to -1px | 1.15-1.2 |
| **H2** | 28px | 42px | 500 | -0.5 to -0.8px | 1.2 |
| **H3** | 18-20px | 20-22px | 600 | 0 | default |
| **Coming Soon** | 42px | 72px | 500 | 2-4px | 1.1 |
| **Quote mark** | 64px | 80px | normal | 0 | 0.5 |

#### Body (DM Sans)

| Name | Mobile | Desktop | Weight | Line Height |
|------|--------|---------|--------|-------------|
| **Body large** | 15px | 18px | normal | 1.6 |
| **Body** | 14px | 15-16px | normal | 1.6 |
| **Body small** | 13px | 14px | normal/500 | 1.6 |
| **Caption** | 12px | 13px | normal | default |
| **Overline/Label** | 11px | 12px | 600 | default |
| **Micro** | 10-11px | 11px | normal/500 | default |

#### Special Styles

| Style | Font | Size | Weight | Letter Spacing | Extras |
|-------|------|------|--------|----------------|--------|
| **Section label** | DM Sans | 11-12px | 600 | 3px | UPPERCASE, gold color |
| **Button text** | DM Sans | 14-15px | 700 | 1.2-1.5px | UPPERCASE |
| **Nav links** | DM Sans | 14px (desktop), 18px (mobile menu) | 500 | 0 | Sentence case |
| **Quote text** | DM Sans | 16-20px | normal | 0 | italic |
| **Star rating** | DM Sans | 14-18px | normal | 0 | Gold color |
| **Price** | DM Sans | 15-17px | 600 | 0 | Gold color |

---

## Spacing & Layout

### Spacing Scale

All spacing follows a consistent system (in pixels):

| Token | Value | Usage |
|-------|-------|-------|
| **xs** | 2-4px | Tight gaps (logo group, inline elements) |
| **sm** | 6-8px | Small gaps (nav items, icon groups) |
| **md** | 12-16px | Medium gaps (card content, form elements) |
| **lg** | 20-24px | Section internal spacing, card padding |
| **xl** | 32px | Desktop card padding, section gaps |
| **2xl** | 48px | Desktop section padding, large gaps |
| **3xl** | 56px | Mobile section padding (vertical) |
| **4xl** | 64px | Mobile CTA padding, header height |
| **5xl** | 80px | Desktop section padding |
| **6xl** | 100px | Desktop CTA padding |

### Section Padding

| Section | Mobile | Desktop |
|---------|--------|---------|
| **Header** | 0 horizontal, 24px sides | 0 vertical, 80px sides |
| **Hero** | 48px vertical, 24px horizontal | 120px vertical, 80px horizontal |
| **Trust Bar** | 20px vertical, 24px horizontal | 24px vertical, 80px horizontal |
| **Brand Story** | 56px vertical, 24px horizontal | 80px all sides |
| **Products** | 56px vertical, 24px horizontal | 80px all sides |
| **Why Origin** | 56px vertical, 24px horizontal | 80px all sides |
| **Testimonials** | 56px vertical, 24px horizontal | 80px vertical, 200px horizontal |
| **Community** | 56px vertical, 0 horizontal | 80px vertical, 0 horizontal |
| **Final CTA** | 64px vertical, 24px horizontal | 100px vertical, 200px horizontal |
| **Footer** | 32px vertical, 24px horizontal | 48px vertical, 80px horizontal |

### Corner Radii

| Value | Usage |
|-------|-------|
| **0px** | No rounding (default frames) |
| **1px** | Accent lines, subtle rounding |
| **12px** | Small icon wrappers (mobile), business cards |
| **14px** | Icon wrappers (desktop) |
| **16px** | Cards (benefit cards, product cards) |
| **20px** | Large cards (testimonials), chat panels |
| **100px (pill)** | Buttons, pills, badges, input fields, avatars |

### Component Gaps

| Context | Gap |
|---------|-----|
| **Navigation items** | 24-32px |
| **Card content** | 14-16px |
| **Section header to content** | 32-48px |
| **Photo grid items** | 3-4px |
| **Form elements** | 12px |
| **Footer link columns** | 24-32px |

---

## Components

### Buttons

#### Primary CTA Button

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Background** | `#C9A052` | `#C9A052` |
| **Text color** | `#0B0A08` | `#0B0A08` |
| **Font** | DM Sans, 14px, 700 | DM Sans, 15px, 700 |
| **Letter spacing** | 1.2-1.5px | 1.5px |
| **Text transform** | UPPERCASE | UPPERCASE |
| **Padding** | 18px vertical, 36px horizontal | 20px vertical, 44px horizontal |
| **Corner radius** | 100px (pill) | 100px (pill) |
| **Icon** | Lucide `arrow-right`, 18px | Lucide `arrow-right`, 20px |
| **Gap (text to icon)** | 8px | 10px |

#### Ghost/Outline Button

| Property | Value |
|----------|-------|
| **Background** | transparent |
| **Border** | 1px solid `#C9A05230` |
| **Text color** | `#C9A052` |
| **Font** | DM Sans, 14px, 600 |
| **Padding** | 18px vertical, 28px horizontal |
| **Corner radius** | 100px (pill) |

#### Mobile Menu CTA

| Property | Value |
|----------|-------|
| **Background** | `#C9A052` |
| **Text color** | `#0B0A08` |
| **Font** | DM Sans, 14px, 700 |
| **Height** | 52px |
| **Width** | Full width |
| **Corner radius** | 100px |

### Cards

#### Benefit Card

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Background** | `#1E1C18` | `#1E1C18` |
| **Border** | 1px `#C9A05215` | 1px `#C9A05215` |
| **Corner radius** | 16px | 16px |
| **Padding** | 24px | 32px |
| **Gap** | 14px | 16px |
| **Icon wrapper** | 44px square, r=12 | 52px square, r=14 |
| **Icon wrapper bg** | `#C9A05215` | `#C9A05215` |
| **Title** | Fraunces, 18px, 600 | Fraunces, 20px, 600 |
| **Description** | DM Sans, 14px, normal | DM Sans, 15px, normal |

#### Product Card

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Background** | `#1E1C18` | `#1E1C18` |
| **Border** | 1px `#C9A05215` | 1px `#C9A05215` |
| **Corner radius** | 16px | 16px |
| **Image height** | 200px | 240px |
| **Content padding** | 16-20px | 20-24px |
| **Tag** | DM Sans, 10px, 600, gold, uppercase, pill bg | Same |
| **Title** | Fraunces, 16-17px, 600 | Fraunces, 17-18px, 600 |
| **Description** | DM Sans, 13px | DM Sans, 13-14px |
| **Price** | DM Sans, 15-17px, 600, gold | DM Sans, 17px, 600, gold |

#### Testimonial Card

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Background** | `#161412` | `#161412` |
| **Border** | 1px `#C9A05215` | 1px `#C9A05215` |
| **Corner radius** | 20px | 20px |
| **Padding** | 32px | 48px vertical, 64px horizontal |
| **Quote mark** | Fraunces, 64px, `#C9A05240` | Fraunces, 80px, `#C9A05230` |
| **Quote text** | DM Sans, 16px, italic | DM Sans, 20px, italic |
| **Stars** | DM Sans, 14px, gold | DM Sans, 18px, gold |
| **Author** | DM Sans, 13px, 500 | DM Sans, 15px, 500 |

### Pills / Badges

| Property | Value |
|----------|-------|
| **Background** | `#C9A05215` |
| **Border** | 1px `#C9A05230` |
| **Corner radius** | 100px |
| **Padding** | 10px vertical, 24px horizontal |
| **Font** | DM Sans, 11-12px, 600 |
| **Letter spacing** | 2px |
| **Text color** | `#C9A052` |
| **Text transform** | UPPERCASE |

### Input Fields

| Property | Value |
|----------|-------|
| **Background** | transparent or `#0B0A08` |
| **Border** | 1px `#C9A05230` |
| **Corner radius** | 100px (pill) or 24px (chat) |
| **Height** | 48-56px |
| **Padding** | 0 vertical, 20-24px horizontal |
| **Placeholder** | DM Sans, 14px, normal, `#6B6860` |

---

## Icons

| Property | Value |
|----------|-------|
| **Library** | Lucide Icons |
| **Default size** | 18-20px |
| **Header icons** | 22px (mobile), 20px (desktop) |
| **Social icons** | 20px |
| **Small inline** | 14-16px |
| **Color** | Inherits from context (gold, primary, secondary) |

### Commonly Used Icons

| Icon | Lucide Name | Context |
|------|-------------|---------|
| **Menu** | `menu` | Mobile header hamburger |
| **Close** | `x` | Close buttons, mobile menu |
| **Shopping bag** | `shopping-bag` | Cart icon in header |
| **Arrow right** | `arrow-right` | CTA buttons |
| **Send** | `send` | Chat send button |
| **Instagram** | `instagram` | Social links |
| **TikTok** | `music` | Social links (TikTok) |
| **Mail** | `mail` | Social links, contact |
| **Phone** | `phone` | Business card contact |
| **Globe** | `globe` | Business card website |
| **Sparkles** | `sparkles` | AI chat header indicator |
| **Heart** | `heart` | Trust bar icon |
| **Leaf** | `leaf` | Trust bar icon |
| **Star** | `star` | Trust bar icon |
| **Award** | `award` | Trust bar icon |

---

## Page Sections (Marketing Site)

### Header

| Property | Mobile (390px) | Desktop (1440px) |
|----------|----------------|-------------------|
| **Height** | 64px | 80px |
| **Background** | `#0B0A08` | `#0B0A08` |
| **Layout** | Logo left, icons right | Logo left, nav center, CTA right |
| **Padding** | 0 vertical, 24px horizontal | 0 vertical, 80px horizontal |
| **Nav font** | N/A (hamburger menu) | DM Sans, 14px, 500 |
| **Nav gap** | N/A | 32px |
| **Logo** | Fraunces, 22px, 600, `#C9A052` | Same |
| **Mobile icons** | `menu` + `shopping-bag`, 22px | N/A |
| **Desktop CTA** | N/A | "SHOP NOW" ghost button |

### Hero Section

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Background** | Full-bleed image with gradient overlay | Same |
| **Height** | Auto (content) | Auto (content) |
| **Padding** | 48px vertical, 24px horizontal | 120px vertical, 80px horizontal |
| **Label** | DM Sans, 11px, 600, gold, LS 3 | DM Sans, 12px, 600, gold, LS 3 |
| **Headline** | Fraunces, 38px, 500, LS -0.8 | Fraunces, 64px, 500, LS -1.5 |
| **Subheading** | DM Sans, 15px, normal, LH 1.6 | DM Sans, 18px, normal, LH 1.6, w=560 |
| **CTA buttons** | Full width, stacked vertically | Inline, horizontal |
| **Section gap** | 24px | 32px |

### Trust Bar

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Background** | `#161412` | `#161412` |
| **Border top/bottom** | 1px `#1E1C18` | 1px `#1E1C18` |
| **Padding** | 20px vertical, 24px horizontal | 24px vertical, 80px horizontal |
| **Layout** | 2x2 grid | 4-column horizontal |
| **Icon** | 14px, gold | 16px, gold |
| **Text** | DM Sans, 12px, 500 | DM Sans, 13px, 500 |
| **Items** | "100% Virgin Hair", "12+ Month Lifespan", "Ethically Sourced", "Free Shipping $150+" |

### Brand Story Section

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Background** | `#0B0A08` | `#0B0A08` |
| **Padding** | 56px vertical, 24px horizontal | 80px all sides |
| **Layout** | Vertical (image top, text below) | Horizontal (image left, text right) |
| **Image** | Full width, 260px tall, r=16 | 50% width, r=16 |
| **Label** | DM Sans, 11px, 600, gold, LS 3 | DM Sans, 12px, 600, gold, LS 3 |
| **Headline** | Fraunces, 28px, 500 | Fraunces, 38px, 500 |
| **Body** | DM Sans, 14px, normal, LH 1.6 | DM Sans, 16px, normal, LH 1.6 |

### Products Section

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Background** | `#161412` | `#161412` |
| **Padding** | 56px vertical, 24px horizontal | 80px all sides |
| **Grid** | 2 columns, gap 16px | 4 columns, gap 24px |
| **Label** | "OUR COLLECTION" | Same |
| **Headline** | Fraunces, 28px | Fraunces, 42px |
| **Browse all link** | DM Sans, 14px, 500, gold + arrow | Same, 15px |

### Why Origin Section

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Background** | `#161412` | `#161412` |
| **Padding** | 56px vertical, 24px horizontal | 80px all sides |
| **Grid** | 1 column, gap 20px | 3 columns, gap 24px |
| **Label** | "WHY ORIGIN" | Same |
| **Headline** | Fraunces, 28px | Fraunces, 42px |
| **Benefits** | Ethically Sourced, Built For Longevity, Community First |

### Testimonials Section

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Background** | transparent | transparent |
| **Padding** | 56px vertical, 24px horizontal | 80px vertical, 200px horizontal |
| **Label** | "WHAT THEY SAY" | Same |
| **Layout** | Single card, full width | Single card, full width |

### Community Section

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Padding** | 56px vertical, 0 horizontal | 80px vertical, 0 horizontal |
| **Label** | "JOIN THE COLLECTIVE" | Same |
| **Headline** | Fraunces, 28px | Fraunces, 42px |
| **Handle** | `@OriginHairCollective`, `#B8816B` | Same, 16px |
| **Photo grid** | 2 rows x 3 cols, gap 3px, 130px row height | 1 row x 6 cols, gap 4px, 240px height |

### Final CTA Section

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Background** | Linear gradient (gold-tinted to black) | Same |
| **Padding** | 64px vertical, 24px horizontal | 100px vertical, 200px horizontal |
| **Headline** | Fraunces, 28px | Fraunces, 48px |
| **Subheading** | DM Sans, 15px | DM Sans, 18px, w=640 |
| **CTA text** | "SHOP NOW" | "SHOP THE COLLECTION" |
| **Trust line** | DM Sans, 12px, `#6B6860` | DM Sans, 13px |

### Footer

| Property | Mobile | Desktop |
|----------|--------|---------|
| **Background** | `#0B0A08` | `#0B0A08` |
| **Border top** | 1px `#1E1C18` | 1px `#1E1C18` |
| **Padding** | 32px vertical, 24px horizontal | 48px vertical, 80px horizontal |
| **Layout** | Stacked: logo, links, copyright | 4 columns: logo+desc, Shop, About, Connect |
| **Link columns** | Collection, Our Story, Hair Care, Wholesale | Shop (Collection, Bundles, etc.), About (Our Story, etc.), Connect (Instagram, etc.) |
| **Copyright** | DM Sans, 11px, `#4A4840` | Same |

---

## Coming Soon Pages

Three responsive variants: Mobile (390px), Tablet (768px), Desktop (1440px).

### Structure

All three share the same vertical layout:
1. **Header** - Logo centered
2. **Hero Content** - Coming Soon headline, tagline, email signup, date badge
3. **Footer** - Social icons, handle, copyright

### Key Specs

| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| **Header height** | 64px | 72px | 80px |
| **Headline** | 42px, LS 2px | 56px, LS 3px | 72px, LS 4px |
| **Tagline width** | fill | 460px | 520px |
| **Tagline size** | 14px | 15px | 16px |
| **Email input height** | 52px | 52px | 56px |
| **Accent line width** | 32px | 40px | 48px |
| **Background** | Solid + subtle radial gold glow | Same | Same |

### Email Signup Form

| Property | Value |
|----------|-------|
| **Layout** | Mobile: stacked. Desktop/Tablet: inline (input + button) |
| **Input** | Pill shape, 1px gold border (`#C9A05230`), placeholder "Enter your email" |
| **Button** | Pill, gold fill, black text, "NOTIFY ME" + arrow icon |
| **Button width** | Mobile: full. Tablet: 180px. Desktop: 200px |

---

## Chat Widget

### Mobile Chat (390px, full screen)

| Property | Value |
|----------|-------|
| **Header height** | 64px |
| **Header bg** | `#161412` |
| **Header border** | 1px bottom `#1E1C18` |
| **Body bg** | `#0B0A08` |
| **Message padding** | 20px vertical, 16px horizontal |
| **Message gap** | 16px |

### Desktop Chat Panel (400px wide)

| Property | Value |
|----------|-------|
| **Width** | 400px |
| **Height** | 600px |
| **Corner radius** | 20px top, 0 bottom |
| **Shadow** | `0 -8px 32px rgba(0, 0, 0, 0.38)` |
| **Border** | 1px `#1E1C18` |

### Chat Bubbles

| Type | Background | Text Color | Corner Radius | Padding |
|------|-----------|------------|---------------|---------|
| **AI message** | `#161412` + 1px `#1E1C18` | `#FAF7F0` (primary), `#9A9590` (meta) | [2, 16, 16, 16] | 12px vertical, 16px horizontal |
| **User message** | `#C9A052` | `#0B0A08` | [16, 2, 16, 16] | 12px vertical, 16px horizontal |

### Chat Input

| Property | Value |
|----------|-------|
| **Input bg** | `#0B0A08` |
| **Input border** | 1px `#1E1C18` |
| **Input radius** | 24px |
| **Input height** | 48px (mobile), 42px (desktop) |
| **Send button** | 44px (mobile) / 40px (desktop) circle, gold bg |
| **Send icon** | Lucide `send`, 20px, `#0B0A08` |
| **Area bg** | `#161412` |
| **Area border** | 1px top `#1E1C18` |
| **Area height** | 72px (mobile), 64px (desktop) |

### AI Avatar

| Property | Value |
|----------|-------|
| **Size** | 36px (header), 28px (inline) |
| **Shape** | Circle (r=100) |
| **Background** | `#C9A052` |
| **Content** | "O" in Fraunces, SemiBold, centered |

---

## Business Cards

Standard print dimensions: **700px x 400px** (3.5" x 2" at 200dpi).

### Front

| Property | Value |
|----------|-------|
| **Background** | `#0B0A08` |
| **Border** | 1px `#C9A05230` |
| **Corner radius** | 12px |
| **Logo** | "ORIGIN", Fraunces 42px, 600, LS 12px, `#C9A052` |
| **Subtitle** | "HAIR COLLECTIVE", DM Sans 11px, 500, LS 5px, `#9A9590` |
| **Accent lines** | 1px gold, 40px wide, above and below logo |
| **Layout** | Centered vertically and horizontally |
| **Padding** | 80px horizontal |

### Back

| Property | Value |
|----------|-------|
| **Background** | `#0B0A08` |
| **Border** | 1px `#C9A05230` |
| **Corner radius** | 12px |
| **Name** | Fraunces, 28px, 500, `#FAF7F0` |
| **Title** | DM Sans, 13px, 500, LS 1.5px, `#C9A052` |
| **Divider** | 1px, 48px wide, `#C9A05240` |
| **Contact info** | DM Sans, 12-13px, `#9A9590`, with Lucide icons (phone, mail, globe) |
| **Small logo** | Bottom right corner, smaller scale |
| **Padding** | 48px vertical, 56px horizontal |

---

## Social Media & Marketing Materials

### Coming Soon Posts

Three format variants for social media:

| Format | Dimensions | Usage |
|--------|-----------|-------|
| **IG Story (9:16)** | 390 x 693px | Instagram/TikTok Stories |
| **Square (1:1)** | 540 x 540px | Instagram Feed, Facebook |
| **Landscape (16:9)** | 700 x 394px | Twitter/X, LinkedIn, YouTube |

#### Design Pattern

- Full-bleed background image (AI-generated hair/beauty photography)
- Dark gradient overlay (70-95% opacity)
- Logo at top
- "COMING SOON" headline centered
- Gold accent lines (1px, 32-40px wide)
- Tagline text
- "SPRING 2026" date pill badge
- Social handle at bottom

### Launch Party Materials

Six format variants:

| Format | Dimensions | Usage |
|--------|-----------|-------|
| **Flyer (Letter)** | 612 x 792px | Print flyer (8.5x11") |
| **Poster (24x36)** | 480 x 720px | Print poster |
| **IG Story (9:16)** | 390 x 693px | Instagram Stories |
| **Square (1:1)** | 540 x 540px | Instagram/Facebook Feed |
| **Landscape (16:9)** | 700 x 394px | Twitter/LinkedIn banner |
| **FB Event Cover** | 820 x 312px | Facebook event cover |

#### Launch Party Design Pattern

- Full-bleed background image with dark overlay
- Event branding: "YOU'RE INVITED TO THE" label, "Launch Party" in Fraunces display (64-80px)
- Event details: Date, Time, Location
- RSVP pill badge
- Hashtag: `#OriginHairLaunch`
- Gold accent lines and dividers

#### Launch Party Details (from design)

| Detail | Value |
|--------|-------|
| **Date** | Saturday, June 13, 2026 |
| **Time** | 5 PM - 10 PM |
| **Location** | Mississauga, ON |
| **Hashtag** | #OriginHairLaunch |

---

## Favicon

### Design

Gold "O" monogram with circular ring border and accent lines on a `#0B0A08` background.

| Property | Value |
|----------|-------|
| **Font** | Fraunces, SemiBold (600) |
| **Colors** | `#C9A052` (gold) on `#0B0A08` (black) |
| **Sizes** | 16x16, 32x32, 48x48, 64x64, 256x256 |
| **Format** | ICO (multi-size) |

---

## GitHub README Banner

| Property | Value |
|----------|-------|
| **Dimensions** | 1280 x 320px |
| **Background** | `#0B0A08` with subtle gold radial glows |
| **Border** | 1px `#C9A05218` |
| **Logo** | "ORIGIN", Fraunces 56px, 600, LS 18px |
| **Subtitle** | "HAIR COLLECTIVE", DM Sans 14px, 500, LS 6px |
| **Tagline** | "Premium Hair . E-Commerce Platform", DM Sans 11px |
| **Decorative** | Top/bottom gold gradient lines, side accent lines |
| **Tech badges** | .NET, Angular, .NET Aspire, Microservices, RabbitMQ |
| **Badge style** | r=10, fill `#C9A05210`, border 1px `#C9A05225`, padding 4px/12px |

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| **Mobile** | 390px | Phones (iPhone 14 base) |
| **Tablet** | 768px | iPad / tablets |
| **Desktop** | 1440px | Standard desktop |

### Responsive Rules

1. **Mobile-first** design approach
2. **Header**: Hamburger menu on mobile, inline nav on desktop
3. **Product grid**: 2 columns mobile, 4 columns desktop
4. **Benefit cards**: Stacked on mobile, 3-column grid on desktop
5. **Brand story**: Stacked on mobile, side-by-side on desktop
6. **Photo grid**: 2 rows of 3 on mobile, 1 row of 6 on desktop
7. **Testimonials**: Narrower padding on mobile, generous horizontal padding on desktop
8. **Footer**: Single column mobile, 4-column desktop
9. **CTA buttons**: Full-width stacked on mobile, inline on desktop

---

## Design Tokens (CSS Variables)

Use these CSS custom properties in all applications for consistent theming:

```css
:root {
  /* Colors - Warm Theme (Default for consumer apps) */
  --color-accent-gold: #C9A052;
  --color-accent-gold-deep: #8B7845;
  --color-bg-primary: #0B0A08;
  --color-bg-surface: #161412;
  --color-bg-elevated: #2A2A2C;
  --color-border-divider: #1E1C18;
  --color-border-primary: #3A3A3C;
  --color-text-primary: #FAF7F0;
  --color-text-secondary: #9A9590;
  --color-text-tertiary: #6B6860;
  --color-text-muted: #4A4840;

  /* Extended colors */
  --color-gold-overlay: rgba(201, 160, 82, 0.08);   /* #C9A05215 */
  --color-gold-border: rgba(201, 160, 82, 0.19);     /* #C9A05230 */
  --color-gold-muted: rgba(201, 160, 82, 0.25);      /* #C9A05240 */
  --color-rose-accent: #B8816B;

  /* Typography */
  --font-heading: 'Fraunces', serif;
  --font-body: 'DM Sans', sans-serif;

  /* Font sizes */
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-md: 15px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 20px;
  --text-3xl: 28px;
  --text-4xl: 38px;
  --text-5xl: 42px;
  --text-6xl: 48px;
  --text-7xl: 64px;
  --text-8xl: 72px;
  --text-9xl: 80px;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 48px;
  --space-4xl: 56px;
  --space-5xl: 64px;
  --space-6xl: 80px;
  --space-7xl: 100px;

  /* Border radius */
  --radius-none: 0;
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-pill: 100px;

  /* Shadows */
  --shadow-chat: 0 -8px 32px rgba(0, 0, 0, 0.38);

  /* Breakpoints (for reference in media queries) */
  /* Mobile: 390px, Tablet: 768px, Desktop: 1440px */
}
```

### Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
```

### Lucide Icons Setup

```bash
npm install lucide-angular   # For Angular apps
```

```html
<!-- Or CDN for static pages -->
<script src="https://unpkg.com/lucide@latest"></script>
```

---

## Quick Reference Card

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Section label | DM Sans | 11-12px | 600 | `#C9A052` |
| Page headline | Fraunces | 28-64px | 500 | `#FAF7F0` |
| Body text | DM Sans | 14-18px | 400 | `#9A9590` |
| Button text | DM Sans | 14-15px | 700 | `#0B0A08` |
| Button bg | - | - | - | `#C9A052` |
| Card bg | - | - | - | `#1E1C18` |
| Card border | - | - | - | `#C9A05215` |
| Page bg | - | - | - | `#0B0A08` |
| Logo | Fraunces | 22px | 600 | `#C9A052` |
| Nav link | DM Sans | 14-18px | 500 | `#FAF7F0` |
| Price | DM Sans | 15-17px | 600 | `#C9A052` |
