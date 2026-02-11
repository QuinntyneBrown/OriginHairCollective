import { test, expect } from '@playwright/test';
import { AdminLayoutPage } from '../page-objects/pages/admin-layout.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Navigation', () => {
  let layout: AdminLayoutPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    layout = new AdminLayoutPage(page);
  });

  test('should redirect root "/" to "/dashboard"', async ({ page }) => {
    await layout.goto('/');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate from Dashboard to Products via sidebar', async ({ page }) => {
    await layout.goto('/dashboard');
    await layout.sidebar.clickNavItem('Products');
    await expect(page).toHaveURL(/\/products/);
  });

  test('should navigate from Products to Origins via sidebar', async ({ page }) => {
    await layout.goto('/products');
    await layout.sidebar.clickNavItem('Origins');
    await expect(page).toHaveURL(/\/origins/);
  });

  test('should navigate from Origins to Inquiries via sidebar', async ({ page }) => {
    await layout.goto('/origins');
    await layout.sidebar.clickNavItem('Inquiries');
    await expect(page).toHaveURL(/\/inquiries/);
  });

  test('should navigate from Inquiries to Testimonials via sidebar', async ({ page }) => {
    await layout.goto('/inquiries');
    await layout.sidebar.clickNavItem('Testimonials');
    await expect(page).toHaveURL(/\/testimonials/);
  });

  test('should navigate from Testimonials to Hero Content via sidebar', async ({ page }) => {
    await layout.goto('/testimonials');
    await layout.sidebar.clickNavItem('Hero Content');
    await expect(page).toHaveURL(/\/hero-content/);
  });

  test('should navigate from Hero Content to Trust Bar via sidebar', async ({ page }) => {
    await layout.goto('/hero-content');
    await layout.sidebar.clickNavItem('Trust Bar');
    await expect(page).toHaveURL(/\/trust-bar/);
  });

  test('should navigate to product form and back to products list', async ({ page }) => {
    await layout.goto('/products');
    await page.locator('.primary-btn', { hasText: 'Add Product' }).click();
    await expect(page).toHaveURL(/\/products\/new/);
    await page.locator('.form-header-left button[mat-icon-button]').click();
    await expect(page).toHaveURL(/\/products$/);
  });

  test('should navigate to hero content and back to dashboard', async ({ page }) => {
    await layout.goto('/hero-content');
    await page.locator('.form-header-left button[mat-icon-button]').click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
