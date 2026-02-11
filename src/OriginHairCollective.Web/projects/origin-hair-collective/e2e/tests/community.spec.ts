import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';

test.describe('Community Section', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display the community section', async () => {
    await expect(homePage.community.root).toBeVisible();
  });

  test('should display the section label', async () => {
    const label = await homePage.community.getLabelText();
    expect(label?.trim()).toBe('JOIN THE COLLECTIVE');
  });

  test('should display the section heading', async () => {
    const heading = await homePage.community.getHeadingText();
    expect(heading?.trim()).toBe('Follow the Journey');
  });

  test('should display the Instagram handle', async () => {
    const handle = await homePage.community.getHandleText();
    expect(handle?.trim()).toBe('@OriginHairCollective');
  });

  test('should display exactly 6 community photos', async () => {
    const count = await homePage.community.getPhotoCount();
    expect(count).toBe(6);
  });

  test('should have background images on all photos', async () => {
    for (let i = 0; i < 6; i++) {
      const hasImage = await homePage.community.photoHasBackgroundImage(i);
      expect(hasImage).toBe(true);
    }
  });
});
