import { test, expect } from '@playwright/test';
import { TestimonialsListPage } from '../page-objects/pages/testimonials-list.page';
import { setupApiMocks, seedAuth } from '../fixtures/api-mocks';
import { mockTestimonials } from '../fixtures/mock-data';

test.describe('Testimonials List', () => {
  let testimonialsPage: TestimonialsListPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await seedAuth(page);
    testimonialsPage = new TestimonialsListPage(page);
    await testimonialsPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Testimonials"', async () => {
      await expect(testimonialsPage.pageTitle).toHaveText('Testimonials');
    });

    test('should display page subtitle', async () => {
      await expect(testimonialsPage.pageSubtitle).toHaveText('Manage customer reviews and testimonials');
    });

    test('should display Add Testimonial button', async () => {
      await expect(testimonialsPage.addTestimonialButton).toBeVisible();
      await expect(testimonialsPage.addTestimonialButton).toContainText('Add Testimonial');
    });
  });

  test.describe('Search', () => {
    test('should display search field', async () => {
      await expect(testimonialsPage.searchField).toBeVisible();
    });

    test('should have search placeholder text', async () => {
      await expect(testimonialsPage.searchField).toHaveAttribute('placeholder', 'Search testimonials...');
    });
  });

  test.describe('Table Data', () => {
    test('should display testimonials table', async () => {
      await expect(testimonialsPage.dataTable.table).toBeVisible();
    });

    test('should display 3 testimonial rows', async () => {
      const count = await testimonialsPage.dataTable.getRowCount();
      expect(count).toBe(3);
    });

    test('should display first testimonial customer', async () => {
      const customer = await testimonialsPage.dataTable.getCellText(0, 0);
      expect(customer).toBe(mockTestimonials[0].customer);
    });

    test('should display first testimonial rating', async () => {
      const rating = await testimonialsPage.dataTable.getCellText(0, 1);
      expect(rating).toBe(mockTestimonials[0].rating);
    });
  });

  test.describe('Status Chips', () => {
    test('should display Published chip for first testimonial', async () => {
      const chip = testimonialsPage.getStatusChip(0);
      await expect(chip).toHaveText('Published');
      await expect(chip).toHaveClass(/chip--success/);
    });

    test('should display Published chip for second testimonial', async () => {
      const chip = testimonialsPage.getStatusChip(1);
      await expect(chip).toHaveText('Published');
      await expect(chip).toHaveClass(/chip--success/);
    });

    test('should display Pending chip for third testimonial', async () => {
      const chip = testimonialsPage.getStatusChip(2);
      await expect(chip).toHaveText('Pending');
      await expect(chip).toHaveClass(/chip--default/);
    });
  });

  test.describe('Actions', () => {
    test('should display edit button for each row', async () => {
      const editBtn = testimonialsPage.dataTable.getEditButton(0);
      await expect(editBtn).toBeVisible();
    });

    test('should display delete button for each row', async () => {
      const deleteBtn = testimonialsPage.dataTable.getDeleteButton(0);
      await expect(deleteBtn).toBeVisible();
    });
  });

  test.describe('Pagination', () => {
    test('should display paginator text', async () => {
      const text = await testimonialsPage.pagination.getPaginatorText();
      expect(text).toContain('Showing');
      expect(text).toContain('12');
    });
  });
});
