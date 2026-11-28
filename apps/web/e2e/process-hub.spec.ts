import { mockClassifyStreamRoute, mockExchangeRatesRoute } from './fixtures/sse-mocks';
import { expect, test } from './fixtures/strict-page';

test.describe('Process Hub, Quick-Lookup Isolation & Inbox-Zero Sidebar', () => {
  test('isolates quick_lookup from Process Hub, edits Client/Ref inline, and clears sealed dossier from En curso', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop Process Hub workflow');

    await mockExchangeRatesRoute(page);
    await mockClassifyStreamRoute(page);
    await page.goto('/app');
    await expect(page.getByText('Cargando conversaciones…')).toBeHidden({ timeout: 15_000 });

    // Seed one quick_lookup session in IndexedDB and reload to verify sidebar drawer isolation.
    await page.evaluate(async () => {
      const now = new Date().toISOString();
      await new Promise<void>((resolve) => {
        const req = indexedDB.open('tariffos-v3-workspace', 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains('threads')) db.createObjectStore('threads', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('sku_precedents')) db.createObjectStore('sku_precedents', { keyPath: 'id' });
          if (!db.objectStoreNames.contains('user_profile')) db.createObjectStore('user_profile');
        };
        req.onsuccess = () => {
          const tx = req.result.transaction('threads', 'readwrite');
          tx.objectStore('threads').put({
            id: 'e2e-ql-1',
            title: '¿Qué exige el Régimen Legal 12?',
            jurisdictionId: 've-seniat',
            status: 'regular',
            processKind: 'quick_lookup',
            operationalStatus: 'processing',
            messagesLoaded: true,
            messages: [],
            createdAt: now,
            updatedAt: now,
          });
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        };
        req.onerror = () => resolve();
      });
    });

    await page.reload();
    await expect(page.getByText('Cargando conversaciones…')).toBeHidden({ timeout: 15_000 });

    const quickDrawerBtn = page.getByRole('button', { name: /Consultas rápidas/i });
    await expect(quickDrawerBtn).toBeVisible();
    await quickDrawerBtn.click();
    await expect(page.getByText('¿Qué exige el Régimen Legal 12?')).toBeVisible();

    // Open Process Hub and confirm quick_lookup is excluded.
    await page.getByRole('button', { name: /Procesos/i }).click();
    await expect(page.getByRole('heading', { name: 'Centro de Procesos' })).toBeVisible();
    await expect(page.locator('#workspace-main').getByText('¿Qué exige el Régimen Legal 12?')).not.toBeVisible();

    // Classify a new formal item, tag Cliente/Ref inline, and approve/seal it.
    await page.getByRole('button', { name: /Volver al chat/i }).click();
    const promptBox = page.getByLabel(/Consulta arancelaria o descripción de mercancía/i);
    await promptBox.fill('Inversor solar híbrido 5 kW 48V MPPT');
    await promptBox.press('Enter');

    await expect(page.getByRole('heading', { name: 'Dictamen Técnico' })).toBeVisible();
    await page.getByRole('button', { name: /Etiquetar cliente o referencia/i }).click();
    await page.getByLabel(/Cliente o referencia del despacho/i).fill('Polar · BL-100');
    await page.getByLabel(/Cliente o referencia del despacho/i).press('Enter');
    await expect(page.getByText('Polar · BL-100').first()).toBeVisible();

    await page.getByRole('button', { name: /Aprobar y sellar/i }).click();
    await expect(page.getByText(/Dictamen sellado y listo/i)).toBeVisible();

    // Sealed ruling clears out of sidebar "En curso" and appears under "Sellados" in Process Hub.
    await expect(page.getByRole('button', { name: /Ver 1 sellado en Procesos/i })).toBeVisible();
    await page.getByRole('button', { name: /Ver 1 sellado en Procesos/i }).click();

    await expect(page.getByRole('heading', { name: 'Centro de Procesos' })).toBeVisible();
    await page.getByRole('button', { name: /Tablero/i }).click();
    const sealedCol = page.getByRole('region', { name: /Columna Sellados/i });
    await expect(sealedCol.getByText('Polar · BL-100')).toBeVisible();
  });
});
