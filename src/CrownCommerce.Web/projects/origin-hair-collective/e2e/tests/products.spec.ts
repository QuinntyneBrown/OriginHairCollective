import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Products Section', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display the products section', async () => {
    await expect(homePage.products.root).toBeVisible();
  });

  test('should have the #collection anchor id', async ({ page }) => {
    const section = page.locator('section.products');
    await expect(section).toHaveAttribute('id', 'collection');
  });

  test('should display the section label', async () => {
    const label = await homePage.products.getLabelText();
    expect(label?.trim()).toBe('THE COLLECTION');
  });

  test('should display the section heading', async () => {
    const heading = await homePage.products.getHeadingText();
    expect(heading?.trim()).toBe('Premium Hair, Curated For You');
  });

  test('should display exactly 3 product cards', async () => {
    await homePage.products.productCards.first().waitFor({ state: 'visible' });
    const count = await homePage.products.getProductCardCount();
    expect(count).toBe(3);
  });

  test('should display Virgin Hair Bundles card with correct info', async () => {
    await homePage.products.productCards.first().waitFor({ state: 'visible' });
    const card = await homePage.products.getProductCardInfo(0);
    expect(card.tag?.trim()).toBe('BESTSELLER');
    expect(card.title?.trim()).toBe('Virgin Hair Bundles');
    expect(card.description).toContain('Brazilian, Peruvian & Malaysian textures');
    expect(card.price?.trim()).toBe('From $85 CAD');
  });

  test('should display Lace Closures card with correct info', async () => {
    await homePage.products.productCards.first().waitFor({ state: 'visible' });
    const card = await homePage.products.getProductCardInfo(1);
    expect(card.tag?.trim()).toBe('ESSENTIAL');
    expect(card.title?.trim()).toBe('Lace Closures');
    expect(card.description).toContain('HD lace closures for a seamless, natural look');
    expect(card.price?.trim()).toBe('From $65 CAD');
  });

  test('should display Lace Frontals card with correct info', async () => {
    await homePage.products.productCards.first().waitFor({ state: 'visible' });
    const card = await homePage.products.getProductCardInfo(2);
    expect(card.tag?.trim()).toBe('PREMIUM');
    expect(card.title?.trim()).toBe('Lace Frontals');
    expect(card.description).toContain('13x4 and 13x6 HD lace frontals');
    expect(card.price?.trim()).toBe('From $95 CAD');
  });

  test('should display images for all product cards', async () => {
    await homePage.products.productCards.first().waitFor({ state: 'visible' });
    for (let i = 0; i < 3; i++) {
      const hasImage = await homePage.products.hasProductImage(i);
      expect(hasImage).toBe(true);
    }
  });

  test('should have alt text matching product title on images', async () => {
    await homePage.products.productCards.first().waitFor({ state: 'visible' });
    const expectedAlts = ['Virgin Hair Bundles', 'Lace Closures', 'Lace Frontals'];
    for (let i = 0; i < 3; i++) {
      const alt = await homePage.products.getProductImageAlt(i);
      expect(alt).toBe(expectedAlts[i]);
    }
  });
});
