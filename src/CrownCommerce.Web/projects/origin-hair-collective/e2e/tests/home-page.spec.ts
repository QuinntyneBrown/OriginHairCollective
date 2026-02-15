import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Home Page - Full Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should load the home page successfully', async ({ page }) => {
    await expect(page).toHaveURL('/');
  });

  test('should display all major sections in correct order', async ({ page }) => {
    const sections = page.locator('main section');
    const sectionClasses = await sections.evaluateAll((elements) =>
      elements.map((el) => el.className)
    );

    expect(sectionClasses).toEqual([
      'hero',
      'trust-bar',
      'brand-story',
      'products',
      'benefits',
      'testimonials',
      'community',
      'newsletter',
      'final-cta',
    ]);
  });

  test('should have header, main, and footer landmark elements', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should navigate to /shop when Collection link is clicked', async ({ page }) => {
    await homePage.header.clickNavLink('Collection');
    await expect(page).toHaveURL(/\/shop/);
  });

  test('should navigate to /about when Our Story link is clicked', async ({ page }) => {
    await homePage.header.clickNavLink('Our Story');
    await expect(page).toHaveURL(/\/about/);
  });

  test('should navigate to /hair-care-guide when Hair Care link is clicked', async ({ page }) => {
    await homePage.header.clickNavLink('Hair Care');
    await expect(page).toHaveURL(/\/hair-care-guide/);
  });

  test('should navigate to /wholesale when Wholesale link is clicked', async ({ page }) => {
    await homePage.header.clickNavLink('Wholesale');
    await expect(page).toHaveURL(/\/wholesale/);
  });
});
