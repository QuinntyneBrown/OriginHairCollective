import { test, expect } from '@playwright/test';
import { TeamsLayoutPage } from '../page-objects/pages/teams-layout.page';
import { setupApiMocks, injectAuth } from '../fixtures/api-mocks';

test.describe('Navigation', () => {
  let layout: TeamsLayoutPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await injectAuth(page);
    layout = new TeamsLayoutPage(page);
  });

  test.describe('Auth Guard', () => {
    test('should redirect to /login when not authenticated', async ({ page }) => {
      // Clear auth before navigating
      await page.addInitScript(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      });
      await page.goto('/home');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should allow access to protected routes when authenticated', async ({ page }) => {
      await layout.goto('/home');
      await expect(page).toHaveURL(/\/home/);
    });
  });

  test.describe('Root Redirect', () => {
    test('should redirect root "/" to "/home"', async ({ page }) => {
      await layout.goto('/');
      await expect(page).toHaveURL(/\/home/);
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('should display the Teams logo', async () => {
      await layout.gotoAndWaitForLayout('/home');
      await expect(layout.logoText).toBeVisible();
      await expect(layout.logoText).toHaveText('Teams');
    });

    test('should display 4 navigation items', async () => {
      await layout.gotoAndWaitForLayout('/home');
      await expect(layout.navItems).toHaveCount(4);
    });

    test('should navigate from Home to Chat', async ({ page }) => {
      await layout.gotoAndWaitForLayout('/home');
      await layout.clickNavItem('Chat');
      await expect(page).toHaveURL(/\/chat/);
    });

    test('should navigate from Chat to Meetings', async ({ page }) => {
      await layout.gotoAndWaitForLayout('/chat');
      await layout.clickNavItem('Meetings');
      await expect(page).toHaveURL(/\/meetings/);
    });

    test('should navigate from Meetings to Team', async ({ page }) => {
      await layout.gotoAndWaitForLayout('/meetings');
      await layout.clickNavItem('Team');
      await expect(page).toHaveURL(/\/team/);
    });

    test('should navigate from Team to Home', async ({ page }) => {
      await layout.gotoAndWaitForLayout('/team');
      await layout.clickNavItem('Home');
      await expect(page).toHaveURL(/\/home/);
    });
  });

  test.describe('User Info', () => {
    test('should display user initials', async () => {
      await layout.gotoAndWaitForLayout('/home');
      await expect(layout.userAvatar).toBeVisible();
      await expect(layout.userAvatar).toHaveText('QM');
    });

    test('should display user name', async () => {
      await layout.gotoAndWaitForLayout('/home');
      await expect(layout.userName).toBeVisible();
      await expect(layout.userName).toContainText('Quinn');
    });

    test('should display user role', async () => {
      await layout.gotoAndWaitForLayout('/home');
      await expect(layout.userRole).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should navigate to login page after logout', async ({ page }) => {
      await layout.gotoAndWaitForLayout('/home');
      await layout.logoutButton.click();
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
