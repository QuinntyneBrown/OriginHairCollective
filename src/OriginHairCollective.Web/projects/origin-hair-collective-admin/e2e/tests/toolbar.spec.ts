import { test, expect } from '@playwright/test';
import { AdminLayoutPage } from '../page-objects/pages/admin-layout.page';
import { setupApiMocks, seedAuth } from '../fixtures/api-mocks';

test.describe('Toolbar', () => {
  let layout: AdminLayoutPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await seedAuth(page);
    layout = new AdminLayoutPage(page);
  });

  test('should display the toolbar on Dashboard', async () => {
    await layout.goto('/dashboard');
    await expect(layout.toolbar.root).toBeVisible();
  });

  test('should display "Dashboard" as toolbar title on /dashboard', async () => {
    await layout.goto('/dashboard');
    await expect(layout.toolbar.title).toHaveText('Dashboard');
  });

  test('should display "Products" as toolbar title on /products', async () => {
    await layout.goto('/products');
    await expect(layout.toolbar.title).toHaveText('Products');
  });

  test('should display search button in toolbar', async () => {
    await layout.goto('/dashboard');
    await expect(layout.toolbar.searchButton).toBeVisible();
  });

  test('should display notifications button in toolbar', async () => {
    await layout.goto('/dashboard');
    await expect(layout.toolbar.notificationsButton).toBeVisible();
  });
});
