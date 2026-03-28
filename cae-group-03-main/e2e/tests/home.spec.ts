import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(20000);
    await page.goto('/');
  });

  test('TC1.1: should navigate to the login page when login button is clicked', async ({ page }) => {
    const loginButton = page.locator('text="Se connecter"').first();
    await loginButton.click();
    await expect(page).toHaveURL('/login');
  });

  test('TC1.2: should navigate to the register page when register button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /s'inscrire/i }).click();
    await expect(page).toHaveURL('/register');
  });

});

test.describe('Home Page - Producer Role', () => {
    test.beforeEach(async ({ page }) => {
      // Login with Producer role
      await page.goto('/login');
      await page.fill('#email', 'p');
      await page.fill('#password', 'p');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/', { timeout: 10000 });
    });
  
    test('TC2.1: should navigate to the "Créer un lot" page when the button is clicked', async ({ page }) => {
      const createBatchButton = page.getByRole('button', { name: /créer un lot/i });
      await createBatchButton.click();
  
      await expect(page).toHaveURL('/create-batch', { timeout: 10000 });
    });

    test('TC2.2: should navigate to the "Profil" page when the button is clicked', async ({ page }) => {
        const createBatchButton = page.getByRole('button', { name: /profil/i });
        await createBatchButton.click();
    
        await expect(page).toHaveURL('/profile');
    });

    test('TC2.3: should navigate to the "Mes lots" page when the button is clicked', async ({ page }) => {
        const createBatchButton = page.getByRole('button', { name: /mes lots/i });
        await createBatchButton.click();
    
        await expect(page).toHaveURL('/batch-history');
    });

    test('TC2.4: should navigate to the "login" page when the button is clicked', async ({ page }) => {
        const createBatchButton = page.getByRole('button', { name: /se déconnecter/i });
        await createBatchButton.click();
    
        await expect(page).toHaveURL('/login');
    });
});

test.describe('Home Page - Manager Role', () => {
    test.beforeEach(async ({ page }) => {
        // Login with Producer role
        await page.goto('/login');
        await page.fill('#email', 'g');
        await page.fill('#password', 'g');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');
    });
    
    test('TC3.1: should navigate to the "Ajouter un compte" page when the button is clicked', async ({ page }) => {
        const createBatchButton = page.getByRole('button', { name: /ajouter un compte/i });
        await createBatchButton.click();
    
        await expect(page).toHaveURL('/register-admin');
    });

    test('TC3.2: should navigate to the "Profil" page when the button is clicked', async ({ page }) => {
        const createBatchButton = page.getByRole('button', { name: /profil/i });
        await createBatchButton.click();
    
        await expect(page).toHaveURL('/profile');
    });

    test('TC3.3: should navigate to the "login" page when the button is clicked', async ({ page }) => {
        const createBatchButton = page.getByRole('button', { name: /se déconnecter/i });
        await createBatchButton.click();
    
        await expect(page).toHaveURL('/login');
    });

});

test.describe('Home Page - Client Role', () => {
    test.beforeEach(async ({ page }) => {
        // Login with Producer role
        await page.goto('/login');
        await page.fill('#email', 'c');
        await page.fill('#password', 'c');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/');
    });

    test('TC4.1: should navigate to the "Profil" page when the button is clicked', async ({ page }) => {
        const createBatchButton = page.getByRole('button', { name: /profil/i });
        await createBatchButton.click();
    
        await expect(page).toHaveURL('/profile');
    });

    test('TC4.2: should navigate to the "login" page when the button is clicked', async ({ page }) => {
        const createBatchButton = page.getByRole('button', { name: /se déconnecter/i });
        await createBatchButton.click();
    
        await expect(page).toHaveURL('/login');
    });

});
