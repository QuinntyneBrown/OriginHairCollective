import { test, expect } from '@playwright/test';
import { OriginFormPage } from '../page-objects/pages/origin-form.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Origin Form', () => {
  let originPage: OriginFormPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    originPage = new OriginFormPage(page);
    await originPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Add New Origin"', async () => {
      await expect(originPage.pageTitle).toHaveText('Add New Origin');
    });

    test('should display page subtitle', async () => {
      await expect(originPage.pageSubtitle).toHaveText('Fill in the origin details below');
    });

    test('should display back button', async () => {
      await expect(originPage.backButton).toBeVisible();
    });

    test('should navigate to origins list when clicking back button', async ({ page }) => {
      await originPage.backButton.click();
      await expect(page).toHaveURL(/\/origins$/);
    });
  });

  test.describe('Form Card', () => {
    test('should display form card', async () => {
      await expect(originPage.formCard).toBeVisible();
    });

    test('should display form card title "Origin Information"', async () => {
      await expect(originPage.formCardTitle).toHaveText('Origin Information');
    });
  });

  test.describe('Form Fields', () => {
    test('should display Country field', async () => {
      await expect(originPage.countryField).toBeVisible();
    });

    test('should display Region field', async () => {
      await expect(originPage.regionField).toBeVisible();
    });

    test('should display Description field', async () => {
      await expect(originPage.descriptionField).toBeVisible();
    });

    test('should allow typing in Country field', async () => {
      await originPage.countryField.fill('Thailand');
      await expect(originPage.countryField).toHaveValue('Thailand');
    });

    test('should allow typing in Region field', async () => {
      await originPage.regionField.fill('Bangkok');
      await expect(originPage.regionField).toHaveValue('Bangkok');
    });

    test('should allow typing in Description field', async () => {
      await originPage.descriptionField.fill('Silky smooth hair');
      await expect(originPage.descriptionField).toHaveValue('Silky smooth hair');
    });
  });

  test.describe('Form Actions', () => {
    test('should display Cancel button', async () => {
      await expect(originPage.cancelButton).toBeVisible();
      await expect(originPage.cancelButton).toContainText('Cancel');
    });

    test('should display Save Origin button', async () => {
      await expect(originPage.saveButton).toBeVisible();
      await expect(originPage.saveButton).toContainText('Save Origin');
    });

    test('should navigate to origins list when clicking Cancel', async ({ page }) => {
      await originPage.cancelButton.click();
      await expect(page).toHaveURL(/\/origins$/);
    });

    test('should have Save button disabled when form is empty', async () => {
      await expect(originPage.saveButton).toBeDisabled();
    });

    test('should enable Save button when required fields are filled', async () => {
      await originPage.countryField.fill('Thailand');
      await originPage.regionField.fill('Bangkok');
      await expect(originPage.saveButton).toBeEnabled();
    });
  });
});
