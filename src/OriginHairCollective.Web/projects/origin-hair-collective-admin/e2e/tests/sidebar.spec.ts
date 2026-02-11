import { test, expect } from '@playwright/test';
import { AdminLayoutPage } from '../page-objects/pages/admin-layout.page';
import { setupApiMocks } from '../fixtures/api-mocks';
import { navItems, mockUser } from '../fixtures/mock-data';

test.describe('Sidebar', () => {
  let layout: AdminLayoutPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    layout = new AdminLayoutPage(page);
    await layout.goto('/dashboard');
  });

  test.describe('Logo', () => {
    test('should display the sidebar', async () => {
      await expect(layout.sidebar.root).toBeVisible();
    });

    test('should display logo icon with "O"', async () => {
      await expect(layout.sidebar.logoIcon).toBeVisible();
      await expect(layout.sidebar.logoIcon).toHaveText('O');
    });

    test('should display "Origin Hair" logo name', async () => {
      await expect(layout.sidebar.logoName).toBeVisible();
      await expect(layout.sidebar.logoName).toHaveText('Origin Hair');
    });

    test('should display "Admin Panel" subtitle', async () => {
      await expect(layout.sidebar.logoSub).toBeVisible();
      await expect(layout.sidebar.logoSub).toHaveText('Admin Panel');
    });
  });

  test.describe('Navigation Items', () => {
    test('should display 7 navigation items', async () => {
      const count = await layout.sidebar.getNavItemCount();
      expect(count).toBe(7);
    });

    test('should display correct navigation labels', async () => {
      const labels = await layout.sidebar.getNavItemLabels();
      const expectedLabels = navItems.map((item) => item.label);
      expect(labels).toEqual(expectedLabels);
    });

    test('should display Dashboard nav item', async () => {
      const item = await layout.sidebar.getNavItemByLabel('Dashboard');
      await expect(item).toBeVisible();
    });

    test('should display Products nav item', async () => {
      const item = await layout.sidebar.getNavItemByLabel('Products');
      await expect(item).toBeVisible();
    });

    test('should display Origins nav item', async () => {
      const item = await layout.sidebar.getNavItemByLabel('Origins');
      await expect(item).toBeVisible();
    });

    test('should display Inquiries nav item', async () => {
      const item = await layout.sidebar.getNavItemByLabel('Inquiries');
      await expect(item).toBeVisible();
    });

    test('should display Testimonials nav item', async () => {
      const item = await layout.sidebar.getNavItemByLabel('Testimonials');
      await expect(item).toBeVisible();
    });

    test('should display Hero Content nav item', async () => {
      const item = await layout.sidebar.getNavItemByLabel('Hero Content');
      await expect(item).toBeVisible();
    });

    test('should display Trust Bar nav item', async () => {
      const item = await layout.sidebar.getNavItemByLabel('Trust Bar');
      await expect(item).toBeVisible();
    });

    test('should highlight Dashboard as active on /dashboard', async () => {
      const activeItem = await layout.sidebar.getActiveNavItem();
      await expect(activeItem).toContainText('Dashboard');
    });
  });

  test.describe('User Info', () => {
    test('should display user avatar with initials', async () => {
      await expect(layout.sidebar.userAvatar).toBeVisible();
      await expect(layout.sidebar.userAvatar).toHaveText(mockUser.initials);
    });

    test('should display user name', async () => {
      await expect(layout.sidebar.userName).toBeVisible();
      await expect(layout.sidebar.userName).toHaveText(mockUser.name);
    });

    test('should display user role', async () => {
      await expect(layout.sidebar.userRole).toBeVisible();
      await expect(layout.sidebar.userRole).toHaveText(mockUser.role);
    });

    test('should display settings button', async () => {
      await expect(layout.sidebar.settingsButton).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to Products when clicking Products nav item', async ({ page }) => {
      await layout.sidebar.clickNavItem('Products');
      await expect(page).toHaveURL(/\/products/);
    });

    test('should navigate to Origins when clicking Origins nav item', async ({ page }) => {
      await layout.sidebar.clickNavItem('Origins');
      await expect(page).toHaveURL(/\/origins/);
    });
  });
});
