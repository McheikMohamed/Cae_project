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
    await page.getByRole('button', { name: /créer un lot/i }).click();
    await expect(page).toHaveURL('/create-batch');
  });

  test('should create a batch with an existing product', async ({ page }) => {
    // Fill in the "Product Name" field with an existing product
    await page.fill('input[name="Name"]', validProductName);
    await page.click(`text=${validProductName}`); // Select the product from the dropdown list

    // Fill in the other fields
    await page.fill('input[name="receiptDate"]', receiptDate);
    await page.fill('input[name="quantity"]', quantity);
    await page.fill('input[name="pricePerUnit"]', pricePerUnit);

    // Submit the form
    await page.click('button:has-text("Proposer le lot")');

    // Verify that the batch was successfully created
    await expect(page).toHaveURL('/'); // Redirect to the home page
    await expect(page.locator('text=Lot créé avec succès')).toBeVisible();
  });

  test('should create a batch with a new product', async ({ page }) => {
    // Fill in the "Product Name" field with a new product
    await page.fill('input[name="Name"]', newProductName);

    // Fill in the fields for the new product
    await page.fill('textarea[name="description"]', description);
    await page.selectOption('select[id="type"]', productType);
    await page.selectOption('select[id="unit"]', unit);

    // Fill in the other fields
    await page.fill('input[name="receiptDate"]', receiptDate);
    await page.fill('input[name="quantity"]', quantity);
    await page.fill('input[name="pricePerUnit"]', pricePerUnit);

    // Submit the form
    await page.click('button:has-text("Proposer le lot")');

    // Verify that the batch was successfully created
    await expect(page).toHaveURL('/'); // Redirect to the home page
    await expect(page.locator('text=Lot créé avec succès')).toBeVisible();
  });

  test('should show validation errors for missing fields', async ({ page }) => {
    // Leave all fields empty and submit the form
    await page.click('button:has-text("Proposer le lot")');

    // Verify that error messages are displayed for required fields
    await expect(page.locator('text=Nom requis')).toBeVisible();
    await expect(page.locator('text=Description requise')).toBeVisible();
    await expect(page.locator('text=Type requis')).toBeVisible();
    await expect(page.locator('text=Unité requise')).toBeVisible();
    await expect(page.locator('text=La date doit être dans au moins 3 jours.')).toBeVisible();
    await expect(page.locator('text=Quantité requise')).toBeVisible();
    await expect(page.locator('text=Prix requis')).toBeVisible();
  });
});
