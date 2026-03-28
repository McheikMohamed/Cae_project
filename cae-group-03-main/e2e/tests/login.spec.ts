import { test, expect } from '@playwright/test';
import { LoginWith } from './helper';

test.describe('Login Page E2E Tests', () => {
  const validEmail = 'a'; // Replace with a valid email
  const validPassword = 'a'; // Replace with a valid password
  const invalidEmail = 'invalid@example.com';
  const invalidPassword = 'wrongpassword';

  test('should navigate to the login page', async ({ page }) => {
    await page.goto('/'); // Replace with your site's URL
    await page.click('text=Se connecter'); // Ensure the text matches the login button
    await expect(page).toHaveURL(/.*login/); // Verify that the URL contains "login"
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    LoginWith(page, validEmail, validPassword); // Use the helper function to log in

    // Verify that the user is redirected to the home page after login
    await expect(page).toHaveURL('/');
    // Verify that the user's name is displayed in the navbar
    await expect(page.locator('text=Bonjour')).toBeVisible();
  });

  test('should show an error message for invalid credentials', async ({ page }) => {
    LoginWith(page, invalidEmail, invalidPassword); // Use the helper function to log in with invalid credentials

    // Verify that an error message is displayed
    await expect(page.locator('text=Email ou mot de passe incorrect')).toBeVisible();
    // Verify that the user remains on the login page
    await expect(page).toHaveURL(/.*login/);
  });
});

