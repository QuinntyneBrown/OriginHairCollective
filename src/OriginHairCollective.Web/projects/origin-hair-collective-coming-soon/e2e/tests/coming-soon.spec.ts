import { test, expect } from '@playwright/test';
import { ComingSoonPage } from '../page-objects/coming-soon.page';
import { setupApiMocks } from '../fixtures/api-mocks';

test.describe('Coming Soon Page', () => {
  let comingSoon: ComingSoonPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    comingSoon = new ComingSoonPage(page);
    await comingSoon.goto();
  });

  test.describe('Header', () => {
    test('should display the logo', async () => {
      await expect(comingSoon.logo).toBeVisible();
    });

    test('should display "HAIR COLLECTIVE" subtitle', async () => {
      await expect(comingSoon.logoSubtitle).toHaveText('HAIR COLLECTIVE');
    });
  });

  test.describe('Hero Section', () => {
    test('should display "COMING SOON" headline', async () => {
      await expect(comingSoon.headline).toHaveText('COMING SOON');
    });

    test('should display the tagline', async () => {
      await expect(comingSoon.tagline).toContainText(
        'Premium virgin hair crafted for the modern woman'
      );
    });

    test('should display "SPRING 2026" badge', async () => {
      await expect(comingSoon.badge).toContainText('SPRING 2026');
    });
  });

  test.describe('Email Signup', () => {
    test('should display the email form', async () => {
      await expect(comingSoon.emailForm).toBeVisible();
    });

    test('should have an email input with placeholder', async () => {
      await expect(comingSoon.emailInput).toHaveAttribute(
        'placeholder',
        'Enter your email address'
      );
    });

    test('should display "GET NOTIFIED" button', async () => {
      await expect(comingSoon.submitButton).toContainText('GET NOTIFIED');
    });

    test('should clear input after valid email submission', async () => {
      await comingSoon.submitEmail('test@example.com');
      expect(await comingSoon.getEmailInputValue()).toBe('');
    });

    test('should not submit with an invalid email', async ({ page }) => {
      const consoleLogs: string[] = [];
      page.on('console', (msg) => consoleLogs.push(msg.text()));

      await comingSoon.emailInput.fill('not-an-email');
      await comingSoon.submitButton.click();

      // Input should retain its value (form validation prevents submit)
      expect(await comingSoon.getEmailInputValue()).toBe('not-an-email');
      expect(consoleLogs.filter((l) => l.includes('Email submitted'))).toHaveLength(0);
    });

    test('should not submit with an empty email', async ({ page }) => {
      const consoleLogs: string[] = [];
      page.on('console', (msg) => consoleLogs.push(msg.text()));

      await comingSoon.submitButton.click();

      expect(consoleLogs.filter((l) => l.includes('Email submitted'))).toHaveLength(0);
    });

    test('should log email to console on valid submission', async ({ page }) => {
      const consoleLogs: string[] = [];
      page.on('console', (msg) => consoleLogs.push(msg.text()));

      await comingSoon.submitEmail('hello@originhair.com');

      expect(consoleLogs).toContain('Email submitted: hello@originhair.com');
    });
  });

  test.describe('Footer', () => {
    test('should display social icons', async () => {
      await expect(comingSoon.socialLinks).toHaveCount(2);
    });

    test('should have Instagram link with correct href', async () => {
      await expect(comingSoon.instagramLink).toHaveAttribute(
        'href',
        'https://instagram.com/originhaircollective'
      );
    });

    test('should have email link with correct href', async () => {
      await expect(comingSoon.emailLink).toHaveAttribute(
        'href',
        'mailto:hello@originhaircollective.com'
      );
    });

    test('should display the social handle', async () => {
      await expect(comingSoon.handle).toHaveText('@OriginHairCollective');
    });

    test('should display copyright notice', async () => {
      await expect(comingSoon.copyright).toContainText('2026 Origin Hair Collective');
    });
  });
});
