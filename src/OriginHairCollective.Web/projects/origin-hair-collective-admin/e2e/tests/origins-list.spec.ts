import { test, expect } from '@playwright/test';
import { OriginsListPage } from '../page-objects/pages/origins-list.page';
import { setupApiMocks, seedAuth } from '../fixtures/api-mocks';
import { mockOrigins } from '../fixtures/mock-data';

test.describe('Origins List', () => {
  let originsPage: OriginsListPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await seedAuth(page);
    originsPage = new OriginsListPage(page);
    await originsPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Hair Origins"', async () => {
      await expect(originsPage.pageTitle).toHaveText('Hair Origins');
    });

    test('should display page subtitle', async () => {
      await expect(originsPage.pageSubtitle).toHaveText('Manage sourcing countries and regions');
    });

    test('should display Add Origin button', async () => {
      await expect(originsPage.addOriginButton).toBeVisible();
      await expect(originsPage.addOriginButton).toContainText('Add Origin');
    });
  });

  test.describe('Search', () => {
    test('should display search field', async () => {
      await expect(originsPage.searchField).toBeVisible();
    });

    test('should have search placeholder text', async () => {
      await expect(originsPage.searchField).toHaveAttribute('placeholder', 'Search origins...');
    });
  });

  test.describe('Table Data', () => {
    test('should display origins table', async () => {
      await expect(originsPage.dataTable.table).toBeVisible();
    });

    test('should display correct header columns', async () => {
      const headers = await originsPage.dataTable.getHeaderTexts();
      const trimmed = headers.map((h) => h.trim());
      expect(trimmed).toContain('Country');
      expect(trimmed).toContain('Region');
      expect(trimmed).toContain('Description');
      expect(trimmed).toContain('Products');
      expect(trimmed).toContain('Actions');
    });

    test('should display 5 origin rows', async () => {
      const count = await originsPage.dataTable.getRowCount();
      expect(count).toBe(5);
    });

    test('should display first origin country', async () => {
      const country = await originsPage.dataTable.getCellText(0, 0);
      expect(country).toBe(mockOrigins[0].country);
    });

    test('should display first origin region', async () => {
      const region = await originsPage.dataTable.getCellText(0, 1);
      expect(region).toBe(mockOrigins[0].region);
    });

    test('should display first origin product count', async () => {
      const products = await originsPage.dataTable.getCellText(0, 3);
      expect(products).toBe(String(mockOrigins[0].products));
    });
  });

  test.describe('Actions', () => {
    test('should display edit button for each row', async () => {
      const editBtn = originsPage.dataTable.getEditButton(0);
      await expect(editBtn).toBeVisible();
    });

    test('should display delete button for each row', async () => {
      const deleteBtn = originsPage.dataTable.getDeleteButton(0);
      await expect(deleteBtn).toBeVisible();
    });
  });

  test.describe('Pagination', () => {
    test('should display paginator text', async () => {
      const text = await originsPage.pagination.getPaginatorText();
      expect(text).toContain('Showing');
      expect(text).toContain('5');
    });
  });
});
