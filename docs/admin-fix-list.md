# Admin Panel - Actionable Fix List

Sequential order: foundational/cross-cutting fixes first, then page-by-page from simplest to most complex.

---

## Phase 1: Cross-Cutting Fixes

These affect every page and should be done first to avoid repeating work.

### 1.1 ✅ Fix toolbar titles on all pages

- **Files:** `hero-content.html`, `trust-bar-list.html`, `inquiries-list.html`, `origins-list.html`, `testimonials-list.html`, `subscribers-list.html`, `employees-list.html`, `schedule-calendar.html`, `conversations-list.html`, `meeting-form.html`
- **Fix:** Each page's `<h1 class="toolbar-title">` currently says "Products". Change to the correct page name.
- **Effort:** Trivial

### 1.2 ✅ Add error handling to all API calls

- **Files:** `dashboard.ts`, `products-list.ts`, `origins-list.ts`, `inquiries-list.ts`, `testimonials-list.ts`, `subscribers-list.ts`, `employees-list.ts`, `schedule-calendar.ts`, `conversations-list.ts`
- **Fix:** Add `error:` callback to every `subscribe()` call. Display a snackbar/toast or inline error message on failure.
- **Effort:** Small

### 1.3 ✅ Add loading states to all list pages

- **Files:** All list page `.ts` and `.html` files
- **Fix:** Add a `loading = signal(true)` to each page. Set `false` after API response. Show `mat-spinner` or skeleton while loading. Show empty-state message when data loads but is empty.
- **Effort:** Small

### 1.4 ✅ Remove or implement toolbar search and notifications buttons

- **Files:** All 13 page `.html` files
- **Fix (option A - recommended for now):** Remove the search and notifications icon buttons from the toolbar since they are non-functional on every page.
- **Fix (option B - full implementation):** Wire toolbar search to a global search service; wire notifications to `NotificationService.getNotifications()`.
- **Effort:** Trivial (option A) or Medium (option B)

---

## Phase 2: Implement Client-Side Search on All List Pages

All list pages have a search input with no binding. Wire each one up.

### 2.1 ✅ Products List - wire search input

- **File:** `products-list.ts`, `products-list.html`
- **Fix:** Add a `searchTerm = signal('')` and a `computed` `filteredProducts` that filters `products()` by name/type/origin. Bind the search input with `(input)="searchTerm.set($event.target.value)"`. Change table `[dataSource]` to use `filteredProducts()`.
- **Effort:** Small

### 2.2 ✅ Origins List - wire search input

- **File:** `origins-list.ts`, `origins-list.html`
- **Fix:** Same pattern as 2.1, filtering by country/region/description.
- **Effort:** Small

### 2.3 ✅ Inquiries List - wire search input

- **File:** `inquiries-list.ts`, `inquiries-list.html`
- **Fix:** Same pattern, filtering by name/email/message.
- **Effort:** Small

### 2.4 ✅ Testimonials List - wire search input

- **File:** `testimonials-list.ts`, `testimonials-list.html`
- **Fix:** Same pattern, filtering by customer name/review content.
- **Effort:** Small

### 2.5 ✅ Subscribers List - wire search input

- **File:** `subscribers-list.ts`, `subscribers-list.html`
- **Fix:** Same pattern, filtering by email.
- **Effort:** Small

---

## Phase 3: Implement Pagination on All List Pages

### 3.1 ✅ Create a shared pagination pattern

- **Fix:** Decide on a reusable pagination approach. Options: (a) use Angular Material `MatPaginator`, (b) keep custom paginator UI but add signals for `pageIndex`, `pageSize`, and `totalCount`. Wire Previous/Next buttons to update page index. Use `computed` to slice data or pass offset to API.
- **Effort:** Small (design pattern)

### 3.2 ✅ Products List - wire pagination

- **File:** `products-list.ts`, `products-list.html`
- **Fix:** Add `pageIndex` and `pageSize` signals. Compute `paginatedProducts` from filtered list. Wire Previous/Next buttons. Update "Showing X products" text dynamically.
- **Effort:** Small

### 3.3 ✅ Inquiries List - wire pagination

