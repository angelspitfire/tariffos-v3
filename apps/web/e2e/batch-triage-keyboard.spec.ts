import {
  mockBatchUploadRoute,
  mockExchangeRatesRoute,
} from './fixtures/sse-mocks';
import { expect, test } from './fixtures/strict-page';

test.describe('Batch Triage Keyboard & Row Interaction', () => {
  test('uploads batch CSV, enters triage mode, copies HS with stopPropagation, and confirms pending item', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop batch table workflow');

    await mockExchangeRatesRoute(page);
    await mockBatchUploadRoute(page);
    await page.goto('/app');
    await expect(page.getByText('Cargando conversaciones…')).toBeHidden({ timeout: 15_000 });

    const batchInput = page.locator('input[type="file"]:not([name="workspaceFiles"])');
    await batchInput.setInputFiles({
      name: 'factura-e2e.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(
        'SKU,Descripcion,Origen,Valor CIF,Cantidad\nSKU-01,Motor trifasico,CN,2400,2\n',
      ),
    });

    await expect(page.getByText('Manifiesto E2E Importación')).toBeVisible();
    await page.getByRole('button', { name: /Iniciar Triage rápido/i }).click();
    await expect(page.getByText(/Modo Triage activo/i)).toBeVisible();

    const secondRow = page.locator('tbody tr').nth(1);
    await secondRow.focus();
    await secondRow.press('Enter');
    await expect(page.getByTestId('batch-inspector-header')).toContainText('Línea #2');

    // Clicking Copy HS inside row 3 must not switch the selected row in inspector (stopPropagation)
    const row3CopyBtn = page.locator('tbody tr').nth(2).getByRole('button', { name: /Copiar código/i });
    await row3CopyBtn.click();
    await expect(page.getByTestId('batch-inspector-header')).toContainText('Línea #2');

    await page.getByRole('button', { name: /Confirmar ítem/i }).click();
    await expect(page.getByTestId('batch-inspector-header')).toContainText('Línea #1');
  });
});
