import { getOptionalE2ECredentials } from './fixtures/auth-states';
import { expect, test } from './fixtures/strict-page';

test.describe('@live Eve + Retrieval Classification Smoke', () => {
  test('@live authenticates broker account, classifies one item in /app, and renders Dictamen', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Single desktop live run');
    const creds = getOptionalE2ECredentials();
    test.skip(!creds, 'Requires E2E_BROKER_EMAIL and E2E_BROKER_PASSWORD');
    if (!creds) return;

    await page.goto('/login');
    await page.getByLabel(/Correo electrónico/i).fill(creds.email);
    await page.getByLabel(/^Contraseña$/i).fill(creds.password);
    await page.getByRole('button', { name: /Ingresar con correo/i }).click();
    await expect(page).toHaveURL(/\/app/, { timeout: 25_000 });

    const promptBox = page.getByLabel(/Consulta arancelaria o descripción de mercancía/i);
    await promptBox.fill('Laptop MacBook Pro 14 pulgadas SSD 512GB');
    await promptBox.press('Enter');

    await expect(page.getByRole('heading', { name: 'Dictamen Técnico' })).toBeVisible({
      timeout: 30_000,
    });
  });
});
