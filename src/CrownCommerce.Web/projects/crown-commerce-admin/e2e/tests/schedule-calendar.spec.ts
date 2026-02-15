import { test, expect } from '@playwright/test';
import { ScheduleCalendarPage } from '../page-objects/pages/schedule-calendar.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Schedule Calendar', () => {
  let schedulePage: ScheduleCalendarPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    schedulePage = new ScheduleCalendarPage(page);
    await schedulePage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Employee Schedule"', async () => {
      await expect(schedulePage.pageTitle).toHaveText('Employee Schedule');
    });

    test('should display page subtitle', async () => {
      await expect(schedulePage.pageSubtitle).toHaveText('View and manage team calendars across time zones');
    });

    test('should display Book Meeting button', async () => {
      await expect(schedulePage.bookMeetingButton).toBeVisible();
      await expect(schedulePage.bookMeetingButton).toContainText('Book Meeting');
    });

    test('should navigate to meeting form when clicking Book Meeting', async ({ page }) => {
      await schedulePage.bookMeetingButton.click();
      await expect(page).toHaveURL(/\/meetings\/new/);
    });
  });

  test.describe('Calendar Grid', () => {
    test('should display calendar grid', async () => {
      await expect(schedulePage.calendarGrid).toBeVisible();
    });

    test('should display 7 day headers', async () => {
      const count = await schedulePage.calendarHeaderCells.count();
      expect(count).toBe(7);
    });

    test('should display day header labels', async () => {
      const headers = await schedulePage.calendarHeaderCells.allTextContents();
      expect(headers).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    });

    test('should display calendar cells', async () => {
      const count = await schedulePage.calendarCells.count();
      expect(count).toBeGreaterThanOrEqual(28);
    });
  });

  test.describe('Calendar Controls', () => {
    test('should display month label', async () => {
      await expect(schedulePage.monthLabel).toBeVisible();
    });

    test('should display previous month button', async () => {
      await expect(schedulePage.prevMonthButton).toBeVisible();
    });

    test('should display next month button', async () => {
      await expect(schedulePage.nextMonthButton).toBeVisible();
    });

    test('should display Today button', async () => {
      await expect(schedulePage.todayButton).toBeVisible();
      await expect(schedulePage.todayButton).toContainText('Today');
    });

    test('should navigate to previous month', async () => {
      const initialMonth = await schedulePage.monthLabel.textContent();
      await schedulePage.prevMonthButton.click();
      await expect(schedulePage.monthLabel).not.toHaveText(initialMonth!);
    });

    test('should navigate to next month', async () => {
      const initialMonth = await schedulePage.monthLabel.textContent();
      await schedulePage.nextMonthButton.click();
      await expect(schedulePage.monthLabel).not.toHaveText(initialMonth!);
    });
  });

  test.describe('Employee Filter', () => {
    test('should display employee filter', async () => {
      await expect(schedulePage.employeeFilter).toBeVisible();
    });
  });

  test.describe('Sidebar', () => {
    test('should display sidebar title "Upcoming Meetings"', async () => {
      await expect(schedulePage.sidebarTitle).toHaveText('Upcoming Meetings');
    });
  });
});
