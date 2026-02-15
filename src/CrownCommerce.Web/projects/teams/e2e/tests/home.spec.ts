import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';
import { setupApiMocks, injectAuth } from '../fixtures/api-mocks';
import { mockActivityFeed } from '../fixtures/mock-data';

test.describe('Home Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await injectAuth(page);
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test.describe('Page Header', () => {
    test('should display greeting with user name', async () => {
      await expect(homePage.pageTitle).toBeVisible();
      await expect(homePage.pageTitle).toContainText('Quinn');
    });

    test('should display today\'s date', async () => {
      await expect(homePage.pageSubtitle).toBeVisible();
      // Should contain a day of the week
      await expect(homePage.pageSubtitle).toContainText(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
    });
  });

  test.describe('Team Time Zones', () => {
    test('should display the time zones section title', async () => {
      await expect(homePage.sectionTitles.first()).toHaveText('Team Time Zones');
    });

    test('should display 6 timezone cards', async () => {
      await expect(homePage.timeZoneCards).toHaveCount(6);
    });

    test('should display San Francisco timezone', async () => {
      await expect(homePage.timeZoneCards.first()).toContainText('San Francisco');
    });

    test('should display timezone labels', async () => {
      await expect(homePage.timeZoneCards.first()).toContainText('PST');
    });
  });

  test.describe('Upcoming Meetings', () => {
    test('should display the meetings section title', async () => {
      const meetingsTitle = homePage.sectionTitles.filter({ hasText: 'Upcoming Meetings' });
      await expect(meetingsTitle).toBeVisible();
    });

    test('should display 2 upcoming meeting cards', async () => {
      await expect(homePage.meetingCards).toHaveCount(2);
    });

    test('should display first meeting title', async () => {
      const title = await homePage.getMeetingTitle(0);
      expect(title).toBe('Sprint Planning');
    });

    test('should display meeting time range', async () => {
      const time = await homePage.getMeetingTime(0);
      expect(time).toContain('-');
    });

    test('should display participant avatars', async () => {
      const participants = homePage.meetingCards.first().locator('.participant-avatar');
      await expect(participants.first()).toBeVisible();
    });
  });

  test.describe('Recent Activity', () => {
    test('should display the activity section title', async () => {
      const activityTitle = homePage.sectionTitles.filter({ hasText: 'Recent Activity' });
      await expect(activityTitle).toBeVisible();
    });

    test('should display activity items', async () => {
      await expect(homePage.activityItems).toHaveCount(mockActivityFeed.length);
    });

    test('should display first activity title', async () => {
      const title = await homePage.getActivityTitle(0);
      expect(title).toBe(mockActivityFeed[0].title);
    });

    test('should display first activity description', async () => {
      const desc = await homePage.getActivityDescription(0);
      expect(desc).toBe(mockActivityFeed[0].description);
    });
  });

  test.describe('Search', () => {
    test('should open search overlay when search button is clicked', async () => {
      await homePage.searchButton.click();
      await expect(homePage.searchOverlay).toBeVisible();
    });

    test('should close search overlay when close button is clicked', async ({ page }) => {
      await homePage.searchButton.click();
      await expect(homePage.searchOverlay).toBeVisible();
      await page.locator('.search-overlay button', { hasText: 'close' }).click();
      await expect(homePage.searchOverlay).not.toBeVisible();
    });

    test('should display "No results found" for unmatched search', async () => {
      await homePage.searchButton.click();
      await homePage.searchInput.fill('xyznonexistent');
      await expect(homePage.searchOverlay.locator('.search-empty')).toHaveText('No results found');
    });

    test('should filter meetings by search query', async () => {
      // Wait for meetings to be loaded before searching
      await expect(homePage.meetingCards.first()).toBeVisible();
      await homePage.searchButton.click();
      await expect(homePage.searchOverlay).toBeVisible();
      await expect(homePage.searchInput).toBeVisible();
      // Use pressSequentially to fire individual input events for Angular's (input) binding
      await homePage.searchInput.pressSequentially('Sprint', { delay: 50 });
      // "Sprint" matches the meeting "Sprint Planning" and the activity "Sprint Planning at 2:00 PM"
      await expect(homePage.searchOverlay.locator('.search-result-item')).toHaveCount(2);
    });
  });
});
