import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/pages/login.page';
import { setupApiMocks, seedAuth } from '../fixtures/api-mocks';
import { mockCredentials } from '../fixtures/mock-data';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    loginPage = new LoginPage(page);
  });

  test.describe('Page Layout', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
    });

    test('should display the login page', async () => {
      await loginPage.expectOnLoginPage();
    });

    test('should display the logo', async () => {
      await expect(loginPage.logoIcon).toBeVisible();
      await expect(loginPage.logoIcon).toHaveText('O');
      await expect(loginPage.logoName).toHaveText('Origin Hair');
      await expect(loginPage.logoSub).toHaveText('Admin Panel');
    });

    test('should display sign in title and subtitle', async () => {
      await expect(loginPage.title).toHaveText('Sign in');
      await expect(loginPage.subtitle).toContainText('Enter your credentials');
    });

    test('should display email and password fields', async () => {
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
    });

    test('should display sign in button', async () => {
      await expect(loginPage.loginButton).toBeVisible();
      await expect(loginPage.loginButton).toContainText('Sign in');
    });

    test('should not display error message initially', async () => {
      await loginPage.expectErrorHidden();
    });
  });

  test.describe('Password Visibility Toggle', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
    });

    test('should have password field hidden by default', async () => {
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('should toggle password visibility when clicking the eye icon', async () => {
      await loginPage.togglePasswordButton.click();
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
      await loginPage.togglePasswordButton.click();
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Form Validation', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
    });

    test('should show error when submitting empty form', async () => {
      await loginPage.submit();
      await loginPage.expectErrorVisible('Please enter your email and password.');
    });

    test('should show error when submitting with only email', async () => {
      await loginPage.fillEmail(mockCredentials.valid.email);
      await loginPage.submit();
      await loginPage.expectErrorVisible('Please enter your email and password.');
    });

    test('should show error when submitting with only password', async () => {
      await loginPage.fillPassword(mockCredentials.valid.password);
      await loginPage.submit();
      await loginPage.expectErrorVisible('Please enter your email and password.');
    });
  });

  test.describe('Authentication', () => {
    test.beforeEach(async () => {
      await loginPage.goto();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await loginPage.login(
        mockCredentials.valid.email,
        mockCredentials.valid.password,
      );
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should show error with invalid credentials', async () => {
      await loginPage.login(
        mockCredentials.invalid.email,
        mockCredentials.invalid.password,
      );
      await loginPage.expectErrorVisible('Invalid email or password.');
    });

    test('should show error with valid email but wrong password', async () => {
      await loginPage.login(
        mockCredentials.valid.email,
        'WrongPassword123!',
      );
      await loginPage.expectErrorVisible('Invalid email or password.');
    });
  });

  test.describe('Route Protection', () => {
    test('should redirect unauthenticated users to login from dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect unauthenticated users to login from products', async ({ page }) => {
      await page.goto('/products');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect unauthenticated users to login from root', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should allow authenticated users to access dashboard', async ({ page }) => {
      await seedAuth(page);
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Login Flow Integration', () => {
    test('should complete full login flow and see dashboard', async ({ page }) => {
      await loginPage.goto();
      await loginPage.login(
        mockCredentials.valid.email,
        mockCredentials.valid.password,
      );
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('.welcome-row .page-title')).toBeVisible();
    });
  });
});
