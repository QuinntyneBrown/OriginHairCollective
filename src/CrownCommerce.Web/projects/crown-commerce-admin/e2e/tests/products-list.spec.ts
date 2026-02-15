import { test, expect } from '@playwright/test';
import { ProductsListPage } from '../page-objects/pages/products-list.page';
import { setupApiMocks } from '../fixtures/api-mocks';
import { mockProducts } from '../fixtures/mock-data';

test.describe('Products List', () => {
  let productsPage: ProductsListPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    productsPage = new ProductsListPage(page);
    await productsPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Products"', async () => {
      await expect(productsPage.pageTitle).toHaveText('Products');
    });

    test('should display page subtitle', async () => {
      await expect(productsPage.pageSubtitle).toHaveText('Manage your hair product catalog');
    });

    test('should display Add Product button', async () => {
      await expect(productsPage.addProductButton).toBeVisible();
      await expect(productsPage.addProductButton).toContainText('Add Product');
    });

    test('should navigate to product form when clicking Add Product', async ({ page }) => {
      await productsPage.addProductButton.click();
      await expect(page).toHaveURL(/\/products\/new/);
    });
  });

  test.describe('Search and Filters', () => {
    test('should display search field', async () => {
      await expect(productsPage.searchField).toBeVisible();
    });

    test('should display Type filter button', async () => {
      await expect(productsPage.typeFilterButton).toBeVisible();
    });

    test('should display Origin filter button', async () => {
      await expect(productsPage.originFilterButton).toBeVisible();
    });

    test('should display Texture filter button', async () => {
      await expect(productsPage.textureFilterButton).toBeVisible();
    });

    test('should have search placeholder text', async () => {
      await expect(productsPage.searchField).toHaveAttribute('placeholder', 'Search products...');
    });
  });

  test.describe('Table Data', () => {
    test('should display products table', async () => {
      await expect(productsPage.dataTable.table).toBeVisible();
    });

    test('should display correct header columns', async () => {
      const headers = await productsPage.dataTable.getHeaderTexts();
      const trimmed = headers.map((h) => h.trim());
      expect(trimmed).toContain('Product Name');
      expect(trimmed).toContain('Type');
      expect(trimmed).toContain('Texture');
      expect(trimmed).toContain('Length');
      expect(trimmed).toContain('Price');
      expect(trimmed).toContain('Origin');
      expect(trimmed).toContain('Actions');
    });

    test('should display 5 product rows', async () => {
      const count = await productsPage.dataTable.getRowCount();
      expect(count).toBe(5);
    });

    test('should display first product name', async () => {
      const name = await productsPage.dataTable.getCellText(0, 0);
      expect(name).toBe(mockProducts[0].name);
    });

    test('should display first product price', async () => {
      const price = await productsPage.dataTable.getCellText(0, 4);
      expect(price).toBe(mockProducts[0].price);
    });

    test('should display edit button for each row', async () => {
      const editBtn = productsPage.dataTable.getEditButton(0);
      await expect(editBtn).toBeVisible();
    });

    test('should display delete button for each row', async () => {
      const deleteBtn = productsPage.dataTable.getDeleteButton(0);
      await expect(deleteBtn).toBeVisible();
    });
  });

  test.describe('Pagination', () => {
    test('should display paginator text', async () => {
      const text = await productsPage.pagination.getPaginatorText();
      expect(text).toContain('Showing');
      expect(text).toContain('47');
    });

    test('should have Previous button disabled on first page', async () => {
      const disabled = await productsPage.pagination.isPreviousDisabled();
      expect(disabled).toBe(true);
    });

    test('should display Next button', async () => {
      await expect(productsPage.pagination.nextButton).toBeVisible();
    });
  });

  test.describe('Interactive - Search Filtering', () => {
    test('should filter products by search term', async () => {
      await productsPage.searchField.fill('Cambodian');
      const firstRowText = await productsPage.dataTable.getCellText(0, 0);
      expect(firstRowText.toLowerCase()).toContain('cambodian');
    });
  });

  test.describe('Interactive - Delete', () => {
    test('should open confirmation dialog when clicking delete', async ({ page }) => {
      const deleteBtn = productsPage.dataTable.getDeleteButton(0);
      await deleteBtn.click();
      const dialog = page.locator('mat-dialog-container');
      await dialog.waitFor({ state: 'visible' });
      await expect(dialog.locator('[mat-dialog-title]')).toBeVisible();
    });
  });

  test.describe('Interactive - Edit Navigation', () => {
    test('should navigate to edit page when clicking edit button', async ({ page }) => {
      const editBtn = productsPage.dataTable.getEditButton(0);
      await editBtn.click();
      await expect(page).toHaveURL(/\/products\/.*\/edit/);
    });
  });
});
