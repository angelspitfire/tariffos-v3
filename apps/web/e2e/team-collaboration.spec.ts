import { mockClassifyStreamRoute, mockExchangeRatesRoute } from './fixtures/sse-mocks';
import { expect, test } from './fixtures/strict-page';

test.describe('Multi-Role Team Collaboration & Process Activity', () => {
  test('invites member via Equipo tab and records review + seal activity on Dossier', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop collaboration workflow');

    await mockExchangeRatesRoute(page);
    await mockClassifyStreamRoute(page);
    await page.route('**/api/workspace/team**', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'inv-e2e-1',
            email: 'analista@agencia.ve',
            role: 'ANALYST',
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ role: 'OWNER', currentUser: null, members: [], invitations: [] }),
      });
    });

    await page.goto('/app');
    await expect(page.getByText('Cargando conversaciones…')).toBeHidden({ timeout: 15_000 });

    await page.getByRole('button', { name: /Cuenta y ajustes/i }).click();
    await page.getByRole('button', { name: /^Configuración$/i }).click();

    const settingsDialog = page.getByRole('dialog', { name: /Configuración del workspace/i });
    await expect(settingsDialog).toBeVisible();
    await settingsDialog.getByRole('button', { name: /^Equipo$/i }).click();
    await settingsDialog.getByLabel(/Correo del colaborador/i).fill('analista@agencia.ve');
    await settingsDialog.getByLabel(/Rol de invitación/i).selectOption('ANALYST');
    await settingsDialog.getByRole('button', { name: /Enviar invitación/i }).click();
    await expect(settingsDialog.getByText(/Invitación enviada a analista@agencia\.ve/i)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(settingsDialog).not.toBeVisible();

    const promptBox = page.getByLabel(/Consulta arancelaria o descripción de mercancía/i);
    await promptBox.fill('Inversor solar híbrido 5 kW 48V MPPT');
    await promptBox.press('Enter');

    await expect(page.getByRole('heading', { name: 'Dictamen Técnico' })).toBeVisible();
    await page.getByRole('button', { name: /Dejar en revisión/i }).click();
    await page.getByPlaceholder(/Nota de cumplimiento/i).fill('Verificar certificado FONDONORMA');
    await page.getByRole('button', { name: /Confirmar revisión/i }).click();

    await expect(page.getByText(/Verificar certificado FONDONORMA/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Bitácora del proceso \(1\)/i })).toBeVisible();

    await page.getByRole('button', { name: /Aprobar y sellar/i }).click();
    await expect(page.getByRole('heading', { name: /Bitácora del proceso \(2\)/i })).toBeVisible();
  });
});
