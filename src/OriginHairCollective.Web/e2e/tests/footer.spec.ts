import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/pages/home.page';

test.describe('Footer', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display the footer', async () => {
    await expect(homePage.footer.root).toBeVisible();
  });

  test('should display the logo', async () => {
    await expect(homePage.footer.logo).toBeVisible();
    await expect(homePage.footer.logo).toContainText('ORIGIN');
  });

  test('should display the tagline', async () => {
    await expect(homePage.footer.tagline).toBeVisible();
    const text = await homePage.footer.tagline.textContent();
    expect(text).toContain('Premium hair extensions for the woman who demands excellence');
    expect(text).toContain('Mississauga');
  });

  test('should display social icons', async () => {
    await expect(homePage.footer.socialIcons).toBeVisible();
  });

  test('should display 3 social links', async () => {
    const count = await homePage.footer.socialLinks.count();
    expect(count).toBe(3);
  });

  test('should have correct Instagram link', async () => {
    const href = await homePage.footer.getSocialLinkHref('instagram');
    expect(href).toBe('https://instagram.com/originhairco');
  });

  test('should have correct TikTok link', async () => {
    const href = await homePage.footer.getSocialLinkHref('tiktok');
    expect(href).toBe('https://tiktok.com/@originhairco');
  });

  test('should have correct email link', async () => {
    const href = await homePage.footer.getSocialLinkHref('email');
    expect(href).toBe('mailto:hello@originhairco.ca');
  });

  test('should display 3 footer link columns', async () => {
    const count = await homePage.footer.linkColumns.count();
    expect(count).toBe(3);
  });

  test('should display Shop column with correct links', async () => {
    const links = await homePage.footer.getColumnLinks('Shop');
    expect(links).toEqual(['Bundles', 'Closures', 'Frontals', 'Bundle Deals']);
  });

  test('should display Company column with correct links', async () => {
    const links = await homePage.footer.getColumnLinks('Company');
    expect(links).toEqual(['Our Story', 'Contact', 'Wholesale', 'Ambassador Program']);
  });

  test('should display Support column with correct links', async () => {
    const links = await homePage.footer.getColumnLinks('Support');
    expect(links).toEqual(['Hair Care Guide', 'Shipping Info', 'Returns & Exchanges', 'FAQ']);
  });

  test('should display a divider', async () => {
    await expect(homePage.footer.divider).toBeVisible();
  });

  test('should display copyright text', async () => {
    const copyright = await homePage.footer.getCopyrightText();
    expect(copyright).toContain('2026 Origin Hair Collective');
    expect(copyright).toContain('All rights reserved');
  });

  test('should display location text', async () => {
    const location = await homePage.footer.getLocationText();
    expect(location?.trim()).toBe('Mississauga, Ontario, Canada');
  });
});
