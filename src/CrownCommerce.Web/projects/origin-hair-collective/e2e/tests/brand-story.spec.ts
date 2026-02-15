import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Brand Story Section', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display the brand story section', async () => {
    await expect(homePage.brandStory.root).toBeVisible();
  });

  test('should have the #story anchor id', async ({ page }) => {
    const section = page.locator('section.brand-story');
    await expect(section).toHaveAttribute('id', 'story');
  });

  test('should display the section label', async () => {
    const label = await homePage.brandStory.getLabelText();
    expect(label?.trim()).toBe('OUR STORY');
  });

  test('should display the section heading', async () => {
    const heading = await homePage.brandStory.getHeadingText();
    expect(heading?.trim()).toBe('Where Luxury Meets Community');
  });

  test('should display an accent divider', async () => {
    const hasAccent = await homePage.brandStory.hasAccentDivider();
    expect(hasAccent).toBe(true);
  });

  test('should display the brand narrative body text', async () => {
    const body = await homePage.brandStory.getBodyText();
    expect(body).toContain('Origin Hair Collective was born from a simple belief');
    expect(body).toContain('Mississauga');
    expect(body).toContain('ethically sourced');
  });

  test('should display the emphasis tagline', async () => {
    const emphasis = await homePage.brandStory.getEmphasisText();
    expect(emphasis?.trim()).toBe("This isn't just hair. It's your origin story.");
  });
});
