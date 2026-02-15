import { test, expect } from '@playwright/test';
import { AdminLayoutPage } from '../page-objects/pages/admin-layout.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Toolbar', () => {
  let layout: AdminLayoutPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
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

  test('should display "Origins" as toolbar title on /origins', async () => {
    await layout.goto('/origins');
    await expect(layout.toolbar.title).toHaveText('Origins');
  });

  test('should display "Inquiries" as toolbar title on /inquiries', async () => {
    await layout.goto('/inquiries');
    await expect(layout.toolbar.title).toHaveText('Inquiries');
  });

  test('should display "Testimonials" as toolbar title on /testimonials', async () => {
    await layout.goto('/testimonials');
    await expect(layout.toolbar.title).toHaveText('Testimonials');
  });

  test('should display "Subscribers" as toolbar title on /subscribers', async () => {
    await layout.goto('/subscribers');
    await expect(layout.toolbar.title).toHaveText('Subscribers');
  });

  test('should display "Employees" as toolbar title on /employees', async () => {
    await layout.goto('/employees');
    await expect(layout.toolbar.title).toHaveText('Employees');
  });

  test('should display "Schedule" as toolbar title on /schedule', async () => {
    await layout.goto('/schedule');
    await expect(layout.toolbar.title).toHaveText('Schedule');
  });

  test('should display "Conversations" as toolbar title on /conversations', async () => {
    await layout.goto('/conversations');
    await expect(layout.toolbar.title).toHaveText('Conversations');
  });

  test('should display "Meetings" as toolbar title on /meetings/new', async () => {
    await layout.goto('/meetings/new');
    await expect(layout.toolbar.title).toHaveText('Meetings');
  });
});
