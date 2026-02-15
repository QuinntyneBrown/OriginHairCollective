import { test, expect } from '@playwright/test';
import { ProductFormPage } from '../page-objects/pages/product-form.page';
import { setupApiMocks } from '../fixtures/api-mocks';
import { productFormOrigins, productFormTextures, productFormTypes } from '../fixtures/mock-data';

test.describe('Product Form', () => {
  let formPage: ProductFormPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    formPage = new ProductFormPage(page);
    await formPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Add New Product"', async () => {
      await expect(formPage.pageTitle).toHaveText('Add New Product');
    });

    test('should display page subtitle', async () => {
      await expect(formPage.pageSubtitle).toHaveText('Fill in the product details below');
    });

    test('should display back button', async () => {
      await expect(formPage.backButton).toBeVisible();
    });

    test('should navigate back to products list when clicking back button', async ({ page }) => {
      await formPage.backButton.click();
      await expect(page).toHaveURL(/\/products$/);
    });
  });

  test.describe('Form Card', () => {
    test('should display form card', async () => {
      await expect(formPage.formCard).toBeVisible();
    });

    test('should display form card title "Product Information"', async () => {
      await expect(formPage.formCardTitle).toHaveText('Product Information');
    });
  });

  test.describe('Form Fields', () => {
    test('should display Product Name field', async () => {
      await expect(formPage.productNameField).toBeVisible();
    });

    test('should display Origin select', async () => {
      await expect(formPage.originSelect).toBeVisible();
    });

    test('should display Texture select', async () => {
      await expect(formPage.textureSelect).toBeVisible();
    });

    test('should display Type select', async () => {
      await expect(formPage.typeSelect).toBeVisible();
    });

    test('should display Length field', async () => {
      await expect(formPage.lengthField).toBeVisible();
    });

    test('should display Price field', async () => {
      await expect(formPage.priceField).toBeVisible();
    });

    test('should display Image URL field', async () => {
      await expect(formPage.imageUrlField).toBeVisible();
    });

    test('should display Description textarea', async () => {
      await expect(formPage.descriptionField).toBeVisible();
    });
  });

  test.describe('Select Options', () => {
    test('should display origin options when Origin select is opened', async () => {
      await formPage.openSelect(formPage.originSelect);
      const options = await formPage.getSelectOptions();
      expect(options).toEqual(productFormOrigins);
    });

    test('should display texture options when Texture select is opened', async () => {
      await formPage.openSelect(formPage.textureSelect);
      const options = await formPage.getSelectOptions();
      expect(options).toEqual(productFormTextures);
    });

    test('should display type options when Type select is opened', async () => {
      await formPage.openSelect(formPage.typeSelect);
      const options = await formPage.getSelectOptions();
      expect(options).toEqual(productFormTypes);
    });

    test('should be able to select an origin option', async () => {
      await formPage.openSelect(formPage.originSelect);
      await formPage.selectOption('Cambodia - Phnom Penh');
      await expect(formPage.originSelect).toContainText('Cambodia');
    });

    test('should be able to select a texture option', async () => {
      await formPage.openSelect(formPage.textureSelect);
      await formPage.selectOption('Curly');
      await expect(formPage.textureSelect).toContainText('Curly');
    });

    test('should be able to select a type option', async () => {
      await formPage.openSelect(formPage.typeSelect);
      await formPage.selectOption('Wig');
      await expect(formPage.typeSelect).toContainText('Wig');
    });
  });

  test.describe('Form Actions', () => {
    test('should display Cancel button', async () => {
      await expect(formPage.cancelButton).toBeVisible();
      await expect(formPage.cancelButton).toContainText('Cancel');
    });

    test('should display Save Product button', async () => {
      await expect(formPage.saveButton).toBeVisible();
      await expect(formPage.saveButton).toContainText('Save Product');
    });

    test('should navigate to products list when clicking Cancel', async ({ page }) => {
      await formPage.cancelButton.click();
      await expect(page).toHaveURL(/\/products$/);
    });
  });
});
