import {
  mockClassifyStreamRoute,
  mockExchangeRatesRoute,
} from './fixtures/sse-mocks';
import { expect, test } from './fixtures/strict-page';

test.describe('Canvas Workflows (Classification, CIF, Review & PDF)', () => {
  test('renders Dictamen, switches to + CIF with live CFR math, requests review, and opens Signature modal', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop Canvas split workflow');

    await mockExchangeRatesRoute(page);
    await mockClassifyStreamRoute(page);
    await page.goto('/app');
    await expect(page.getByText('Cargando conversaciones…')).toBeHidden({ timeout: 15_000 });

    const promptBox = page.getByLabel(/Consulta arancelaria o descripción de mercancía/i);
    await promptBox.fill('Inversor solar híbrido 5 kW 48V MPPT');
    await promptBox.press('Enter');

    await expect(page.getByRole('heading', { name: 'Dictamen Técnico' })).toBeVisible();
    await expect(page.getByText('8504.40.90.00').first()).toBeVisible();

    await page.getByRole('tab', { name: /Tributos CIF/i }).click();
    const cifKpi = page.getByTestId('kpi-cif-value');
    await expect(cifKpi).toBeVisible();
    const initialCifText = await cifKpi.textContent();

    await page.getByRole('button', { name: 'CFR', exact: true }).click();
    await expect(cifKpi).not.toHaveText(initialCifText ?? '');

    await page.getByRole('tab', { name: /Dictamen/i }).click();
    await page.getByRole('button', { name: /Dejar en revisión/i }).click();
    await page.getByPlaceholder(/Nota de cumplimiento/i).fill('Validar ficha técnica fabricante');
    await page.getByRole('button', { name: /Confirmar revisión/i }).click();
    await expect(page.getByText(/Validar ficha técnica fabricante/i)).toBeVisible();

    await page.getByRole('button', { name: /Descargar PDF/i }).click();
    await expect(page.getByRole('dialog', { name: /Firma rápida/i })).toBeVisible();
  });
});
