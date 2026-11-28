import type { Page } from '@playwright/test';
import type { A2UIEnvelope } from '@tariffos/shared-types';
import { buildEveNdjsonBody, extractPromptText } from './eve-mock-stream';

export function buildZeroCifEnvelope(): A2UIEnvelope {
  return {
    assistantMessage: 'Clasificado en 8504.40.90.00 (Convertidores estáticos — Inversor solar).',
    classificationStatus: 'classified',
    workflowState: 'classified',
    inlineComponents: [
      {
        type: 'verdict',
        id: 'verdict-e2e-1',
        hsCode: '8504.40.90.00',
        description: 'Inversor solar híbrido 5 kW 48V MPPT',
        adValoremPercent: 10,
        vatPercent: 16,
        customsFeePercent: 1,
        legalRegimeCode: 'Libre',
        legalRegimeSummary: 'Sin restricciones',
        confidenceLabel: 'Alto',
        rgiApplied: ['RGI 1', 'RGI 6'],
        preferredCanvasTab: 'dossier',
      },
    ],
    canvasComponents: [
      {
        type: 'dossier',
        id: 'dossier-e2e-1',
        title: 'Dictamen Técnico',
        hsCode: '8504.40.90.00',
        officialDescription: 'Los demás convertidores estáticos',
        jurisdictionName: 'Venezuela (SENIAT — Decreto 4.944)',
        confidencePct: 94,
        confidenceLevel: 'Alto',
        rgiSteps: [
          {
            rule: 'RGI 1',
            application: 'Partida 85.04 comprende transformadores y convertidores estáticos.',
            conclusion: 'Encuadra en 85.04',
          },
        ],
        legalNotes: ['Nota 2 Sección XVI'],
        technicalSpecs: [
          { key: 'Potencia', value: '5 kW' },
          { key: 'Tensión DC', value: '48 V' },
        ],
        permits: [],
        reviewStatus: 'draft_ai',
      },
      {
        type: 'calculator',
        id: 'calc-e2e-1',
        title: 'Liquidación CIF · 8504.40.90.00',
        hsCode: '8504.40.90.00',
        adValoremPercent: 10,
        vatPercent: 16,
        customsServiceFeePercent: 1,
        currencyCode: 'USD',
        localCurrencyCode: 'VES',
        suggestedExchangeRate: 926.35,
        exemptionAvailable: false,
      },
    ],
  };
}

export function buildBatchManifestEnvelope(): A2UIEnvelope {
  return {
    assistantMessage: 'Lote procesado: 5 ítems (2 requieren triage).',
    classificationStatus: 'classified',
    inlineComponents: [],
    canvasComponents: [
      {
        type: 'batch_manifest',
        id: 'batch-e2e-1',
        title: 'Manifiesto E2E Importación',
        currencyCode: 'USD',
        items: [
          {
            lineNumber: 1,
            skuOrRef: 'SKU-01',
            description: 'Motor trifásico industrial 7.5 kW',
            sourceDoc: 'factura-e2e.csv',
            quantityText: '2 uds',
            fobValue: 2400,
            currencyCode: 'USD',
            hsCode: '8501.52.10.00',
            adValoremPercent: 14,
            vatPercent: 16,
            legalRegime: 'Libre',
            status: 'needs_review',
            clarifyingQuestions: [
              {
                id: 'q1',
                question: '¿Potencia nominal confirmada?',
                fieldKey: 'power_kw',
                inputType: 'select',
                options: ['7.5 kW', '15 kW'],
              },
            ],
          },
          {
            lineNumber: 2,
            skuOrRef: 'SKU-02',
            description: 'Bomba centrífuga horizontal 3 HP',
            sourceDoc: 'factura-e2e.csv',
            quantityText: '4 uds',
            fobValue: 1800,
            currencyCode: 'USD',
            hsCode: '8413.70.90.00',
            adValoremPercent: 12,
            vatPercent: 16,
            legalRegime: 'Libre',
            status: 'needs_review',
          },
          {
            lineNumber: 3,
            skuOrRef: 'SKU-03',
            description: 'Inversor solar híbrido 5 kW',
            sourceDoc: 'factura-e2e.csv',
            quantityText: '3 uds',
            fobValue: 3600,
            currencyCode: 'USD',
            hsCode: '8504.40.90.00',
            adValoremPercent: 10,
            vatPercent: 16,
            legalRegime: 'Libre',
            status: 'classified',
          },
          {
            lineNumber: 4,
            skuOrRef: 'SKU-04',
            description: 'Panel solar monocristalino 550W',
            sourceDoc: 'factura-e2e.csv',
            quantityText: '12 uds',
            fobValue: 4200,
            currencyCode: 'USD',
            hsCode: '8541.43.00.00',
            adValoremPercent: 0,
            vatPercent: 16,
            legalRegime: 'Libre',
            status: 'classified',
          },
          {
            lineNumber: 5,
            skuOrRef: 'SKU-05',
            description: 'Cable fotovoltaico 6 mm2',
            sourceDoc: 'factura-e2e.csv',
            quantityText: '100 m',
            fobValue: 500,
            currencyCode: 'USD',
            hsCode: '8544.49.00.00',
            adValoremPercent: 14,
            vatPercent: 16,
            legalRegime: 'Libre',
            status: 'classified',
          },
        ],
      },
    ],
  };
}