- **File:** `inquiries-list.ts`, `inquiries-list.html`
- **Fix:** Same pattern as 3.2.
- **Effort:** Small

### 3.4 ✅ Testimonials List - wire pagination

- **File:** `testimonials-list.ts`, `testimonials-list.html`
- **Fix:** Same pattern as 3.2.
- **Effort:** Small

### 3.5 ✅ Subscribers List - wire server-side pagination

- **File:** `subscribers-list.ts`, `subscribers-list.html`
- **Fix:** `NewsletterService.getSubscribers()` already supports `pageSize` and pagination. Add `pageIndex` signal, pass `skip: pageIndex * pageSize` to the API call. Wire Previous/Next buttons to increment/decrement and re-fetch.
- **Effort:** Small

---

## Phase 4: Implement Delete Functionality on List Pages

### 4.1 ✅ Add a confirmation dialog component or utility

- **Fix:** Create a shared confirmation dialog using `MatDialog`. Accept a message and return true/false. This will be reused by all delete actions.
- **Effort:** Small

### 4.2 ✅ Subscribers List - add delete confirmation

- **File:** `subscribers-list.ts`
- **Fix:** Wrap existing `deleteSubscriber()` call with the confirmation dialog from 4.1.
- **Effort:** Trivial

### 4.3 ✅ Inquiries List - wire delete button

- **File:** `inquiries-list.ts`, `inquiries-list.html`
- **Fix:** The `InquiryService` currently has no `deleteInquiry()` method. Either: (a) add a `deleteInquiry(id)` method to the API service and backend, or (b) hide the delete button until the API exists. If API exists, add `(click)="deleteInquiry(row.id)"` with confirmation dialog.
- **Effort:** Small-Medium (depends on backend)

### 4.4 ✅ Products List - wire delete button

- **File:** `products-list.ts`, `products-list.html`
- **Fix:** `CatalogService` has no `deleteProduct()` method. Add it to the service (DELETE `/api/catalog/products/{id}`). Add `(click)="deleteProduct(row.id)"` with confirmation dialog. Reload list on success.
- **Effort:** Small-Medium (depends on backend)

### 4.5 ✅ Origins List - wire delete button

- **File:** `origins-list.ts`, `origins-list.html`
- **Fix:** `CatalogService` has no `deleteOrigin()` method. Add it. Wire button with confirmation dialog.
- **Effort:** Small-Medium (depends on backend)

### 4.6 ✅ Testimonials List - wire delete button

- **File:** `testimonials-list.ts`, `testimonials-list.html`
- **Fix:** `ContentService` has no `deleteTestimonial()` method. Add it. Wire button with confirmation dialog.
- **Effort:** Small-Medium (depends on backend)

---

## Phase 5: Product Form - Full Implementation

### 5.1 ✅ Add data binding to all product form inputs

- **File:** `product-form.ts`, `product-form.html`
- **Fix:** Import `FormsModule`. Add `ngModel` bindings to all 8 inputs: `name`, `origin`, `texture`, `type`, `lengthInches`, `price`, `imageUrl`, `description`. Add corresponding properties to the component class.
- **Effort:** Small

### 5.2 ✅ Replace hardcoded dropdown data with API data

- **File:** `product-form.ts`
- **Fix:** Inject `CatalogService`. Fetch origins from `getOrigins()` and populate the Origin dropdown from API data. For textures and types, determine if API endpoints exist or if these should remain as local enums (document the decision).
- **Effort:** Small

### 5.3 ✅ Wire "Save Product" button to API

- **File:** `product-form.ts`, `product-form.html`
- **Fix:** `CatalogService` has no `createProduct()` method. Add `createProduct(request)` to the service (POST `/api/catalog/products`). Add `onSubmit()` method: validate required fields, construct request, call API, navigate to `/products` on success, show error on failure. Add loading/saving state.
- **Effort:** Medium (depends on backend)

### 5.4 ✅ Add form validation

- **File:** `product-form.ts`, `product-form.html`
- **Fix:** Add `required` validators to name, origin, type, price. Add numeric validation to length and price. Show `mat-error` messages. Disable Save button until form is valid.
- **Effort:** Small

