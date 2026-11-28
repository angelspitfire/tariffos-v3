import { getOptionalE2ECredentials, isRemotePreviewTarget } from './fixtures/auth-states';
import { expect, test } from './fixtures/strict-page';

test.describe('Auth Routing & Access Gates', () => {
  test('supports /login email clear button and offline onboarding -> /app entry', async ({
    page,
  }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Inicia sesión en TariffOS/i })).toBeVisible();

    const emailInput = page.getByLabel(/Correo electrónico/i);
    await emailInput.fill('pruebas@aduanas.ve');
    await page.getByRole('button', { name: /Limpiar correo electrónico/i }).click();
    await expect(emailInput).toHaveValue('');

    if (!isRemotePreviewTarget()) {
      await emailInput.fill('agente@aduanas.ve');
      await page.getByLabel(/^Contraseña$/i).fill('ClaveDemo!2026');
      await page.getByRole('button', { name: /Ingresar con correo/i }).click();
      await expect(page).toHaveURL(/\/onboarding|\/app/);
    }
  });

  test('enforces SSR login redirects on protected routes when running against cloud/Preview', async ({
    page,
  }) => {
    test.skip(!isRemotePreviewTarget(), 'Cloud SSR session gates only run against PLAYWRIGHT_BASE_URL');

    for (const protectedRoute of ['/app', '/activate-plan', '/admin/billing']) {
      await page.goto(protectedRoute);
      await expect(page).toHaveURL(/\/login/);
    }

    const creds = getOptionalE2ECredentials();
    test.skip(!creds, 'No E2E_BROKER_EMAIL / E2E_BROKER_PASSWORD configured');
    if (!creds) return;

    await page.goto('/login');
    await page.getByLabel(/Correo electrónico/i).fill(creds.email);
    await page.getByLabel(/^Contraseña$/i).fill(creds.password);
    await page.getByRole('button', { name: /Ingresar con correo/i }).click();
    await expect(page).toHaveURL(/\/app/, { timeout: 20_000 });
  });
});
