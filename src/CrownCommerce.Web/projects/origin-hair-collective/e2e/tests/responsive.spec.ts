import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Responsive Layout - Mobile (375px)', () => {
  let homePage: HomePage;

  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('header should show hamburger menu and hide desktop nav', async () => {
    await expect(homePage.header.mobileMenuButton).toBeVisible();
    await expect(homePage.header.nav).toBeHidden();
  });

  test('hero section should still display all content', async () => {
    await expect(homePage.hero.badge).toBeVisible();
    await expect(homePage.hero.headline).toBeVisible();
    await expect(homePage.hero.subline).toBeVisible();
    await expect(homePage.hero.shopCollectionButton).toBeVisible();
    await expect(homePage.hero.ourStoryButton).toBeVisible();
  });

  test('trust bar should display all items', async () => {
    const count = await homePage.trustBar.getTrustItemCount();
    expect(count).toBe(4);
  });

  test('product cards should be visible', async () => {
    await homePage.products.productCards.first().waitFor({ state: 'visible' });
    const count = await homePage.products.getProductCardCount();
    expect(count).toBe(3);
    for (let i = 0; i < 3; i++) {
      await expect(homePage.products.productCards.nth(i)).toBeVisible();
    }
  });

  test('benefit cards should be visible', async () => {
    const count = await homePage.benefits.getBenefitCardCount();
    expect(count).toBe(3);
    for (let i = 0; i < 3; i++) {
      await expect(homePage.benefits.benefitCards.nth(i)).toBeVisible();
    }
  });

  test('testimonial card should be visible', async () => {
    await expect(homePage.testimonials.testimonialCard).toBeVisible();
  });

  test('community photos should be visible', async () => {
    await homePage.community.photos.first().waitFor({ state: 'visible' });
    const count = await homePage.community.getPhotoCount();
    expect(count).toBe(6);
  });

  test('final CTA section should display all content', async () => {
    await expect(homePage.finalCta.heading).toBeVisible();
    await expect(homePage.finalCta.shopButton).toBeVisible();
    await expect(homePage.finalCta.trustText).toBeVisible();
  });

  test('footer should display all content', async () => {
    await expect(homePage.footer.logo).toBeVisible();
    await expect(homePage.footer.tagline).toBeVisible();
    await expect(homePage.footer.copyright).toBeVisible();
    await expect(homePage.footer.location).toBeVisible();
  });

  test('products grid should use single column layout on mobile', async ({ page }) => {
    await homePage.products.productCards.first().waitFor({ state: 'visible' });
    const gridColumns = await page.locator('.products__grid').evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns
    );
    // Single column layout means there should be only one column value
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(1);
  });

  test('benefits grid should use single column layout on mobile', async ({ page }) => {
    const gridColumns = await page.locator('.benefits__grid').evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns
    );
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(1);
  });

  test('community photos grid should use 3-column layout on mobile', async ({ page }) => {
    await homePage.community.photos.first().waitFor({ state: 'visible' });
    const gridColumns = await page.locator('.community__photos').evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns
    );
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(3);
  });
});

test.describe('Responsive Layout - Desktop (1280px)', () => {
  let homePage: HomePage;

  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('header should show desktop navigation and hide hamburger menu', async () => {
    await expect(homePage.header.nav).toBeVisible();
    await expect(homePage.header.mobileMenuButton).toBeHidden();
  });

  test('products grid should use 3-column layout on desktop', async ({ page }) => {
    await homePage.products.productCards.first().waitFor({ state: 'visible' });
    const gridColumns = await page.locator('.products__grid').evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns
    );
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(3);
  });

  test('benefits grid should use 3-column layout on desktop', async ({ page }) => {
    const gridColumns = await page.locator('.benefits__grid').evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns
    );
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(3);
  });

  test('community photos grid should use 6-column layout on desktop', async ({ page }) => {
    await homePage.community.photos.first().waitFor({ state: 'visible' });
    const gridColumns = await page.locator('.community__photos').evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns
    );
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(6);
  });

  test('hero section should have side-by-side layout', async ({ page }) => {
    const flexDirection = await page.locator('section.hero').evaluate(
      (el) => getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toBe('row');
  });

  test('footer top should have side-by-side layout', async ({ page }) => {
    const flexDirection = await page.locator('.footer__top').evaluate(
      (el) => getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toBe('row');
  });
});

test.describe('Responsive Layout - Tablet (768px)', () => {
  let homePage: HomePage;

  test.use({ viewport: { width: 768, height: 1024 } });

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display all main sections', async () => {
    await expect(homePage.hero.root).toBeVisible();
    await expect(homePage.trustBar.root).toBeVisible();
    await expect(homePage.brandStory.root).toBeVisible();
    await expect(homePage.products.root).toBeVisible();
    await expect(homePage.benefits.root).toBeVisible();
    await expect(homePage.testimonials.root).toBeVisible();
    await expect(homePage.community.root).toBeVisible();
    await expect(homePage.finalCta.root).toBeVisible();
    await expect(homePage.footer.root).toBeVisible();
  });
});
