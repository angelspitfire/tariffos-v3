import { mockExchangeRatesRoute } from './fixtures/sse-mocks';
import { expect, test } from './fixtures/strict-page';

test.describe('Modals, Radix Stacking & Dirty-Guard', () => {
  test('clicks Undo toast directly over open SkuCatalogModal, closes via Escape, and guards dirty Settings close', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop sidebar & modal stack');

    await mockExchangeRatesRoute(page);
    await page.goto('/app');
    await expect(page.getByText('Cargando conversaciones…')).toBeHidden({ timeout: 15_000 });

    await page.getByRole('button', { name: /Catálogo SKU/i }).click();
    const skuDialog = page.getByRole('dialog', { name: /Catálogo de precedentes SKU/i });
    await expect(skuDialog).toBeVisible();

    await skuDialog.getByRole('button', { name: /Nuevo SKU/i }).click();
    await skuDialog.getByLabel('Código SKU').fill('E2E-TEST-01');
    await skuDialog.getByLabel('Descripción breve').fill('Valvula reguladora industrial');
    await skuDialog.getByLabel('Partida arancelaria').fill('8481.80.99.00');
    await skuDialog.getByRole('button', { name: /Guardar precedente/i }).click();

    await expect(skuDialog.getByText('E2E-TEST-01')).toBeVisible();

    // Delete item and immediately click portaled Undo ("Deshacer") while Radix modal stays open
    await skuDialog.getByRole('button', { name: /Eliminar SKU E2E-TEST-01/i }).click();
    await expect(skuDialog.getByText('E2E-TEST-01')).not.toBeVisible();

    const undoBtn = page.getByRole('button', { name: /^Deshacer$/i });
    await expect(undoBtn).toBeVisible();
    await undoBtn.click();
    await expect(skuDialog.getByText('E2E-TEST-01')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(skuDialog).not.toBeVisible();

    // Open Settings and verify dirty-guard warning on unsaved changes
    await page.getByRole('button', { name: /Cuenta y ajustes/i }).click();
    await page.getByRole('button', { name: /^Configuración$/i }).click();

    const settingsDialog = page.getByRole('dialog', { name: /Configuración del workspace/i });
    await expect(settingsDialog).toBeVisible();

    await settingsDialog.getByLabel(/Nombre completo/i).fill('Agente Modificado E2E');
    await settingsDialog.getByRole('button', { name: /^Cancelar$/i }).click();
    await expect(settingsDialog.getByText(/Hay cambios sin guardar/i)).toBeVisible();

    await settingsDialog.getByRole('button', { name: /Descartar cambios/i }).click();
    await expect(settingsDialog).not.toBeVisible();
  });
});
