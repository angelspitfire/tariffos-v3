import { expect, test } from './fixtures/strict-page';

test.describe('Public Funnel & Country Landings', () => {
  test('renders root landing, interactive PlanRecommender, and navigates cleanly to /login', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const recommenderBtn = page.getByRole('button', {
      name: /No sabes qué plan elegir/i,
    });
    await expect(recommenderBtn).toBeVisible();
    await recommenderBtn.click();
    await expect(page.getByText(/Clasificaciones estimadas por mes/i)).toBeVisible();

    const cta = page.getByRole('link', { name: /Entrar|Iniciar sesión/i }).first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/login|\/onboarding/);
  });

  test('renders localized /ve landing and /privacidad page without console or layout errors', async ({
    page,
  }) => {
    await page.goto('/ve');
    await expect(page.getByText(/4\.944/).first()).toBeVisible();

    await page.goto('/privacidad');
    await expect(page.getByRole('heading', { name: /Seguridad y Privacidad/i })).toBeVisible();
  });
});
