import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { goFromHomePageToRegisterPage, registerWith, registerWithAdmin } from './helper';

test.describe('Register Admin', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(20000);
    // Navigate to the Register Admin page
    await page.goto('/register-admin');
    await expect(page).toHaveURL(/.*register-admin/);
  });

  test('TC1.1: should register a new admin and redirect to the home page', async ({ page }) => {
    const email = faker.internet.email();
    const password = 'Password1&';
    const firstName = 'John';
    const lastName = 'Doe';
    const honorific = 'M.';
    const street = 'Main Street';
    const number = '123';
    const box = 'A';
    const postalCode = '12345';
    const city = 'Cityville';
    const phoneNumber = '123456789';
    const company = 'TestCompany';
    const role = 'Gestionnaire'; // Role for the admin

    console.log('🔍 Attempting to register admin with email:', email);

    await registerWithAdmin(
      page,
      firstName,
      lastName,
      honorific,
      street,
      number,
      box,
      postalCode,
      city,
      phoneNumber,
      email,
      password,
      company,
      role
    );

    // Verify that the user is redirected to the home page
    await expect(page).toHaveURL('/');
    console.log('✅ Admin registration successful and redirected to home page');
  });

  test('TC2.1: should not register an admin with an existing email', async ({ page }) => {
    const email = 'existingAdmin@example.com'; // Replace with an email that already exists in the database
    const password = 'Password1&';
    const firstName = 'John';
    const lastName = 'Doe';
    const honorific = 'M.';
    const street = 'Main Street';
    const number = '123';
    const box = 'A';
    const postalCode = '12345';
    const city = 'Cityville';
    const phoneNumber = '123456789';
    const company = 'TestCompany';
    const role = 'Gestionnaire';

    console.log('🚨 Testing registration with existing email:', email);

    await registerWithAdmin(
      page,
      firstName,
      lastName,
      honorific,
      street,
      number,
      box,
      postalCode,
      city,
      phoneNumber,
      email,
      password,
      company,
      role
    );

    await page.goto('/register-admin');

    await registerWithAdmin(
        page,
        firstName,
        lastName,
        honorific,
        street,
        number,
        box,
        postalCode,
        city,
        phoneNumber,
        email,
        password,
        company,
        role
      );

    // Verify that an error message is displayed
    const emailErrorLocator = page.locator('#email-helper-text');
    await emailErrorLocator.waitFor({ timeout: 10000 });

    const errorMessage = await emailErrorLocator.textContent();
    expect([
      'Cet email est déjà utilisé. Veuillez en choisir un autre.',
      'Une erreur est survenue. Veuillez réessayer plus tard.',
    ]).toContain(errorMessage);

    console.log('✅ Error message detected:', errorMessage);
  });

  test('TC3.1: should show validation errors for missing fields', async ({ page }) => {
    // Leave all fields empty and submit the form
    await page.click('button:has-text("Confirmer")');

    // Verify that error messages are displayed for required fields
    await expect(page.locator('text=Veuillez sélectionner une civilité')).toBeVisible();
    await expect(page.locator('text=Prénom requis')).toBeVisible();
    await expect(page.locator('text=Rue requise')).toBeVisible();
    await expect(page.locator('text=Code postal requis')).toBeVisible();
    await expect(page.locator('text=Ville requise')).toBeVisible();
    await expect(page.locator('text=Numéro de téléphone requis')).toBeVisible();
    await expect(page.locator('text=Email requis')).toBeVisible();
    await expect(page.locator('text=Veuillez sélectionner un rôle')).toBeVisible();
    await expect(page.locator('text=Le mot de passe doit contenir au moins 8 caractères')).toBeVisible();
    await expect(page.locator('text=Confirmation requise')).toBeVisible();

    console.log('✅ Validation errors displayed for missing fields');
  });
});