### 5.5 ✅ Add edit mode support (product form reuse)

- **File:** `product-form.ts`, `product-form.html`, `app.routes.ts`
- **Fix:** Add route `/products/:id/edit`. In `ProductFormPage`, check for route param `id`. If present, fetch product via `CatalogService.getProduct(id)` and pre-populate form. Change button text to "Update Product". Add `updateProduct()` to service (PUT `/api/catalog/products/{id}`).
- **Effort:** Medium

### 5.6 ✅ Wire edit buttons on Products List

- **File:** `products-list.html`
- **Fix:** Change edit button to `[routerLink]="['/products', row.id, 'edit']"`.
- **Effort:** Trivial

---

## Phase 6: Origins - Add Create/Edit Functionality

### 6.1 ✅ Create an origin form page

- **Files:** New files: `origins/origin-form.ts`, `origins/origin-form.html`, `origins/origin-form.scss`
- **Fix:** Create a form page similar to product-form with fields: country, region, description. Add `ngModel` bindings. Wire to `createOrigin()` and `updateOrigin()` service methods.
- **Effort:** Medium

### 6.2 ✅ Add service methods for origin CRUD

- **File:** `catalog.service.ts`
- **Fix:** Add `createOrigin(request)`, `updateOrigin(id, request)`, `deleteOrigin(id)` methods.
- **Effort:** Small (depends on backend)

### 6.3 ✅ Add routes for origin create/edit

- **File:** `app.routes.ts`
- **Fix:** Add `/origins/new` and `/origins/:id/edit` routes pointing to `OriginFormPage`.
- **Effort:** Trivial

### 6.4 ✅ Wire "Add Origin" and edit buttons

- **File:** `origins-list.html`
- **Fix:** Add `routerLink="/origins/new"` to "Add Origin" button. Add `[routerLink]="['/origins', row.id, 'edit']"` to edit buttons.
- **Effort:** Trivial

---

## Phase 7: Inquiries - Add View/Filter/Export

### 7.1 ✅ Wire "Status" filter button

- **File:** `inquiries-list.ts`, `inquiries-list.html`
- **Fix:** Add a status filter. Options: use a `mat-menu` dropdown or `mat-button-toggle-group` like subscribers. Filter inquiries client-side by status field (if status exists on the model) or remove the filter button if inquiries have no status field.
- **Effort:** Small

### 7.2 ✅ Wire view button to show inquiry detail

- **File:** `inquiries-list.ts`, `inquiries-list.html`
- **Fix:** Options: (a) open a `MatDialog` with the full inquiry details, or (b) create an inquiry detail page. Dialog is simpler and sufficient for viewing read-only data.
- **Effort:** Small-Medium

### 7.3 ✅ Implement "Export" button

- **File:** `inquiries-list.ts`, `inquiries-list.html`
- **Fix:** Add an `exportInquiries()` method that converts the current `inquiries()` array to CSV and triggers a browser download. No backend needed.
- **Effort:** Small

---

## Phase 8: Testimonials - Add Create/Edit Functionality

### 8.1 ✅ Create a testimonial form dialog or page

- **Fix:** `ContentService` already has `createTestimonial(request)`. Create either a dialog or a form page for adding testimonials. Fields: customer name, rating, review content.
- **Effort:** Medium

### 8.2 ✅ Wire "Add Testimonial" button

- **File:** `testimonials-list.html`
- **Fix:** Open the testimonial form dialog or navigate to the form page.
- **Effort:** Trivial

### 8.3 ✅ Wire edit buttons

- **Fix:** Add edit capability. Requires `updateTestimonial()` service method and backend support.
- **Effort:** Medium (depends on backend)

---

## Phase 9: Products List - Wire Filter Buttons

### 9.1 ✅ Implement Type filter

- **File:** `products-list.ts`, `products-list.html`
- **Fix:** Replace the plain button with a `mat-menu` or dropdown. Extract unique types from products. Filter `filteredProducts` computed signal by selected type.
- **Effort:** Small

### 9.2 ✅ Implement Origin filter

- **File:** `products-list.ts`, `products-list.html`
- **Fix:** Same pattern as 9.1 for origin country.
- **Effort:** Small

