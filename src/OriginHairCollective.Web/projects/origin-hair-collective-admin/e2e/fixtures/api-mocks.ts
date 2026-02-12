import { Page } from '@playwright/test';
import {
  mockProducts,
  mockOrigins,
  mockInquiries,
  mockTestimonials,
  mockTrustBarItems,
  mockHeroContent,
  mockAuthResponse,
  mockCredentials,
} from './mock-data';

/**
 * Sets up API route mocks for all admin endpoints.
 * Routes are registered from least-specific to most-specific because
 * Playwright evaluates route handlers in LIFO (last-registered-first) order.
 */
export async function setupApiMocks(page: Page): Promise<void> {
  // Catch-all for any unmatched API calls (registered first = checked last)
  await page.route('**/api/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  // WebSocket mock for notifications
  await page.routeWebSocket('**/ws/notifications', (ws) => {
    ws.onMessage(() => {
      // No-op: will be wired up when real WebSocket is added
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

  // Auth / Identity (handles both login and profile endpoints)
  await page.route('**/api/identity/**', (route) => {
    const url = route.request().url();

    if (url.includes('/auth/login') && route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      if (
        body?.email === mockCredentials.valid.email &&
        body?.password === mockCredentials.valid.password
      ) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockAuthResponse),
        });
      } else {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Unauthorized' }),
        });
      }
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ username: 'quinn', role: 'admin' }),
      });
    }
  });
}

/**
 * Seeds localStorage with a mock auth token so the auth guard
 * allows navigation to protected routes. Call this BEFORE page.goto().
 */
export async function seedAuth(page: Page): Promise<void> {
  await page.addInitScript((authData) => {
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_user', JSON.stringify(authData));
  }, mockAuthResponse);
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
