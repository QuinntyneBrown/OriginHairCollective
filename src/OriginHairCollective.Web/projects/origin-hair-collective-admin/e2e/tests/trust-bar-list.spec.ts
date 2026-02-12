import { test, expect } from '@playwright/test';
import { TrustBarListPage } from '../page-objects/pages/trust-bar-list.page';
import { setupApiMocks, seedAuth } from '../fixtures/api-mocks';
import { mockTrustBarItems } from '../fixtures/mock-data';

test.describe('Trust Bar List', () => {
  let trustBarPage: TrustBarListPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await seedAuth(page);
    trustBarPage = new TrustBarListPage(page);
    await trustBarPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Trust Bar Items"', async () => {
      await expect(trustBarPage.pageTitle).toHaveText('Trust Bar Items');
    });

    test('should display page subtitle', async () => {
      await expect(trustBarPage.pageSubtitle).toHaveText('Manage trust indicators displayed on your marketing site');
    });

    test('should display Add Item button', async () => {
      await expect(trustBarPage.addItemButton).toBeVisible();
      await expect(trustBarPage.addItemButton).toContainText('Add Item');
    });
  });

  test.describe('Table Data', () => {
    test('should display trust bar table', async () => {
      await expect(trustBarPage.dataTable.table).toBeVisible();
    });

    test('should display 4 trust bar item rows', async () => {
      const count = await trustBarPage.dataTable.getRowCount();
      expect(count).toBe(4);
    });

    test('should display first item label', async () => {
      const label = await trustBarPage.dataTable.getCellText(0, 1);
      expect(label).toBe(mockTrustBarItems[0].label);
    });

    test('should display first item description', async () => {
      const desc = await trustBarPage.dataTable.getCellText(0, 2);
      expect(desc).toBe(mockTrustBarItems[0].description);
    });
  });

  test.describe('Icon Column', () => {
    test('should display icon for first row', async () => {
      const icon = trustBarPage.getTrustIcon(0);
      await expect(icon).toBeVisible();
    });

    test('should display icon for second row', async () => {
      const icon = trustBarPage.getTrustIcon(1);
      await expect(icon).toBeVisible();
    });
  });

  test.describe('Status Chips', () => {
    test('should display Active status chip for first item', async () => {
      const chip = trustBarPage.getStatusChip(0);
      await expect(chip).toHaveText('Active');
      await expect(chip).toHaveClass(/chip--success/);
    });
  });

  test.describe('Actions', () => {
    test('should display edit button for each row', async () => {
      const editBtn = trustBarPage.dataTable.getEditButton(0);
      await expect(editBtn).toBeVisible();
    });

    test('should display delete button for each row', async () => {
      const deleteBtn = trustBarPage.dataTable.getDeleteButton(0);
      await expect(deleteBtn).toBeVisible();
    });
  });
});
