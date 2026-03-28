import { test, expect } from '@playwright/test';
import { registerWith } from './helper';
import { faker } from '@faker-js/faker';

test.describe('Profile Page E2E Tests', () => {
  const firstName = 'John';
  const lastName = 'Doe';
  const honorific = 'M.';
  const street = 'Main Street';
  const number = '123';
  const box = 'A';
  const postalCode = '12345';
  const city = 'Cityville';
  const phoneNumber = '0123456789';
  const email = faker.internet.email();
  const oldPassword = 'Password1&';
  const newPassword = 'NewPassword1&';

  test.beforeEach(async ({ page }) => {
    await registerWith(
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
      oldPassword
    );

    await page.getByRole('button', { name: /profil/i }).click();
    await expect(page).toHaveURL('/profile');
  });

  test('TC: should change the user password successfully', async ({ page }) => {

    await page.getByRole('button', { name: /changer de mot de passe/i }).click();
    await expect(page).toHaveURL('/change-password');

    await page.fill('input[name="ancienPassword"]', oldPassword);
    await page.fill('input[name="nouveauPassword"]', newPassword);
    await page.fill('input[name="confirmPassword"]', newPassword);

    await page.click('button:has-text("Valider")');

    await expect(page.locator('text=Mot de passe mis à jour')).toBeVisible();
  });
});
