import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Trust Bar', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display the trust bar section', async () => {
    await expect(homePage.trustBar.root).toBeVisible();
  });

  test('should display exactly 4 trust items', async () => {
    const count = await homePage.trustBar.getTrustItemCount();
    expect(count).toBe(4);
  });

  test('should display correct trust item texts', async () => {
    const texts = await homePage.trustBar.getTrustItemTexts();
    expect(texts).toEqual([
      '100% Virgin Hair',
      'Free Shipping Over $150',
      '30-Day Quality Guarantee',
      'Canadian Black-Owned',
    ]);
  });

  test('should display icon for each trust item', async () => {
    for (let i = 0; i < 4; i++) {
      const hasIcon = await homePage.trustBar.hasTrustItemIcon(i);
      expect(hasIcon).toBe(true);
    }
  });
});
