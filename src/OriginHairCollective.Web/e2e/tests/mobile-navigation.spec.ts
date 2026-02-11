import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';

test.describe('Mobile Navigation', () => {
  let homePage: HomePage;

  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should show hamburger menu button on mobile', async () => {
    await expect(homePage.header.mobileMenuButton).toBeVisible();
  });

  test('should hide desktop navigation on mobile', async () => {
    await expect(homePage.header.nav).toBeHidden();
  });

  test('should have correct aria-label on menu button', async () => {
    await expect(homePage.header.mobileMenuButton).toHaveAttribute('aria-label', 'Open menu');
  });

  test('should open mobile menu when hamburger is clicked', async () => {
    await homePage.header.openMobileMenu();
    await expect(homePage.mobileNav.overlay).toBeVisible();
  });

  test('should display logo in mobile menu', async () => {
    await homePage.header.openMobileMenu();
    await expect(homePage.mobileNav.logo).toBeVisible();
  });

  test('should display close button in mobile menu', async () => {
    await homePage.header.openMobileMenu();
    await expect(homePage.mobileNav.closeButton).toBeVisible();
  });

  test('should display all navigation links in mobile menu', async () => {
    await homePage.header.openMobileMenu();
    const links = await homePage.mobileNav.getNavLinkTexts();
    expect(links).toEqual(['Collection', 'Our Story', 'Hair Care', 'Wholesale']);
  });

  test('should display Shop Now button in mobile menu', async () => {
    await homePage.header.openMobileMenu();
    await expect(homePage.mobileNav.shopNowButton).toBeVisible();
    await expect(homePage.mobileNav.shopNowButton).toContainText('SHOP NOW');
  });

  test('should have correct hrefs in mobile menu links', async () => {
    await homePage.header.openMobileMenu();

    const collectionHref = await homePage.mobileNav.getNavLinkHref('Collection');
    expect(collectionHref).toBe('#collection');

    const storyHref = await homePage.mobileNav.getNavLinkHref('Our Story');
    expect(storyHref).toBe('#story');

    const careHref = await homePage.mobileNav.getNavLinkHref('Hair Care');
    expect(careHref).toBe('#care');

    const wholesaleHref = await homePage.mobileNav.getNavLinkHref('Wholesale');
    expect(wholesaleHref).toBe('#wholesale');
  });

  test('should close mobile menu when close button is clicked', async () => {
    await homePage.header.openMobileMenu();
    await expect(homePage.mobileNav.overlay).toBeVisible();
    await homePage.mobileNav.close();
    await expect(homePage.mobileNav.overlay).toBeHidden();
  });

  test('should close mobile menu when a nav link is clicked', async () => {
    await homePage.header.openMobileMenu();
    await expect(homePage.mobileNav.overlay).toBeVisible();
    await homePage.mobileNav.clickNavLink('Collection');
    await expect(homePage.mobileNav.overlay).toBeHidden();
  });

  test('should close mobile menu when overlay backdrop is clicked', async ({ page }) => {
    await homePage.header.openMobileMenu();
    await expect(homePage.mobileNav.overlay).toBeVisible();
    // Click the overlay outside the content area (bottom of the overlay)
    const overlayBox = await homePage.mobileNav.overlay.boundingBox();
    if (overlayBox) {
      await page.mouse.click(overlayBox.x + overlayBox.width / 2, overlayBox.y + overlayBox.height - 10);
    }
    await expect(homePage.mobileNav.overlay).toBeHidden();
  });

  test('close button should have correct aria-label', async () => {
    await homePage.header.openMobileMenu();
    await expect(homePage.mobileNav.closeButton).toHaveAttribute('aria-label', 'Close');
  });
});
