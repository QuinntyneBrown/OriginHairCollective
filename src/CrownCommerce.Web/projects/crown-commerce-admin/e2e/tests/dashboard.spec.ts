import { test, expect } from '@playwright/test';
import { DashboardPage } from '../page-objects/pages/dashboard.page';
import { setupApiMocks } from '../fixtures/api-mocks';
import { mockMetrics, mockRecentProducts, mockRecentInquiries } from '../fixtures/mock-data';

test.describe('Dashboard', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test.describe('Redirect', () => {
    test('should redirect root "/" to "/dashboard"', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should display the dashboard page', async () => {
      await expect(dashboard.welcomeText).toBeVisible();
    });
  });

  test.describe('Welcome Section', () => {
    test('should display welcome title', async () => {
      await expect(dashboard.pageTitle).toBeVisible();
      await expect(dashboard.pageTitle).toContainText('Welcome back, Quinn');
    });

    test('should display welcome subtitle', async () => {
      await expect(dashboard.pageSubtitle).toBeVisible();
      await expect(dashboard.pageSubtitle).toContainText("Here's what's happening");
    });
  });

  test.describe('Metric Cards', () => {
    test('should display 5 metric cards', async () => {
      const count = await dashboard.getMetricCardCount();
      expect(count).toBe(5);
    });

    test('should display Total Products metric', async () => {
      const info = await dashboard.getMetricCardInfo(0);
      expect(info.label).toBe(mockMetrics[0].label);
      expect(info.value).toBe(mockMetrics[0].value);
    });

    test('should display Active Inquiries metric', async () => {
      const info = await dashboard.getMetricCardInfo(1);
      expect(info.label).toBe(mockMetrics[1].label);
      expect(info.value).toBe(mockMetrics[1].value);
    });

    test('should display Hair Origins metric', async () => {
      const info = await dashboard.getMetricCardInfo(2);
      expect(info.label).toBe(mockMetrics[2].label);
      expect(info.value).toBe(mockMetrics[2].value);
    });

    test('should display Testimonials metric', async () => {
      const info = await dashboard.getMetricCardInfo(3);
      expect(info.label).toBe(mockMetrics[3].label);
      expect(info.value).toBe(mockMetrics[3].value);
    });

    test('should display icon for Total Products metric', async () => {
      const info = await dashboard.getMetricCardInfo(0);
      expect(info.change).toContain(mockMetrics[0].change);
    });

    test('should display icon for Active Inquiries metric', async () => {
      const info = await dashboard.getMetricCardInfo(1);
      expect(info.change).toContain(mockMetrics[1].change);
    });
  });

  test.describe('Recent Products Table', () => {
    test('should display Recent Products card title', async () => {
      await expect(dashboard.recentProductsTitle).toHaveText('Recent Products');
    });

    test('should display View All link for products', async () => {
      await expect(dashboard.recentProductsViewAll).toBeVisible();
      await expect(dashboard.recentProductsViewAll).toHaveText('View All');
    });

    test('should display 4 recent products', async () => {
      const count = await dashboard.getRecentProductCount();
      expect(count).toBe(4);
    });

    test('should display first product details', async () => {
      const product = await dashboard.getRecentProductInfo(0);
      expect(product.name).toBe(mockRecentProducts[0].name);
      expect(product.type).toBe(mockRecentProducts[0].type);
      expect(product.price).toBe(mockRecentProducts[0].price);
      expect(product.origin).toBe(mockRecentProducts[0].origin);
    });

    test('should navigate to products page via View All link', async ({ page }) => {
      await dashboard.recentProductsViewAll.click();
      await expect(page).toHaveURL(/\/products/);
    });
  });

  test.describe('Recent Inquiries', () => {
    test('should display Recent Inquiries card title', async () => {
      await expect(dashboard.recentInquiriesTitle).toHaveText('Recent Inquiries');
    });

    test('should display View All link for inquiries', async () => {
      await expect(dashboard.recentInquiriesViewAll).toBeVisible();
      await expect(dashboard.recentInquiriesViewAll).toHaveText('View All');
    });

    test('should display 4 recent inquiries', async () => {
      const count = await dashboard.getInquiryItemCount();
      expect(count).toBe(4);
    });

    test('should display first inquiry details', async () => {
      const inquiry = await dashboard.getInquiryItemInfo(0);
      expect(inquiry.initials).toBe(mockRecentInquiries[0].initials);
      expect(inquiry.name).toBe(mockRecentInquiries[0].name);
      expect(inquiry.message).toBe(mockRecentInquiries[0].message);
    });

    test('should navigate to inquiries page via View All link', async ({ page }) => {
      await dashboard.recentInquiriesViewAll.click();
      await expect(page).toHaveURL(/\/inquiries/);
    });
  });
});
