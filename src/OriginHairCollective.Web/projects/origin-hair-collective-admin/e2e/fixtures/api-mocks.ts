import { Page } from '@playwright/test';
import {
  mockProducts,
  mockOrigins,
  mockInquiries,
  mockTestimonials,
  mockTrustBarItems,
  mockHeroContent,
} from './mock-data';

/**
 * Sets up API route mocks for all admin endpoints.
 * These are dormant while the app uses hardcoded data,
 * but will automatically intercept once HttpClient is wired up.
 */
export async function setupApiMocks(page: Page): Promise<void> {
  // Products
  await page.route('**/api/catalog/products**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockProducts),
    });
  });

  // Origins
  await page.route('**/api/catalog/origins**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockOrigins),
    });
  });

  // Inquiries
  await page.route('**/api/inquiries**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockInquiries),
    });
  });

  // Hero content
  await page.route('**/api/content/hero**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockHeroContent),
    });
  });

  // Trust bar
  await page.route('**/api/content/trust-bar**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTrustBarItems),
    });
  });

  // Testimonials
  await page.route('**/api/content/testimonials**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTestimonials),
    });
  });

  // Auth / Identity
  await page.route('**/api/identity/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ username: 'quinn', role: 'admin' }),
    });
  });

  // Notifications
  await page.route('**/api/notifications/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // WebSocket mock for notifications
  await page.routeWebSocket('**/ws/notifications', (ws) => {
    ws.onMessage(() => {
      // No-op: will be wired up when real WebSocket is added
    });
  });

  // Catch-all for any other API calls
  await page.route('**/api/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

/** Mock for POST /api/catalog/products (create product) */
export async function setupProductCreateMock(page: Page): Promise<void> {
  await page.route('**/api/catalog/products', (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'new-product-id', ...mockProducts[0] }),
      });
    } else {
      route.fallback();
    }
  });
}

/** Mock for PUT /api/content/hero (save hero content) */
export async function setupHeroContentSaveMock(page: Page): Promise<void> {
  await page.route('**/api/content/hero', (route) => {
    if (route.request().method() === 'PUT') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockHeroContent, title: 'Updated Title' }),
      });
    } else {
      route.fallback();
    }
  });
}
