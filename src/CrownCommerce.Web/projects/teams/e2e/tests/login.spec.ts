import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/pages/login.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.describe('Page Layout', () => {
    test('should display the login form title', async () => {
      await expect(loginPage.formTitle).toBeVisible();
      await expect(loginPage.formTitle).toHaveText('Sign in to Teams');
    });

    test('should display the form subtitle', async () => {
      await expect(loginPage.formSubtitle).toBeVisible();
      await expect(loginPage.formSubtitle).toHaveText('Access your team management dashboard');
    });

    test('should display the hero title on the brand panel', async () => {
      await expect(loginPage.heroTitle).toBeVisible();
      await expect(loginPage.heroTitle).toContainText('connected and empowered');
    });

    test('should display email and password fields', async () => {
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
    });

    test('should display the sign in button', async () => {
      await expect(loginPage.signInButton).toBeVisible();
      await expect(loginPage.signInButton).toContainText('Sign In');
    });

    test('should display remember me toggle', async () => {
      await expect(loginPage.rememberMeToggle).toBeVisible();
    });

    test('should display forgot password link', async () => {
      await expect(loginPage.forgotPasswordLink).toBeVisible();
      await expect(loginPage.forgotPasswordLink).toHaveText('Forgot password?');
    });

    test('should display sign up link', async () => {
      await expect(loginPage.signUpLink).toBeVisible();
      await expect(loginPage.signUpLink).toHaveText('Sign up');
    });
  });

  test.describe('Sign In Button State', () => {
    test('should disable sign in button when fields are empty', async () => {
      await expect(loginPage.signInButton).toBeDisabled();
    });

    test('should disable sign in button when only email is filled', async () => {
      await loginPage.emailInput.fill('test@example.com');
      await expect(loginPage.signInButton).toBeDisabled();
    });

    test('should disable sign in button when only password is filled', async () => {
      await loginPage.passwordInput.fill('password123');
      await expect(loginPage.signInButton).toBeDisabled();
    });

    test('should enable sign in button when both fields are filled', async () => {
      await loginPage.emailInput.fill('test@example.com');
      await loginPage.passwordInput.fill('password123');
      await expect(loginPage.signInButton).toBeEnabled();
    });
  });

  test.describe('Successful Login', () => {
    test('should navigate to /home after successful login', async ({ page }) => {
      await loginPage.login('quinn@company.com', 'password123');
      await expect(page).toHaveURL(/\/home/);
    });

    test('should show loading state while logging in', async ({ page }) => {
      // Delay the login response to observe loading state
      await page.route('**/api/identity/auth/login', async (route) => {
        await new Promise((r) => setTimeout(r, 500));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            userId: 'usr-001',
            email: 'quinn@company.com',
            firstName: 'Quinn',
            lastName: 'Mitchell',
            token: 'mock-jwt-token-12345',
          }),
        });
      });

      await loginPage.emailInput.fill('quinn@company.com');
      await loginPage.passwordInput.fill('password123');
      await loginPage.signInButton.click();
      await expect(loginPage.signInButton).toContainText('Signing in...');
    });
  });

  test.describe('Failed Login', () => {
    test('should display error message on invalid credentials', async ({ page }) => {
      await page.route('**/api/identity/auth/login', (route) => {
        route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Unauthorized"}' });
      });

      await loginPage.login('wrong@email.com', 'wrongpassword');
      await expect(loginPage.errorBanner).toBeVisible();
      await expect(loginPage.errorBanner).toContainText('Invalid email or password');
    });
  });
});
