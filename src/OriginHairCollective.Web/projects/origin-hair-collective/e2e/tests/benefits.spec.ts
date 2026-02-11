import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';

test.describe('Benefits Section', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display the benefits section', async () => {
    await expect(homePage.benefits.root).toBeVisible();
  });

  test('should have the #care anchor id', async ({ page }) => {
    const section = page.locator('section.benefits');
    await expect(section).toHaveAttribute('id', 'care');
  });

  test('should display the section label', async () => {
    const label = await homePage.benefits.getLabelText();
    expect(label?.trim()).toBe('WHY ORIGIN');
  });

  test('should display the section heading', async () => {
    const heading = await homePage.benefits.getHeadingText();
    expect(heading?.trim()).toBe('The Origin Difference');
  });

  test('should display exactly 3 benefit cards', async () => {
    const count = await homePage.benefits.getBenefitCardCount();
    expect(count).toBe(3);
  });

  test('should display Ethically Sourced benefit card', async () => {
    const card = await homePage.benefits.getBenefitCardInfo(0);
    expect(card.title?.trim()).toBe('Ethically Sourced');
    expect(card.description).toContain('100% virgin human hair from trusted suppliers');
  });

  test('should display Built For Longevity benefit card', async () => {
    const card = await homePage.benefits.getBenefitCardInfo(1);
    expect(card.title?.trim()).toBe('Built For Longevity');
    expect(card.description).toContain('Our hair lasts 12+ months with proper care');
  });

  test('should display Community First benefit card', async () => {
    const card = await homePage.benefits.getBenefitCardInfo(2);
    expect(card.title?.trim()).toBe('Community First');
    expect(card.description).toContain("More than a brand — we're a collective");
  });

  test('should display icons for all benefit cards', async () => {
    for (let i = 0; i < 3; i++) {
      const hasIcon = await homePage.benefits.hasBenefitIcon(i);
      expect(hasIcon).toBe(true);
    }
  });
});
