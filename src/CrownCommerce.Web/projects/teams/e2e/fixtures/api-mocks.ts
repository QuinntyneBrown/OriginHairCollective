import { Page, Route } from '@playwright/test';
import {
  mockAuthResponse,
  mockCurrentEmployee,
  mockEmployees,
  mockChannels,
  mockChannelMessages,
  mockSentMessage,
  mockUpcomingMeetings,
  mockCalendarEvents,
  mockActivityFeed,
  mockCreatedMeeting,
  mockCreatedChannel,
} from './mock-data';

/**
 * Injects auth tokens into localStorage so the auth guard passes.
 */
export async function injectAuth(page: Page): Promise<void> {
  await page.addInitScript((authData) => {
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_user', JSON.stringify(authData));
  }, mockAuthResponse);
}

function json(route: Route, body: unknown, status = 200): Promise<void> {
  return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}

/**
 * Sets up all API route mocks for the teams application.
 * Uses a single route handler to avoid Playwright LIFO ordering issues.
 */
export async function setupApiMocks(page: Page): Promise<void> {
  // ── SignalR Hub Negotiate ──
  await page.route('**/hubs/team/negotiate**', (route) => {
    json(route, {
      connectionId: 'mock-connection-id',
      connectionToken: 'mock-connection-token',
      negotiateVersion: 1,
      availableTransports: [
        { transport: 'WebSockets', transferFormats: ['Text', 'Binary'] },
      ],
    });
  });

  // ── SignalR WebSocket ──
  await page.routeWebSocket('**/hubs/team**', (ws) => {
    ws.onMessage((message) => {
      if (typeof message === 'string' && message.includes('"protocol":"json"')) {
        ws.send('{}\x1e');
      }
    });
  });

  // ── Single handler for all /api/ requests ──
  await page.route('**/api/**', (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // ── Auth ──
    if (url.includes('/api/identity/auth/login') && method === 'POST') {
      return json(route, mockAuthResponse);
    }

    // ── Employees ──
    if (url.includes('/employees/me')) {
      return json(route, mockCurrentEmployee);
    }
    if (url.match(/\/employees\/[^/]+\/presence/) && method === 'PUT') {
      return json(route, mockCurrentEmployee);
    }
    if (url.includes('/employees')) {
      return json(route, mockEmployees);
    }

    // ── Channel Messages (must check before /channels) ──
    if (url.match(/\/channels\/[^/]+\/messages\/search/)) {
      return json(route, mockChannelMessages.slice(0, 1));
    }
    if (url.match(/\/channels\/[^/]+\/messages\/[^/]+\/reactions/)) {
      if (method === 'POST') return json(route, {});
      if (method === 'DELETE') return route.fulfill({ status: 204 });
      return json(route, {});
    }
    if (url.match(/\/channels\/[^/]+\/messages\/[^/]+/) && !url.includes('/reactions')) {
      if (method === 'PUT') {
        const body = route.request().postDataJSON();
        return json(route, { ...mockChannelMessages[1], content: body?.content ?? 'edited' });
      }
      if (method === 'DELETE') return route.fulfill({ status: 204 });
      return json(route, {});
    }
    if (url.match(/\/channels\/[^/]+\/messages/)) {
      if (method === 'POST') return json(route, mockSentMessage, 201);
      return json(route, mockChannelMessages);
    }
    if (url.match(/\/channels\/[^/]+\/read/)) {
      return json(route, {});
    }

    // ── Channels ──
    if (url.includes('/channels')) {
      if (method === 'POST') return json(route, mockCreatedChannel, 201);
      return json(route, mockChannels);
    }

    // ── Meetings ──
    if (url.includes('/meetings/upcoming')) {
      return json(route, mockUpcomingMeetings);
    }
    if (url.includes('/meetings/calendar')) {
      return json(route, mockCalendarEvents);
    }
    if (url.match(/\/meetings\/[^/]+\/respond\//)) {
      return json(route, mockUpcomingMeetings[0]);
    }
    if (url.match(/\/meetings\/[^/]+\/cancel/)) {
      return json(route, {});
    }
    if (url.match(/\/meetings\/[^/]+\/ical/)) {
      return route.fulfill({ status: 200, contentType: 'text/calendar', body: 'BEGIN:VCALENDAR\nEND:VCALENDAR' });
    }
    if (url.includes('/meetings')) {
      if (method === 'POST') return json(route, mockCreatedMeeting, 201);
      if (method === 'PUT') return json(route, mockCreatedMeeting);
      return json(route, []);
    }

    // ── Activity Feed ──
    if (url.includes('/activity')) {
      return json(route, mockActivityFeed);
    }

    // ── Files ──
    if (url.includes('/files')) {
      if (method === 'POST') {
        return json(route, {
          id: 'file-001',
          fileName: 'test.pdf',
          contentType: 'application/pdf',
          sizeBytes: 12345,
          url: '/files/test.pdf',
          uploadedByEmployeeId: 'emp-001',
          messageId: null,
          uploadedAt: new Date().toISOString(),
        }, 201);
      }
      if (method === 'DELETE') return route.fulfill({ status: 204 });
      return json(route, {});
    }

    // ── Calls ──
    if (url.includes('/calls/')) {
      return json(route, { token: 'mock-call-token', roomUrl: 'https://meet.example.com/room' });
    }

    // ── Catch-all ──
    return json(route, {});
  });
}
