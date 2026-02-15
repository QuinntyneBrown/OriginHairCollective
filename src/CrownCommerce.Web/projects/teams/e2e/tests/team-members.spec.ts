import { test, expect } from '@playwright/test';
import { TeamMembersPage } from '../page-objects/pages/team-members.page';
import { setupApiMocks, injectAuth } from '../fixtures/api-mocks';
import { mockEmployees } from '../fixtures/mock-data';

test.describe('Team Members Page', () => {
  let teamPage: TeamMembersPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await injectAuth(page);
    teamPage = new TeamMembersPage(page);
    await teamPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display the page title', async () => {
      await expect(teamPage.pageTitle).toBeVisible();
      await expect(teamPage.pageTitle).toHaveText('Team Members');
    });

    test('should display member count in subtitle', async () => {
      await expect(teamPage.pageSubtitle).toBeVisible();
      await expect(teamPage.pageSubtitle).toContainText('members');
    });

    test('should display the invite button', async () => {
      await expect(teamPage.inviteButton).toBeVisible();
      await expect(teamPage.inviteButton).toContainText('Invite');
    });
  });

  test.describe('Filters', () => {
    test('should display the search input', async () => {
      await expect(teamPage.searchInput).toBeVisible();
      await expect(teamPage.searchInput).toHaveAttribute('placeholder', 'Search members...');
    });

    test('should display status filter toggles', async () => {
      await expect(teamPage.statusToggle).toBeVisible();
    });

    test('should display All filter with total count', async ({ page }) => {
      const allToggle = page.locator('mat-button-toggle[value="all"]');
      await expect(allToggle).toBeVisible();
      await expect(allToggle).toContainText('All');
    });

    test('should display Online filter', async ({ page }) => {
      const onlineToggle = page.locator('mat-button-toggle[value="online"]');
      await expect(onlineToggle).toBeVisible();
      await expect(onlineToggle).toContainText('Online');
    });

    test('should display Away filter', async ({ page }) => {
      const awayToggle = page.locator('mat-button-toggle[value="away"]');
      await expect(awayToggle).toBeVisible();
      await expect(awayToggle).toContainText('Away');
    });
  });

  test.describe('Members Grid', () => {
    test('should display all member cards', async () => {
      await expect(teamPage.memberCards).toHaveCount(mockEmployees.length);
    });

    test('should display first member name', async () => {
      const name = await teamPage.getMemberName(0);
      expect(name).toBe(`${mockEmployees[0].firstName} ${mockEmployees[0].lastName}`);
    });

    test('should display first member role', async () => {
      const role = await teamPage.getMemberRole(0);
      expect(role).toBe(mockEmployees[0].jobTitle);
    });

    test('should display first member department', async () => {
      const dept = await teamPage.getMemberDepartment(0);
      expect(dept).toBe(mockEmployees[0].department);
    });

    test('should display member initials', async () => {
      const initials = await teamPage.getMemberInitials(0);
      expect(initials).toBe('QM');
    });

    test('should display status dot for each member', async () => {
      const statusDot = teamPage.memberCards.first().locator('.status-dot');
      await expect(statusDot).toBeVisible();
    });

    test('should display chat action button', async () => {
      const chatBtn = teamPage.memberCards.first().locator('.action-btn', { hasText: 'chat' });
      await expect(chatBtn).toBeVisible();
    });

    test('should display video call action button', async () => {
      const videoBtn = teamPage.memberCards.first().locator('.action-btn', { hasText: 'videocam' });
      await expect(videoBtn).toBeVisible();
    });
  });

  test.describe('Status Filtering', () => {
    test('should filter to show only online members', async () => {
      await teamPage.filterByStatus('online');
      const onlineCount = mockEmployees.filter((e) => e.presence.toLowerCase() === 'online').length;
      await expect(teamPage.memberCards).toHaveCount(onlineCount);
    });

    test('should filter to show only away members', async () => {
      await teamPage.filterByStatus('away');
      const awayCount = mockEmployees.filter((e) => e.presence.toLowerCase() === 'away').length;
      await expect(teamPage.memberCards).toHaveCount(awayCount);
    });

    test('should show all members when "All" filter is selected', async () => {
      await teamPage.filterByStatus('online');
      await teamPage.filterByStatus('all');
      await expect(teamPage.memberCards).toHaveCount(mockEmployees.length);
    });
  });

  test.describe('Search', () => {
    test('should filter members by search query', async ({ page }) => {
      // Mock a filtered response
      await page.route('**/api/scheduling/employees**', (route) => {
        const url = route.request().url();
        if (url.includes('/employees/me') || url.includes('/presence')) {
          route.fallback();
          return;
        }
        const urlObj = new URL(url);
        const search = urlObj.searchParams.get('search');
        if (search) {
          const filtered = mockEmployees.filter(
            (e) =>
              `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase())
          );
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(filtered),
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockEmployees),
          });
        }
      });

      await teamPage.searchMembers('Sarah');
      // Wait for debounce (300ms)
      await page.waitForTimeout(500);
      await expect(teamPage.memberCards).toHaveCount(1);
      const name = await teamPage.getMemberName(0);
      expect(name).toBe('Sarah Lee');
    });
  });

  test.describe('Empty State', () => {
    test('should display empty state when no members match filter', async ({ page }) => {
      // Mock empty response for search
      await page.route('**/api/scheduling/employees**', (route) => {
        const url = route.request().url();
        if (url.includes('/employees/me') || url.includes('/presence')) {
          route.fallback();
          return;
        }
        const urlObj = new URL(url);
        const search = urlObj.searchParams.get('search');
        if (search) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]),
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockEmployees),
          });
        }
      });

      await teamPage.searchMembers('nonexistentperson');
      await page.waitForTimeout(500);
      await expect(teamPage.emptyState).toBeVisible();
      await expect(teamPage.emptyState).toContainText('No members found');
    });
  });
});
