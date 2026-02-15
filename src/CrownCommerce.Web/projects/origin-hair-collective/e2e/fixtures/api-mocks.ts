import { Page, Route } from '@playwright/test';
import {
  mockProducts,
  mockTestimonials,
  mockGalleryImages,
  mockNewsletterResponse,
} from './mock-data';

function json(route: Route, body: unknown, status = 200): Promise<void> {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

/**
 * Sets up all API route mocks for the Origin Hair Collective application.
 */
export async function setupApiMocks(page: Page): Promise<void> {
  await page.route('**/api/**', (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // ── Catalog / Products ──
    if (url.includes('/api/catalog/products') && method === 'GET') {
      return json(route, mockProducts);
    }
    if (url.match(/\/api\/catalog\/products\/[^/]+$/) && method === 'GET') {
      return json(route, mockProducts[0]);
    }

    // ── Content ──
    if (url.includes('/api/content/testimonials')) {
      return json(route, mockTestimonials);
    }
    if (url.includes('/api/content/gallery')) {
      return json(route, mockGalleryImages);
    }
    if (url.match(/\/api\/content\/pages\/[^/]+$/)) {
      return json(route, {
        slug: 'about',
        title: 'Our Story',
        sections: [{ type: 'text', content: 'Origin Hair Collective was born in Mississauga.' }],
      });
    }

    // ── Newsletter ──
    if (url.includes('/api/newsletter/subscribe') && method === 'POST') {
      return json(route, mockNewsletterResponse, 201);
    }
    if (url.includes('/api/newsletter/confirm')) {
      return json(route, {});
    }
    if (url.includes('/api/newsletter/unsubscribe')) {
      return json(route, {});
    }

    // ── Chat ──
    if (url.includes('/api/chat')) {
      return json(route, {
        id: 'conv-001',
        messages: [{ role: 'assistant', content: 'Hi! How can I help you today?' }],
      });
    }

    // ── Catch-all ──
    return json(route, {});
  });
}
