import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';

test.describe('Home Page - Full Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
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

  test('should navigate to #collection when Collection link is clicked', async ({ page }) => {
    await homePage.header.clickNavLink('Collection');
    await expect(page).toHaveURL(/#collection/);
  });

  test('should navigate to #story when Our Story link is clicked', async ({ page }) => {
    await homePage.header.clickNavLink('Our Story');
    await expect(page).toHaveURL(/#story/);
  });

  test('should navigate to #care when Hair Care link is clicked', async ({ page }) => {
    await homePage.header.clickNavLink('Hair Care');
    await expect(page).toHaveURL(/#care/);
  });

  test('should navigate to #wholesale when Wholesale link is clicked', async ({ page }) => {
    await homePage.header.clickNavLink('Wholesale');
    await expect(page).toHaveURL(/#wholesale/);
  });

  test('should scroll to products section when Collection link is clicked', async ({ page }) => {
    await homePage.header.clickNavLink('Collection');
    await page.waitForTimeout(500);
    await expect(homePage.products.root).toBeInViewport();
  });

  test('should scroll to brand story section when Our Story link is clicked', async ({ page }) => {
    await homePage.header.clickNavLink('Our Story');
    await page.waitForTimeout(500);
    await expect(homePage.brandStory.root).toBeInViewport();
  });

  test('should scroll to benefits section when Hair Care link is clicked', async ({ page }) => {
    await homePage.header.clickNavLink('Hair Care');
    await page.waitForTimeout(500);
    await expect(homePage.benefits.root).toBeInViewport();
  });
});
