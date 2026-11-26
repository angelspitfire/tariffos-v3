import { describe, expect, it, vi } from 'vitest';
import type {
  A2UICalculatorComponent,
  A2UIDossierComponent,
  UserProfileSettings,
} from '@tariffos/shared-types';
import {
  buildDossierPdfBlob,
  buildDossierPdfBytes,
  buildDossierPdfFilename,
  downloadDossierPdf,
} from './dossier-pdf';

const sampleDossier: A2UIDossierComponent = {
  type: 'dossier',
  id: 'dos-1',
  title: 'Dictamen Técnico Arancelario',
  hsCode: '8504.40.90.00',
  officialDescription: 'Inversor solar híbrido de 5 kW con controlador MPPT — línea industrial',
  jurisdictionName: 'Venezuela (SENIAT)',
  confidenceLevel: 'Alto',
  confidencePct: 94,
  confidenceReason: 'Coincidencia directa con Nota Explicativa de la partida 85.04.',
  rgiSteps: [
    { rule: 'RGI 1', application: 'Clasificación determinada por el texto de la partida 85.04.' },
    { rule: 'RGI 6', application: 'Subpartida 8504.40 para convertidores estáticos.' },
  ],
  legalNotes: ['Nota 2 de la Sección XVI sobre máquinas y aparatos eléctricos.'],
  technicalSpecs: [
    { key: 'Potencia nominal', value: '5 kW' },
    { key: 'Tensión de entrada', value: '48 V DC' },
  ],
  permits: [{ code: 'REG-01', name: 'Registro de conformidad eléctrica', organism: 'SENCAMER' }],
  reviewStatus: 'approved',
  verifiedAgainstOfficial: true,
};

const sampleProfile: UserProfileSettings = {
  fullName: 'María José Pérez',
  email: 'maria@aduanas.ve',
  role: 'Agente Aduanal',
  companyName: 'Aduanas del Caribe C.A.',
  brokerLicense: 'SENIAT-AG-1420',
  defaultJurisdictionId: 've-seniat',
  defaultIncoterm: 'CIF',
  preferredCurrency: 'USD',
  approvalWorkflowMode: 'agent_decides',
  detailLevel: 'standard',
  themePreference: 'light',
  autoOpenCanvas: true,
  updatedAt: '2026-11-26T12:00:00.000Z',
};

const sampleCalculator: A2UICalculatorComponent = {
  type: 'calculator',
  id: 'calc-1',
  title: 'Liquidación CIF',
  hsCode: '8504.40.90.00',
  adValoremPercent: 10,
  vatPercent: 16,
  customsServiceFeePercent: 1,
  currencyCode: 'USD',
  localCurrencyCode: 'VES',
  suggestedExchangeRate: 46.5,
  exemptionAvailable: false,
  originCountry: 'China',
  incoterm: 'FOB',
};

function decodeLatin1(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[i] ?? 0);
  }
  return out;
}

describe('dossier-pdf', () => {
  it('generates a valid PDF 1.4 binary with dossier content and xref table', () => {
    const bytes = buildDossierPdfBytes(sampleDossier, sampleProfile, sampleCalculator);
    const text = decodeLatin1(bytes);

    expect(text.startsWith('%PDF-1.4\n')).toBe(true);
    expect(text.endsWith('%%EOF\n')).toBe(true);
    expect(text).toContain('/Type /Catalog');
    expect(text).toContain('/WinAnsiEncoding');
    expect(text).toContain('8504.40.90.00');
    expect(text).toContain('Venezuela \\(SENIAT\\)');
    expect(text).toContain('RGI 1');
    expect(text).toContain('SENCAMER');
    expect(text).toContain('SENIAT-AG-1420');
    expect(text).toContain('Ad Valorem: 10%');
    expect(text).toContain('startxref');
  });

  it('paginates across multiple pages when legal notes exceed one page', () => {
    const longDossier: A2UIDossierComponent = {
      ...sampleDossier,
      legalNotes: Array.from(
        { length: 45 },
        (_, idx) => `Nota legal número ${idx + 1}: disposición arancelaria extensa para validación de salto de página automático.`,
      ),
    };
    const bytes = buildDossierPdfBytes(longDossier, sampleProfile);
    const text = decodeLatin1(bytes);

    expect(text).toContain('/Count 2');
    expect(text).toContain('Pagina 2 de 2');
  });

  it('builds a clean PDF filename from the HS code', () => {
    expect(buildDossierPdfFilename(sampleDossier)).toBe('Dictamen-TariffOS-8504-40-90-00.pdf');
  });

  it('creates an application/pdf Blob and triggers browser file download without window.print', () => {
    const blob = buildDossierPdfBlob(sampleDossier, sampleProfile);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(500);

    const createObjectURL = vi.fn<() => string>(() => 'blob:tariffos/test-pdf');
    const revokeObjectURL = vi.fn<(url: string) => void>();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });

    const clickSpy = vi.fn<() => void>();
    const origCreateElement = document.createElement.bind(document);
    const createElSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === 'a') {
        el.click = clickSpy;
      }
      return el;
    });

    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    const filename = downloadDossierPdf(sampleDossier, sampleProfile, sampleCalculator);

    expect(filename).toBe('Dictamen-TariffOS-8504-40-90-00.pdf');
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:tariffos/test-pdf');
    expect(printSpy).not.toHaveBeenCalled();

    createElSpy.mockRestore();
    printSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});
