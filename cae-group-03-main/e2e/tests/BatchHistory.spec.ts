import { test, expect } from '@playwright/test';
import { LoginWith } from './helper';

test.describe('Create Batch Page E2E Tests', () => {
  const validEmail = 'a';
  const validPassword = 'a';
  const validProductName = 'Pomme Golden';
  const newProductName = 'Nouveau Produit';
  const description = 'Description du produit';
  const productType = 'Fruits';
  const unit = 'kg';
  const receiptDate = '2025-03-30';
  const quantity = '10';
  const pricePerUnit = '5.99';

  test.beforeEach(async ({ page }) => {
    // Log in before accessing the Create Batch page
    await LoginWith(page, validEmail, validPassword);

    // Navigate to the Create Batch page
    await page.getByRole('button', { name: /mes lots/i }).click();
    await expect(page).toHaveURL('/batch-history');
  });

  //fix images to create batch and verify that it appears here
});