export async function mockExchangeRatesRoute(page: Page): Promise<void> {
  await page.route('**/api/exchange-rates/latest**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        rates: {
          'USD/VES': { pair: 'USD/VES', rate: 926.35, valueDate: '2026-11-28', source: 'BCV-Mock' },
          'EUR/VES': { pair: 'EUR/VES', rate: 980.12, valueDate: '2026-11-28', source: 'BCV-Mock' },
        },
        fetchedAt: '2026-11-28T00:00:00.000Z',
        cached: true,
        stale: false,
        refreshed: false,
      }),
    });
  });
}

export async function mockClassifyStreamRoute(
  page: Page,
  envelope: A2UIEnvelope = buildZeroCifEnvelope(),
): Promise<void> {
  let lastPrompt = 'Clasificación arancelaria';

  await page.route('**/eve/v1/session', async (route) => {
    lastPrompt = extractPromptText(route.request().postDataJSON());
    await route.fulfill({
      status: 202,
      contentType: 'application/json',
      headers: { 'x-eve-session-id': 'eve-e2e-1' },
      body: JSON.stringify({ sessionId: 'eve-e2e-1', deliveryId: 'del-e2e-1' }),
    });
  });

  await page.route('**/eve/v1/session/*/stream**', async (route) => {
    const reqUrl = new URL(route.request().url());
    const startIndex = Number(reqUrl.searchParams.get('startIndex') ?? '0');
    await route.fulfill({
      status: 200,
      headers: {
        'content-type': 'application/x-ndjson; charset=utf-8',
        'x-eve-stream-version': '27',
        'x-eve-stream-format': 'ndjson',
        'x-eve-stream-tail-index': '0',
      },
      body: buildEveNdjsonBody(lastPrompt, envelope, startIndex),
    });
  });

  await page.route('**/api/classify-stream**', async (route) => {
    const sse =
      `event: progress\ndata: ${JSON.stringify({ stage: 'pre_gate', label: 'Pre-Gate' })}\n\n` +
      `event: progress\ndata: ${JSON.stringify({ stage: 'rgi_reasoning', label: 'RGI 1-6' })}\n\n` +
      `event: result\ndata: ${JSON.stringify(envelope)}\n\n`;
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream; charset=utf-8',
      body: sse,
    });
  });
}

export async function mockBatchUploadRoute(
  page: Page,
  envelope: A2UIEnvelope = buildBatchManifestEnvelope(),
): Promise<void> {
  await page.route('**/api/batch', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        filingId: 'batch-e2e-1',
        queued: false,
        totalItems: 5,
        fileName: 'factura-e2e.csv',
        envelope,
      }),
    });
  });
}