### 9.3 ✅ Implement Texture filter

- **File:** `products-list.ts`, `products-list.html`
- **Fix:** Same pattern as 9.1 for texture.
- **Effort:** Small

---

## Phase 10: Employees - Add View/Edit Functionality

### 10.1 ✅ Create an employee detail/edit page

- **Files:** New files or dialog
- **Fix:** `SchedulingService` has `getEmployee(id)`, `updateEmployee(id, request)`. Create a page or dialog to view and edit employee details.
- **Effort:** Medium

### 10.2 ✅ Add routes and wire list buttons

- **File:** `app.routes.ts`, `employees-list.html`
- **Fix:** Add route `/employees/:id`. Wire view and edit buttons.
- **Effort:** Small

### 10.3 ✅ Use server-side status filtering

- **File:** `employees-list.ts`
- **Fix:** Change `onStatusChange()` to call `SchedulingService.getEmployees(status)` with the selected status instead of fetching all and filtering client-side.
- **Effort:** Trivial

---

## Phase 11: Hero Content - Full Implementation

### 11.1 ✅ Determine API strategy

- **Fix:** No API endpoint exists for hero content. Either: (a) add a hero content endpoint to the Content microservice (e.g., GET/PUT `/api/content/hero`), or (b) use the existing `ContentService.getPages()` / `getPage('hero')` if hero content is stored as a page.
- **Effort:** Medium-Large (backend work)

### 11.2 ✅ Add data binding to hero content form

- **File:** `hero-content.ts`, `hero-content.html`
- **Fix:** Add properties: `heroTitle`, `heroSubtitle`, `ctaButtonText`, `ctaButtonLink`. Add `[(ngModel)]` to all inputs. Import `FormsModule`.
- **Effort:** Small

### 11.3 ✅ Wire "Save Changes" button

- **File:** `hero-content.ts`, `hero-content.html`
- **Fix:** Inject the content service. Add `onSave()` method to POST/PUT data. Add loading state and error handling. Add `(click)="onSave()"` to button.
- **Effort:** Small (after 11.1 is done)

### 11.4 ✅ Wire "Reset" button

- **File:** `hero-content.ts`, `hero-content.html`
- **Fix:** Store the original loaded values. `onReset()` restores the form fields to original values.
- **Effort:** Trivial

### 11.5 ✅ Implement image upload

- **File:** `hero-content.ts`, `hero-content.html`
- **Fix:** Add a hidden `<input type="file">` element. Wire the upload area click to trigger it. On file select, upload via `SchedulingService.uploadFile()` (or a new content upload endpoint). Display preview after upload.
- **Effort:** Medium

---

## Phase 12: Trust Bar - Full Implementation

### 12.1 ✅ Determine API strategy

- **Fix:** No API endpoint exists for trust bar items. Add a trust bar endpoint to the Content microservice (e.g., GET/POST/PUT/DELETE `/api/content/trust-bar`).
- **Effort:** Medium-Large (backend work)

### 12.2 ✅ Replace hardcoded data with API fetch

- **File:** `trust-bar-list.ts`
- **Fix:** Inject `ContentService` (or new service). Replace hardcoded `items` array with a signal populated from an API call.
- **Effort:** Small (after 12.1 is done)

### 12.3 ✅ Add trust bar item form dialog

- **Fix:** Create a `MatDialog`-based form for add/edit with fields: icon (icon picker or text input), label, description, order, status. Wire to create/update API.
- **Effort:** Medium

### 12.4 ✅ Wire "Add Item", edit, and delete buttons

- **File:** `trust-bar-list.ts`, `trust-bar-list.html`
- **Fix:** "Add Item" opens dialog in create mode. Edit opens dialog in edit mode with pre-populated data. Delete calls API with confirmation dialog.
- **Effort:** Small

---

## Phase 13: Schedule Calendar - Add Edit/Cancel Capabilities

### 13.1 ✅ Add cancel meeting action to event detail panel

- **File:** `schedule-calendar.ts`, `schedule-calendar.html`
- **Fix:** When an event is selected and its detail panel shows, add a "Cancel Meeting" button. Wire to `SchedulingService.cancelMeeting(id)`. Reload events on success.
- **Effort:** Small

