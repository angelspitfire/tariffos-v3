import { expect, test } from './fixtures/strict-page';

test.describe('@prod-readonly Production Read-Only Sanity', () => {
  test('@prod-readonly renders public routes and redirects /app -> /login cleanly', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const recommenderBtn = page.getByRole('button', {
      name: /No sabes qué plan elegir/i,
    });
    if (await recommenderBtn.isVisible()) {
      await recommenderBtn.click();
      await expect(page.getByText(/Clasificaciones estimadas por mes/i)).toBeVisible();
    }

    await page.goto('/ve');
    await expect(page.getByText(/4\.944/).first()).toBeVisible();

    await page.goto('/privacidad');
    await expect(page.getByRole('heading', { name: /Seguridad y Privacidad/i })).toBeVisible();

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Inicia sesión en TariffOS/i })).toBeVisible();

    await page.goto('/app');
    await expect(page).toHaveURL(/\/login/);
  });
});
