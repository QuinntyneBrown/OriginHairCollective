import { Page } from '@playwright/test';
import {
  mockProducts,
  mockOrigins,
  mockInquiries,
  mockTestimonials,
  mockTrustBarItems,
  mockHeroContent,
  mockSubscriberStats,
  mockSubscribersPagedResult,
  mockEmployees,
  mockCurrentEmployee,
  mockCalendarEvents,
  mockConversations,
  mockConversationDetail,
} from './mock-data';

/**
 * Sets up API route mocks for all admin endpoints.
 * These are dormant while the app uses hardcoded data,
 * but will automatically intercept once HttpClient is wired up.
 */
export async function setupApiMocks(page: Page): Promise<void> {
  // Products (single product must come before list pattern)
  await page.route('**/api/catalog/products/*', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'prod-1', ...mockProducts[0] }),
      });
    } else if (method === 'PUT') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'prod-1', ...mockProducts[0] }),
      });
    } else if (method === 'DELETE') {
      route.fulfill({ status: 204, body: '' });
    } else {
      route.fallback();
    }
  });

  // Products list
  await page.route('**/api/catalog/products**', (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'new-product-id', ...mockProducts[0] }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      });
    }
  });

  // Origins (single origin must come before list pattern)
  await page.route('**/api/catalog/origins/*', (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'origin-1', country: 'Cambodia', region: 'Phnom Penh', description: 'Naturally thick, durable hair' }),
      });
    } else if (method === 'PUT') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'origin-1', country: 'Cambodia', region: 'Phnom Penh', description: 'Updated description' }),
      });
    } else if (method === 'DELETE') {
      route.fulfill({ status: 204, body: '' });
    } else {
      route.fallback();
    }
  });

  // Origins list
  await page.route('**/api/catalog/origins**', (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'new-origin-id', country: 'Thailand', region: 'Bangkok', description: 'New origin' }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrigins),
      });
    }
  });

  // Inquiries (single must come before list)
  await page.route('**/api/inquiries/inquiries/*', (route) => {
    if (route.request().method() === 'DELETE') {
      route.fulfill({ status: 204, body: '' });
    } else {
      route.fallback();
    }
  });

  // Inquiries list
  await page.route('**/api/inquiries**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockInquiries),
    });
  });

  // Subscriber stats (must come before admin/subscribers pattern)
  await page.route('**/api/newsletters/admin/subscribers/stats', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSubscriberStats),
    });
  });

  // Subscriber single (delete)
  await page.route(/\/api\/newsletters\/admin\/subscribers\/[^/]+$/, (route) => {
    if (route.request().method() === 'DELETE') {
      route.fulfill({ status: 204, body: '' });
    } else {
      route.fallback();
    }
  });

  // Subscribers list
  await page.route('**/api/newsletters/admin/subscribers**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSubscribersPagedResult),
    });
  });

  // Newsletter public endpoints
  await page.route('**/api/newsletters/subscribe', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Subscribed' }),
    });
  });

  // Scheduling: employees/me (must come before employees/*)
  await page.route('**/api/scheduling/employees/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCurrentEmployee),
    });
  });

  // Scheduling: single employee
  await page.route(/\/api\/scheduling\/employees\/(?!me)[^/]+$/, (route) => {
    const method = route.request().method();
    if (method === 'PUT') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEmployees[0]),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockEmployees[0]),
      });
    }
  });

  // Scheduling: employees list
  await page.route('**/api/scheduling/employees**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockEmployees),
    });
  });

  // Scheduling: meeting actions (cancel, ical)
  await page.route(/\/api\/scheduling\/meetings\/[^/]+\/(cancel|ical)/, (route) => {
    if (route.request().url().includes('/ical')) {
      route.fulfill({
        status: 200,
        contentType: 'text/calendar',
        body: 'BEGIN:VCALENDAR\nEND:VCALENDAR',
      });
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    }
  });

  // Scheduling: calendar events
  await page.route('**/api/scheduling/meetings/calendar**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCalendarEvents),
    });
  });

  // Scheduling: single meeting
  await page.route(/\/api\/scheduling\/meetings\/[^/]+$/, (route) => {
    const method = route.request().method();
    if (method === 'PUT') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'mtg-1', title: 'Updated Meeting' }),
      });
    } else if (method === 'DELETE') {
      route.fulfill({ status: 204, body: '' });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'mtg-1', title: 'Weekly Sync', attendees: [] }),
      });
    }
  });

  // Scheduling: meetings list / create
  await page.route('**/api/scheduling/meetings**', (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'new-meeting-id', title: 'New Meeting', attendees: [] }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    }
  });

  // Scheduling: conversation messages
  await page.route('**/api/scheduling/conversations/*/messages', (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'new-msg', senderEmployeeId: 'emp-1', content: 'New message', sentAt: new Date().toISOString() }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockConversationDetail.messages),
      });
    }
  });

  // Scheduling: single conversation
  await page.route(/\/api\/scheduling\/conversations\/[^/]+$/, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockConversationDetail),
    });
  });

  // Scheduling: conversations list / create
  await page.route('**/api/scheduling/conversations**', (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockConversationDetail),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockConversations),
      });
    }
  });

  // Testimonials (single must come before list)
  await page.route(/\/api\/content\/testimonials\/[^/]+$/, (route) => {
    const method = route.request().method();
    if (method === 'PUT') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-1' }),
      });
    } else if (method === 'DELETE') {
      route.fulfill({ status: 204, body: '' });
    } else {
      route.fallback();
    }
  });

  // Testimonials list / create
  await page.route('**/api/content/testimonials**', (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'new-testimonial' }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockTestimonials),
      });
    }
  });

  // Hero content
  await page.route('**/api/content/hero**', (route) => {
    const method = route.request().method();
    if (method === 'PUT') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...mockHeroContent, title: 'Updated Title' }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockHeroContent),
      });
    }
  });

  // Trust bar
  await page.route('**/api/content/trust-bar**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockTrustBarItems),
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
