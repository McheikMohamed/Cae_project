import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { goFromHomePageToRegisterPage, registerWith } from './helper';

test.describe('Register', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(20000);
    await goFromHomePageToRegisterPage(page);
  });

  test('TC1.1: should register a new user and redirect to login page', async ({
    page,
  }) => {
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

    console.log('🔍 Tentative d\'inscription avec email:', email);

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
      password
    );
  });

  /*test('TC2.1: should not register a user with an existing email', async ({
    page,
  }) => {
    const email = 'testEmail8@gmail.com';
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

    console.log('🚨 Test d\'inscription avec email existant:', email);

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
      password
    );

    // Vérifiez que l'utilisateur est redirigé vers la page de connexion
    await expect(page).toHaveURL('/login', { timeout: 10000 });

    // Vérifiez que l'utilisateur est bien enregistré dans la base de données
    console.log('Vérifiez si l\'utilisateur est enregistré dans la base de données.');    

    await goFromHomePageToRegisterPage(page);
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
      password
    );

    const emailErrorLocator = page.locator('#email-helper-text');
    await emailErrorLocator.waitFor({ timeout: 10000 });

    const errorMessage = await emailErrorLocator.textContent();
    expect(['Cet email est déjà utilisé. Veuillez en choisir un autre.', 'Une erreur est survenue. Veuillez réessayer plus tard.']).toContain(errorMessage);

    console.log('✅ Message d\'erreur détecté:', errorMessage);
  });*/
});
