import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';

test.describe('Testimonials Section', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display the testimonials section', async () => {
    await expect(homePage.testimonials.root).toBeVisible();
  });

  test('should display the section label', async () => {
    const label = await homePage.testimonials.getLabelText();
    expect(label?.trim()).toBe('WHAT THEY SAY');
  });

  test('should display the testimonial card', async () => {
    await expect(homePage.testimonials.testimonialCard).toBeVisible();
  });

  test('should display the decorative quote icon', async () => {
    const hasQuoteIcon = await homePage.testimonials.hasQuoteIcon();
    expect(hasQuoteIcon).toBe(true);
  });

  test('should display the testimonial quote', async () => {
    const quote = await homePage.testimonials.getQuoteText();
    expect(quote).toContain("I've tried every hair brand out there");
    expect(quote).toContain('Origin is different');
    expect(quote).toContain('the quality is unmatched');
  });

  test('should display 5-star rating', async () => {
    const stars = await homePage.testimonials.getStarsText();
    expect(stars?.trim()).toBe('★ ★ ★ ★ ★');
  });

  test('should display the author name and location', async () => {
    const author = await homePage.testimonials.getAuthorText();
    expect(author).toContain('Jasmine T., Toronto');
  });
});
