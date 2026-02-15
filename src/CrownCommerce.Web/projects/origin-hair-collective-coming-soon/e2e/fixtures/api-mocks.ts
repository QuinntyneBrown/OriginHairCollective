import { Page } from '@playwright/test';

/**
 * Sets up API route mocks for the origin-hair-collective app.
 *
 * The catch-all is registered first (least-specific),
 * and more specific routes are registered after (Playwright LIFO).
 */
export async function setupApiMocks(page: Page): Promise<void> {
  // Catch-all for any API calls – return an empty array by default
  // so that @for loops in templates do not throw Symbol.iterator errors.
  await page.route('**/api/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Newsletter subscription (matches the actual NewsletterService endpoint)
  await page.route('**/api/newsletters/subscribe', (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ email: body?.email, subscribedAt: new Date().toISOString() }),
      });
    } else {
      route.fallback();
    }
  });
}

/**
 * Sets up a failing newsletter subscription mock (e.g. duplicate email).
 */
export async function setupEmailAlreadySubscribedMock(page: Page): Promise<void> {
  await page.route('**/api/newsletters/subscribe', (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Email already subscribed' }),
      });
    } else {
      route.fallback();
    }
  });
}
