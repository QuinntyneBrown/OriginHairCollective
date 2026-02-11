import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';

test.describe('Final CTA Section', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display the final CTA section', async () => {
    await expect(homePage.finalCta.root).toBeVisible();
  });

  test('should display the heading', async () => {
    const heading = await homePage.finalCta.getHeadingText();
    expect(heading?.trim()).toBe('Ready to Write Your Origin Story?');
  });

  test('should display the subtext', async () => {
    const subtext = await homePage.finalCta.getSubtext();
    expect(subtext).toContain('Join hundreds of women across the GTA');
    expect(subtext).toContain('premium hair needs');
  });

  test('should display Shop The Collection button with arrow', async () => {
    await expect(homePage.finalCta.shopButton).toBeVisible();
    await expect(homePage.finalCta.shopButton).toContainText('SHOP THE COLLECTION');
    const hasArrow = await homePage.finalCta.hasArrowOnShopButton();
    expect(hasArrow).toBe(true);
  });

  test('Shop The Collection button should have primary and large styling', async () => {
    await expect(homePage.finalCta.shopButton).toHaveClass(/btn--primary/);
    await expect(homePage.finalCta.shopButton).toHaveClass(/btn--large/);
  });

  test('should display trust badges text', async () => {
    const trustText = await homePage.finalCta.getTrustText();
    expect(trustText).toContain('Free shipping on orders over $150');
    expect(trustText).toContain('30-day quality guarantee');
    expect(trustText).toContain('Canadian Black-owned business');
  });
});
