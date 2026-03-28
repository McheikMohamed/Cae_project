import { Page, expect } from '@playwright/test';

const goFromHomePageToRegisterPage = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: /s'inscrire/i }).click();
  await expect(page).toHaveURL('/register');
};

const registerWith = async (
  page: Page,
  firstName: string,
  lastName: string,
  honorific: string,
  street: string,
  number: string,
  box: string,
  postalCode: string,
  city: string,
  phoneNumber: string,
  email: string,
  password: string
) => {
  await page.getByLabel('Civilité').click();
  await page.getByRole('option', { name: honorific }).click();

  await page.locator('#firstName').fill(firstName);
  await page.locator('#lastName').fill(lastName);
  await page.locator('#street').fill(street);
  await page.locator('#number').fill(number);
  await page.locator('#box').fill(box);
  await page.locator('#postalCode').fill(postalCode);
  await page.locator('#city').fill(city);
  await page.locator('#phoneNumber').fill(phoneNumber);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);

  await page.getByRole('button', { name: 'Confirmer' }).click();
};

const registerWithAdmin = async (
  page: Page,
  firstName: string,
  lastName: string,
  honorific: string,
  street: string,
  number: string,
  box: string,
  postalCode: string,
  city: string,
  phoneNumber: string,
  email: string,
  password: string,
  company: string,
  role: string
) => {
  await page.getByLabel('Civilité').click();
  await page.getByRole('option', { name: honorific }).click();

  await page.locator('#firstName').fill(firstName);
  await page.locator('#lastName').fill(lastName);
  await page.locator('#street').fill(street);
  await page.locator('#number').fill(number);
  await page.locator('#box').fill(box);
  await page.locator('#postalCode').fill(postalCode);
  await page.locator('#city').fill(city);
  await page.locator('#phoneNumber').fill(phoneNumber);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);
  await page.locator('#company').fill(company);
  await page.getByLabel('Rôle').click();
  await page.getByRole('option', { name: role }).click();

  await page.getByRole('button', { name: 'Confirmer' }).click();
};

const LoginWith = async (
  page: Page,
  email: string,
  password: string
) => {
  console.log('🔍 Tentative de connexion avec :', { email, password });

  // go to the login page
  await page.goto('/login');
  console.log('✅ Navigué vers la page de login');

  // fill email field
  await page.locator('#email').fill(email);
  const filledEmail = await page.inputValue('#email');
  if (filledEmail !== email) {
    throw new Error(`❌ Le champ email n'a pas été correctement rempli : attendu "${email}", obtenu "${filledEmail}"`);
  }
  console.log('✅ Champ email rempli avec :', filledEmail);

  // fill password field
  await page.locator('#password').fill(password);
  const filledPassword = await page.inputValue('#password');
  if (filledPassword !== password) {
    throw new Error(`❌ Le champ mot de passe n'a pas été correctement rempli : attendu "${password}", obtenu "${filledPassword}"`);
  }
  console.log('✅ Champ mot de passe rempli avec :', filledPassword);

  // click on the login button
  await page.getByRole('button', { name: 'confirmer' }).click();
  console.log('✅ Bouton "confirmer" cliqué');
};

export { goFromHomePageToRegisterPage, registerWith, LoginWith, registerWithAdmin };
