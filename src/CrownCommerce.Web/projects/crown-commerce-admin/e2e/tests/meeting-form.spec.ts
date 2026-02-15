import { test, expect } from '@playwright/test';
import { MeetingFormPage } from '../page-objects/pages/meeting-form.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Meeting Form', () => {
  let meetingPage: MeetingFormPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    meetingPage = new MeetingFormPage(page);
    await meetingPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Book Meeting"', async () => {
      await expect(meetingPage.pageTitle).toHaveText('Book Meeting');
    });

    test('should display page subtitle', async () => {
      await expect(meetingPage.pageSubtitle).toHaveText('Schedule a meeting with employees across time zones');
    });
  });

  test.describe('Form Cards', () => {
    test('should display Meeting Details card', async () => {
      await expect(meetingPage.meetingDetailsCard).toBeVisible();
    });

    test('should display Organizer & Attendees card', async () => {
      await expect(meetingPage.attendeesCard).toBeVisible();
    });

    test('should display Options card', async () => {
      await expect(meetingPage.optionsCard).toBeVisible();
    });
  });

  test.describe('Meeting Details Fields', () => {
    test('should display Meeting Title field', async () => {
      await expect(meetingPage.titleField).toBeVisible();
    });

    test('should display Description field', async () => {
      await expect(meetingPage.descriptionField).toBeVisible();
    });

    test('should display Date field', async () => {
      await expect(meetingPage.dateField).toBeVisible();
    });

    test('should display Start Time field', async () => {
      await expect(meetingPage.startTimeField).toBeVisible();
    });

    test('should display End Time field', async () => {
      await expect(meetingPage.endTimeField).toBeVisible();
    });

    test('should display Location field', async () => {
      await expect(meetingPage.locationField).toBeVisible();
    });

    test('should allow typing in Meeting Title', async () => {
      await meetingPage.titleField.fill('Weekly Sync');
      await expect(meetingPage.titleField).toHaveValue('Weekly Sync');
    });
  });

  test.describe('Organizer & Attendees', () => {
    test('should display Organizer select', async () => {
      await expect(meetingPage.organizerSelect).toBeVisible();
    });

    test('should display Attendees select', async () => {
      await expect(meetingPage.attendeesSelect).toBeVisible();
    });
  });

  test.describe('Options', () => {
    test('should display export calendar checkbox', async () => {
      await expect(meetingPage.exportCalendarCheckbox).toBeVisible();
      await expect(meetingPage.exportCalendarCheckbox).toContainText('Download .ics file');
    });
  });

  test.describe('Form Actions', () => {
    test('should display Cancel button', async () => {
      await expect(meetingPage.cancelButton).toBeVisible();
      await expect(meetingPage.cancelButton).toContainText('Cancel');
    });

    test('should display Book Meeting button', async () => {
      await expect(meetingPage.submitButton).toBeVisible();
      await expect(meetingPage.submitButton).toContainText('Book Meeting');
    });

    test('should navigate to schedule when clicking Cancel', async ({ page }) => {
      await meetingPage.cancelButton.click();
      await expect(page).toHaveURL(/\/schedule/);
    });
  });
});
