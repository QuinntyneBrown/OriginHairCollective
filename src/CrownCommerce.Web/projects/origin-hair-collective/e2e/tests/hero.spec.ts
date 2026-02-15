import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Hero Section', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display the hero section', async () => {
    await expect(homePage.hero.root).toBeVisible();
  });

  test('should display the pre-orders badge', async () => {
    await expect(homePage.hero.badge).toBeVisible();
    const badgeText = await homePage.hero.getBadgeText();
    expect(badgeText?.trim()).toBe('NOW ACCEPTING PRE-ORDERS');
  });

  test('should display the badge dot indicator', async () => {
    await expect(homePage.hero.badgeDot).toBeVisible();
  });

  test('should display the main headline', async () => {
    const headline = await homePage.hero.getHeadlineText();
    expect(headline?.trim()).toBe('Your Hair, Your Origin Story');
  });

  test('should display the subline text', async () => {
    const subline = await homePage.hero.getSublineText();
    expect(subline).toContain('Premium virgin hair');
    expect(subline).toContain('Luxury you can feel, confidence you can see');
  });

  test('should display Shop The Collection button with arrow', async () => {
    await expect(homePage.hero.shopCollectionButton).toBeVisible();
    await expect(homePage.hero.shopCollectionButton).toContainText('SHOP THE COLLECTION');
    const hasArrow = await homePage.hero.hasArrowOnShopButton();
    expect(hasArrow).toBe(true);
  });

  test('should display Our Story button', async () => {
    await expect(homePage.hero.ourStoryButton).toBeVisible();
    await expect(homePage.hero.ourStoryButton).toContainText('OUR STORY');
  });

  test('should display the hero image area', async () => {
    await expect(homePage.hero.heroImage).toBeVisible();
  });

  test('Shop The Collection button should have primary styling', async () => {
    await expect(homePage.hero.shopCollectionButton).toHaveClass(/btn--primary/);
  });

  test('Our Story button should have secondary styling', async () => {
    await expect(homePage.hero.ourStoryButton).toHaveClass(/btn--secondary/);
  });
});
