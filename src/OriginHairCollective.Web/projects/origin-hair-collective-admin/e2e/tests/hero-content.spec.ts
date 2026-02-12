import { test, expect } from '@playwright/test';
import { HeroContentPage } from '../page-objects/pages/hero-content.page';
import { setupApiMocks, seedAuth } from '../fixtures/api-mocks';

test.describe('Hero Content', () => {
  let heroPage: HeroContentPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await seedAuth(page);
    heroPage = new HeroContentPage(page);
    await heroPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Hero Content"', async () => {
      await expect(heroPage.pageTitle).toHaveText('Hero Content');
    });

    test('should display page subtitle', async () => {
      await expect(heroPage.pageSubtitle).toHaveText('Manage the hero section of your marketing site');
    });

    test('should display back button', async () => {
      await expect(heroPage.backButton).toBeVisible();
    });

    test('should navigate to dashboard when clicking back button', async ({ page }) => {
      await heroPage.backButton.click();
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Form Card', () => {
    test('should display form card', async () => {
      await expect(heroPage.formCard).toBeVisible();
    });

    test('should display form card title "Hero Section Settings"', async () => {
      await expect(heroPage.formCardTitle).toHaveText('Hero Section Settings');
    });
  });

  test.describe('Form Fields', () => {
    test('should display Hero Title field', async () => {
      await expect(heroPage.heroTitleField).toBeVisible();
    });

    test('should display Hero Title placeholder', async () => {
      await expect(heroPage.heroTitleField).toHaveAttribute('placeholder', 'e.g. Premium Hair Extensions');
    });

    test('should display Hero Subtitle field', async () => {
      await expect(heroPage.heroSubtitleField).toBeVisible();
    });

    test('should display Hero Subtitle placeholder', async () => {
      await expect(heroPage.heroSubtitleField).toHaveAttribute('placeholder', 'e.g. Ethically sourced, premium quality');
    });

    test('should display CTA Button Text field', async () => {
      await expect(heroPage.ctaButtonTextField).toBeVisible();
    });

    test('should display CTA Button Link field', async () => {
      await expect(heroPage.ctaButtonLinkField).toBeVisible();
    });

    test('should allow typing in Hero Title field', async () => {
      await heroPage.heroTitleField.fill('Test Title');
      await expect(heroPage.heroTitleField).toHaveValue('Test Title');
    });

    test('should allow typing in Hero Subtitle field', async () => {
      await heroPage.heroSubtitleField.fill('Test Subtitle');
      await expect(heroPage.heroSubtitleField).toHaveValue('Test Subtitle');
    });
  });

  test.describe('Image Upload', () => {
    test('should display image section', async () => {
      await expect(heroPage.imageSection).toBeVisible();
    });

    test('should display upload area', async () => {
      await expect(heroPage.imageUploadArea).toBeVisible();
    });

    test('should display upload icon', async () => {
      await expect(heroPage.uploadIcon).toBeVisible();
    });

    test('should display upload text', async () => {
      await expect(heroPage.uploadText).toBeVisible();
      await expect(heroPage.uploadText).toContainText('Click to upload');
    });

    test('should display upload hint with size info', async () => {
      await expect(heroPage.uploadHint).toBeVisible();
      await expect(heroPage.uploadHint).toContainText('PNG, JPG up to 5MB');
    });
  });

  test.describe('Form Actions', () => {
    test('should display Reset button', async () => {
      await expect(heroPage.resetButton).toBeVisible();
      await expect(heroPage.resetButton).toContainText('Reset');
    });

    test('should display Save Changes button', async () => {
      await expect(heroPage.saveButton).toBeVisible();
      await expect(heroPage.saveButton).toContainText('Save Changes');
    });
  });
});
