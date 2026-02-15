import { test, expect } from '@playwright/test';
import { InquiriesListPage } from '../page-objects/pages/inquiries-list.page';
import { setupApiMocks } from '../fixtures/api-mocks';
import { mockInquiries } from '../fixtures/mock-data';

test.describe('Inquiries List', () => {
  let inquiriesPage: InquiriesListPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    inquiriesPage = new InquiriesListPage(page);
    await inquiriesPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Inquiries"', async () => {
      await expect(inquiriesPage.pageTitle).toHaveText('Inquiries');
    });

    test('should display page subtitle', async () => {
      await expect(inquiriesPage.pageSubtitle).toHaveText('Customer inquiries and product interest');
    });

    test('should display Export button', async () => {
      await expect(inquiriesPage.exportButton).toBeVisible();
      await expect(inquiriesPage.exportButton).toContainText('Export');
    });
  });

  test.describe('Search and Filters', () => {
    test('should display search field', async () => {
      await expect(inquiriesPage.searchField).toBeVisible();
    });

    test('should have search placeholder text', async () => {
      await expect(inquiriesPage.searchField).toHaveAttribute('placeholder', 'Search inquiries...');
    });
  });

  test.describe('Table Data', () => {
    test('should display inquiries table', async () => {
      await expect(inquiriesPage.dataTable.table).toBeVisible();
    });

    test('should display correct header columns', async () => {
      const headers = await inquiriesPage.dataTable.getHeaderTexts();
      const trimmed = headers.map((h) => h.trim());
      expect(trimmed).toContain('Name');
      expect(trimmed).toContain('Email');
      expect(trimmed).toContain('Phone');
      expect(trimmed).toContain('Message');
      expect(trimmed).toContain('Date');
      expect(trimmed).toContain('Actions');
    });

    test('should display 4 inquiry rows', async () => {
      const count = await inquiriesPage.dataTable.getRowCount();
      expect(count).toBe(4);
    });

    test('should display first inquiry name', async () => {
      const name = await inquiriesPage.dataTable.getCellText(0, 0);
      expect(name).toBe(mockInquiries[0].name);
    });

    test('should display first inquiry email', async () => {
      const email = await inquiriesPage.dataTable.getCellText(0, 1);
      expect(email).toBe(mockInquiries[0].email);
    });

    test('should display first inquiry phone', async () => {
      const phone = await inquiriesPage.dataTable.getCellText(0, 2);
      expect(phone).toBe(mockInquiries[0].phone);
    });
  });

  test.describe('Actions', () => {
    test('should display view button for each row', async () => {
      const viewBtn = inquiriesPage.getViewButton(0);
      await expect(viewBtn).toBeVisible();
    });

    test('should display delete button for each row', async () => {
      const deleteBtn = inquiriesPage.getDeleteButton(0);
      await expect(deleteBtn).toBeVisible();
    });
  });

  test.describe('Pagination', () => {
    test('should display paginator text', async () => {
      const text = await inquiriesPage.pagination.getPaginatorText();
      expect(text).toContain('Showing');
      expect(text).toContain('inquiries');
    });

    test('should display Next button', async () => {
      await expect(inquiriesPage.pagination.nextButton).toBeVisible();
    });
  });

  test.describe('Interactive - Search Filtering', () => {
    test('should filter inquiries by search term', async () => {
      await inquiriesPage.searchField.fill('Sarah');
      const firstRowText = await inquiriesPage.dataTable.getCellText(0, 0);
      expect(firstRowText).toContain('Sarah');
    });
  });

  test.describe('Interactive - View Detail', () => {
    test('should open inquiry detail dialog when clicking view', async ({ page }) => {
      const viewBtn = inquiriesPage.getViewButton(0);
      await viewBtn.click();
      const dialog = page.locator('mat-dialog-container');
      await dialog.waitFor({ state: 'visible' });
      await expect(dialog.locator('[mat-dialog-title]')).toHaveText('Inquiry Details');
    });

    test('should display inquiry details in dialog', async ({ page }) => {
      const viewBtn = inquiriesPage.getViewButton(0);
      await viewBtn.click();
      const dialog = page.locator('mat-dialog-container');
      await dialog.waitFor({ state: 'visible' });
      await expect(dialog).toContainText('Name');
      await expect(dialog).toContainText('Email');
    });

    test('should close dialog when clicking Close', async ({ page }) => {
      const viewBtn = inquiriesPage.getViewButton(0);
      await viewBtn.click();
      const dialog = page.locator('mat-dialog-container');
      await dialog.waitFor({ state: 'visible' });
      await dialog.locator('button').filter({ hasText: 'Close' }).click();
      await expect(dialog).not.toBeVisible();
    });
  });

  test.describe('Interactive - Delete', () => {
    test('should open confirmation dialog when clicking delete', async ({ page }) => {
      const deleteBtn = inquiriesPage.getDeleteButton(0);
      await deleteBtn.click();
      const dialog = page.locator('mat-dialog-container');
      await dialog.waitFor({ state: 'visible' });
      await expect(dialog.locator('[mat-dialog-title]')).toBeVisible();
    });
  });

  test.describe('Interactive - Export', () => {
    test('should have Export button clickable', async () => {
      await expect(inquiriesPage.exportButton).toBeEnabled();
    });
  });
});
