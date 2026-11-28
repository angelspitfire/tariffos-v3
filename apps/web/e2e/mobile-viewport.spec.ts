import {
  mockClassifyStreamRoute,
  mockExchangeRatesRoute,
} from './fixtures/sse-mocks';
import { expect, test } from './fixtures/strict-page';

test.describe('Mobile Viewport Layout & Pane Tabs (390x844)', () => {
  test('keeps horizontal overflow zero and switches smoothly between Chat and Dictamen tabs', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile viewport only');

    await mockExchangeRatesRoute(page);
    await mockClassifyStreamRoute(page);
    await page.goto('/app');
    await expect(page.getByText('Cargando conversaciones…')).toBeHidden({ timeout: 15_000 });

    const promptBox = page.getByLabel(/Consulta arancelaria o descripción de mercancía/i);
    await promptBox.fill('Inversor solar híbrido 5 kW 48V MPPT');
    await promptBox.press('Enter');

    const mobileTabs = page.getByRole('navigation', { name: /Cambiar vista móvil/i });
    await expect(mobileTabs).toBeVisible();

    const dictamenTab = mobileTabs.getByRole('button', { name: /Dictamen/i });
    await dictamenTab.click();
    await expect(page.getByRole('heading', { name: 'Dictamen Técnico' })).toBeVisible();

    const overflowDiff = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflowDiff).toBeLessThanOrEqual(1);

    await mobileTabs.getByRole('button', { name: /Chat/i }).click();
    await expect(promptBox).toBeVisible();
  });
});
