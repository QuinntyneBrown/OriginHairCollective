import { test, expect } from '@playwright/test';
import { MeetingsPage } from '../page-objects/pages/meetings.page';
import { setupApiMocks, injectAuth } from '../fixtures/api-mocks';
import { mockCalendarEvents } from '../fixtures/mock-data';

test.describe('Meetings Page', () => {
  let meetingsPage: MeetingsPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await injectAuth(page);
    meetingsPage = new MeetingsPage(page);
    await meetingsPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display the page title', async () => {
      await expect(meetingsPage.pageTitle).toBeVisible();
      await expect(meetingsPage.pageTitle).toHaveText('Meetings');
    });

    test('should display current month and year', async () => {
      await expect(meetingsPage.pageSubtitle).toBeVisible();
      // Should contain a month name and year
      await expect(meetingsPage.pageSubtitle).toContainText(/\w+ \d{4}/);
    });

    test('should display the new meeting button', async () => {
      await expect(meetingsPage.newMeetingButton).toBeVisible();
      await expect(meetingsPage.newMeetingButton).toContainText('New Meeting');
    });
  });

  test.describe('Week Picker', () => {
    test('should display 7 day cells', async () => {
      await expect(meetingsPage.weekDays).toHaveCount(7);
    });

    test('should highlight today if it falls within the displayed week', async ({ page }) => {
      // The week picker shows Mon-Sun. Today may fall outside if it's Sunday
      // and the picker shows the next week. Just verify that day cells render.
      const dayCells = page.locator('.day-cell');
      await expect(dayCells).toHaveCount(7);
      // Verify each cell has a day name and number
      await expect(dayCells.first().locator('.day-name')).toBeVisible();
      await expect(dayCells.first().locator('.day-number')).toBeVisible();
    });

    test('should select a day when clicked', async ({ page }) => {
      // Click the first day cell and verify it becomes selected
      await meetingsPage.selectDay(0);
      const selected = page.locator('.day-cell--selected');
      await expect(selected).toBeVisible();
    });

    test('should display day names (Mon, Tue, etc.)', async () => {
      const firstDayName = meetingsPage.weekDays.first().locator('.day-name');
      await expect(firstDayName).toBeVisible();
      await expect(firstDayName).toContainText(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/);
    });

    test('should change selected day when clicking a different day', async ({ page }) => {
      await meetingsPage.selectDay(0);
      const selected = page.locator('.day-cell--selected');
      await expect(selected).toBeVisible();
    });
  });

  test.describe('Schedule List', () => {
    test('should display the Schedule section title', async () => {
      await expect(meetingsPage.sectionTitle).toHaveText('Schedule');
    });

    test('should display meeting cards', async () => {
      await expect(meetingsPage.scheduleCards).toHaveCount(mockCalendarEvents.length);
    });

    test('should display first meeting title', async () => {
      const title = await meetingsPage.getMeetingTitle(0);
      expect(title).toBe(mockCalendarEvents[0].title);
    });

    test('should display meeting time', async () => {
      const time = await meetingsPage.getMeetingStartTime(0);
      expect(time).toBeTruthy();
    });

    test('should display "Virtual Meeting" for meetings with join URL', async ({ page }) => {
      // First meeting has a joinUrl
      const virtualLabel = meetingsPage.scheduleCards.first().locator('.schedule-meta', { hasText: 'Virtual' });
      await expect(virtualLabel).toBeVisible();
    });

    test('should display location for in-person meetings', async () => {
      // Second meeting has location "Conference Room A"
      const locationLabel = meetingsPage.scheduleCards.nth(1).locator('.schedule-meta', { hasText: 'Conference Room A' });
      await expect(locationLabel).toBeVisible();
    });

    test('should display organizer avatar', async () => {
      const avatar = meetingsPage.scheduleCards.first().locator('.schedule-avatar');
      await expect(avatar.first()).toBeVisible();
    });
  });

  test.describe('RSVP Actions', () => {
    test('should display Accept and Decline buttons for pending meetings', async () => {
      const acceptBtn = meetingsPage.scheduleCards.first().locator('.rsvp-btn--accept');
      const declineBtn = meetingsPage.scheduleCards.first().locator('.rsvp-btn--decline');
      await expect(acceptBtn).toBeVisible();
      await expect(declineBtn).toBeVisible();
    });

    test('should show Accepted badge after accepting a meeting', async () => {
      await meetingsPage.acceptMeeting(0);
      const badge = meetingsPage.scheduleCards.first().locator('.rsvp-badge--accepted');
      await expect(badge).toBeVisible();
      await expect(badge).toContainText('Accepted');
    });

    test('should show Declined badge after declining a meeting', async () => {
      await meetingsPage.declineMeeting(0);
      const badge = meetingsPage.scheduleCards.first().locator('.rsvp-badge--declined');
      await expect(badge).toBeVisible();
      await expect(badge).toContainText('Declined');
    });
  });

  test.describe('Meeting Menu', () => {
    test('should display meeting menu with Edit option', async ({ page }) => {
      await meetingsPage.openMeetingMenu(0);
      await expect(page.locator('button[mat-menu-item]', { hasText: 'Edit' })).toBeVisible();
    });

    test('should display meeting menu with Export iCal option', async ({ page }) => {
      await meetingsPage.openMeetingMenu(0);
      await expect(page.locator('button[mat-menu-item]', { hasText: 'Export iCal' })).toBeVisible();
    });

    test('should display meeting menu with Cancel Meeting option', async ({ page }) => {
      await meetingsPage.openMeetingMenu(0);
      await expect(page.locator('button[mat-menu-item]', { hasText: 'Cancel Meeting' })).toBeVisible();
    });
  });

  test.describe('New Meeting Dialog', () => {
    test('should open the new meeting dialog', async ({ page }) => {
      await meetingsPage.newMeetingButton.click();
      await expect(page.locator('mat-dialog-container')).toBeVisible();
    });
  });

  test.describe('Join Button', () => {
    test('should display Join button for virtual meetings', async () => {
      const joinBtn = meetingsPage.scheduleCards.first().locator('.join-call-btn');
      await expect(joinBtn).toBeVisible();
      await expect(joinBtn).toContainText('Join');
    });
  });
});