### 13.2 ✅ Add edit meeting action

- **File:** `schedule-calendar.ts`, `schedule-calendar.html`, `app.routes.ts`
- **Fix:** Add an "Edit" button to the event detail panel. Either navigate to `/meetings/:id/edit` (requires making the meeting form support edit mode) or open a dialog.
- **Effort:** Medium

---

## Phase 14: Conversations - Fix Auth and Real-Time

### 14.1 ✅ Replace hardcoded sender with authenticated user

- **File:** `conversations-list.ts`
- **Fix:** Inject `AuthService` (or a current-employee service). Replace `this.employees()[0]?.id` on lines 89 and 115 with the actual authenticated user's employee ID.
- **Effort:** Small

### 14.2 ✅ Add real-time message updates via SignalR

- **File:** `conversations-list.ts`
- **Fix:** `TeamHubService` already exists with `ReceiveMessage` event. Subscribe to incoming messages and update the active conversation in real-time. Join/leave channels when selecting conversations.
- **Effort:** Medium

### 14.3 ✅ Auto-refresh conversation list after sending messages

- **File:** `conversations-list.ts`
- **Fix:** After `sendMessage()` succeeds, also call `loadConversations()` to refresh the sidebar's last-message timestamps.
- **Effort:** Trivial

---

## Phase 15: Meeting Form - Bug Fixes

### 15.1 ✅ Remove or wire the `sendEmail` checkbox

- **File:** `meeting-form.ts`
- **Fix:** The `sendEmail` value is captured but never included in `CreateMeetingRequest`. Either: (a) add `sendEmail` to the request type and backend, or (b) remove the checkbox from the UI.
- **Effort:** Trivial

### 15.2 ✅ Add start/end time validation

- **File:** `meeting-form.ts`
- **Fix:** In `onSubmit()`, validate that `endTime` is after `startTime`. Show error if not.
- **Effort:** Trivial

### 15.3 ✅ Fix .ics download race condition

- **File:** `meeting-form.ts`
- **Fix:** Only navigate to `/schedule` after the `.ics` download completes (or in `finalize()`). Currently navigation fires immediately, potentially before the blob downloads.
- **Effort:** Trivial

---

## Phase 16: Dashboard - Dynamic Greeting

### 16.1 ✅ Replace hardcoded "Quinn" with authenticated user name

- **File:** `dashboard.ts`, `dashboard.html`
- **Fix:** Inject `AuthService`. Read the user's name from the auth state. Replace `"Welcome back, Quinn"` with `"Welcome back, {{ userName() }}"`.
- **Effort:** Trivial

---

## Summary by Priority

| Priority | Items | Effort |
|---|---|---|
| **P0 - Quick wins** | 1.1, 1.4a, 4.2, 5.6, 6.4, 14.3, 15.1, 15.2, 15.3, 16.1, 10.3 | Trivial each |
| **P1 - Foundational** | 1.2, 1.3, 4.1 | Small each, enables later work |
| **P2 - Search** | 2.1-2.5 | Small, all same pattern |
| **P3 - Pagination** | 3.1-3.5 | Small, all same pattern |
| **P4 - Product CRUD** | 5.1-5.5 | Medium, high user impact |
| **P5 - Delete actions** | 4.3-4.6 | Small-Medium, depends on backend |
| **P6 - Origin CRUD** | 6.1-6.3 | Medium |
| **P7 - Inquiry features** | 7.1-7.3 | Small-Medium |
| **P8 - Testimonial CRUD** | 8.1-8.3 | Medium |
| **P9 - Product filters** | 9.1-9.3 | Small |
| **P10 - Employee CRUD** | 10.1-10.2 | Medium |
| **P11 - Hero content** | 11.1-11.5 | Medium-Large (backend needed) |
| **P12 - Trust bar** | 12.1-12.4 | Medium-Large (backend needed) |
| **P13 - Calendar edit** | 13.1-13.2 | Small-Medium |
| **P14 - Conversations auth** | 14.1-14.2 | Small-Medium |
