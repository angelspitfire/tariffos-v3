import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  A2UIBatchManifestComponent,
  A2UICalculatorComponent,
  A2UICanvasComponent,
  A2UIDossierComponent,
  CanvasTabType,
} from '@tariffos/shared-types';
import { getJurisdictionById } from '@/lib/workspace/jurisdictions';
import { buildDefaultMerceologicalSheet } from '@/lib/workspace/merceological-helpers';
import { DossierApprovalBar } from '../molecules/DossierApprovalBar';
import { OfficialScheduleAuditBar } from '../molecules/OfficialScheduleAuditBar';
import { ConsolidatedTabStrip } from '../molecules/ConsolidatedTabStrip';
import { DutyCalculatorView } from '../organisms/DutyCalculatorView';
import { BatchManifestTriageView } from '../organisms/BatchManifestTriageView';
import type { BatchItemConfirmation } from '../organisms/BatchItemInspector';

const sampleDossier: A2UIDossierComponent = {
  type: 'dossier',
  id: 'dos-1',
  title: 'Dictamen Técnico Arancelario',
  hsCode: '8504.40.90.00',
  officialDescription: 'Inversor solar híbrido 5 kW',
  jurisdictionName: 'Venezuela (SENIAT)',
  confidenceLevel: 'Medio',
  confidencePct: 72,
  rgiSteps: [{ rule: 'RGI 1', application: 'Partida 85.04' }],
  legalNotes: ['Nota 2 Sección XVI'],
  technicalSpecs: [{ key: 'Potencia', value: '5 kW' }],
  permits: [],
  reviewStatus: 'in_review',
  agentReviewTrigger: {
    invokedBySkill: 'Agente Clasificador (RGI)',
    reason: 'Confianza preliminar 72% por debajo del umbral.',
    missingFields: ['Certificado de conformidad'],
  },
  verifiedAgainstOfficial: true,
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

const sampleBatch: A2UIBatchManifestComponent = {
  type: 'batch_manifest',
  id: 'batch-1',
  title: 'Manifiesto Solar 3 ítems',
  documentReference: 'INV-2026-0918',
  currencyCode: 'USD',
  items: [
    {
      lineNumber: 1,
      skuOrRef: 'SG-INV5K',
      description: 'Inversor solar híbrido 5 kW',
      sourceDoc: 'INV-2026-0918',
      quantityText: '12 PCS',
      fobValue: 5040,
      currencyCode: 'USD',
      hsCode: '8504.40.90.00',
      adValoremPercent: 10,
      vatPercent: 16,
      legalRegime: 'Libre',
      status: 'classified',
      confidencePct: 94,
    },
    {
      lineNumber: 2,
      skuOrRef: 'SG-PV550',
      description: 'Panel solar fotovoltaico 550W',
      sourceDoc: 'INV-2026-0918',
      quantityText: '80 PCS',
      fobValue: 9600,
      currencyCode: 'USD',
      hsCode: '8541.43.00.00',
      adValoremPercent: 0,
      vatPercent: 16,
      legalRegime: 'Libre',
      status: 'needs_review',
      confidencePct: 74,
      merceologicalSheet: buildDefaultMerceologicalSheet('Panel solar 550W'),
      clarifyingQuestions: [
        {
          id: 'q-pv',
          question: '¿Tiene microinversor integrado?',
          fieldKey: 'especificaciones_tecnicas',
          inputType: 'select',
          options: ['Solo caja con diodos', 'Con microinversor AC'],
          critical: true,
        },
      ],
    },
    {
      lineNumber: 3,
      skuOrRef: 'SG-CAB6',
      description: 'Cable fotovoltaico 6mm2',
      sourceDoc: 'INV-2026-0918',
      quantityText: '40 ROLLS',
      fobValue: 2960,
      currencyCode: 'USD',
      hsCode: '8544.60.00.00',
      adValoremPercent: 14,
      vatPercent: 16,
      legalRegime: 'R6',
      status: 'needs_review',
      confidencePct: 70,
    },
  ],
};

describe('Canvas views and controls', () => {
  it('DossierApprovalBar renders AgentReviewTrigger banner and transitions approve/review states', async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn<() => void>();
    const onRequestReview = vi.fn<(note: string) => void>();

    render(
      <DossierApprovalBar
        dossier={sampleDossier}
        workflowMode="agent_decides"
        onApprove={onApprove}
        onRequestReview={onRequestReview}
      />
    );

    expect(screen.getByText(/Agente Clasificador \(RGI\)/)).toBeInTheDocument();
    expect(screen.getByText(/Confianza preliminar 72%/)).toBeInTheDocument();
    expect(screen.getByText(/Certificado de conformidad/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Aprobar y sellar/i }));
    expect(onApprove).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /Dejar en revisión/i }));
    const noteInput = screen.getByPlaceholderText(/Nota de cumplimiento/i);
    await user.type(noteInput, 'Validar ficha técnica original');
    await user.click(screen.getByRole('button', { name: /Confirmar revisión/i }));
    expect(onRequestReview).toHaveBeenCalledWith('Validar ficha técnica original');
  });

  it('OfficialScheduleAuditBar stays 1-line when verified and auto-expands on discrepancy', () => {
    const { rerender } = render(
      <OfficialScheduleAuditBar hsCode="8504.40.90.00" verified={true} jurisdictionName="Venezuela (SENIAT)" />
    );
    expect(screen.getByText(/Arancel oficial verificado/i)).toBeInTheDocument();
    expect(screen.queryByText(/Discrepancia detectada/i)).not.toBeInTheDocument();

    rerender(
      <OfficialScheduleAuditBar
        hsCode="8504.40.90.00"
        verified={false}
        jurisdictionName="Venezuela (SENIAT)"
        discrepancyDetail="Alícuota Ad Valorem difiere del Decreto 4.944."
      />
    );
    expect(screen.getByText(/Alícuota Ad Valorem difiere del Decreto 4\.944/i)).toBeInTheDocument();
  });

  it('ConsolidatedTabStrip renders dynamic tabs and subtle + Comparar / + Normativa shortcuts', async () => {
    const user = userEvent.setup();
    const onSelectTab = vi.fn<(tab: CanvasTabType) => void>();
    const minimalComponents: A2UICanvasComponent[] = [
      { ...sampleDossier, rgiSteps: [], rejectedAlternatives: [] },
      sampleCalculator,
    ];

    render(
      <ConsolidatedTabStrip
        components={minimalComponents}
        activeTab="dossier"
        unreadAlertsCount={0}
        onSelectTab={onSelectTab}
      />
    );

    expect(screen.getByRole('tab', { name: /Dictamen/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tributos CIF/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /\+ Comparar/i }));
    expect(onSelectTab).toHaveBeenCalledWith('rgi_comparator');

    await user.click(screen.getByRole('button', { name: /\+ Normativa/i }));
    expect(onSelectTab).toHaveBeenCalledWith('regulatory_diff');
  });

  it('ConsolidatedTabStrip exposes compact version timeline and fullscreen controls when provided', async () => {
    const user = userEvent.setup();
    const onOpenTimeline = vi.fn<() => void>();
    const onToggleFullscreen = vi.fn<() => void>();

    render(
      <ConsolidatedTabStrip
        components={[sampleDossier, sampleCalculator]}
        activeTab="dossier"
        unreadAlertsCount={0}
        versionsCount={2}
        isFullscreen={false}
        onSelectTab={vi.fn<() => void>()}
        onOpenTimeline={onOpenTimeline}
        onToggleFullscreen={onToggleFullscreen}
        onCloseCanvas={vi.fn<() => void>()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Historial y comparador de versiones/i }));
    expect(onOpenTimeline).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /Expandir Canvas/i }));
    expect(onToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('DutyCalculatorView displays 3 live KPIs, primary inputs, and keeps advanced fields inside accordion', async () => {
    const user = userEvent.setup();
    render(
      <DutyCalculatorView
        calculator={sampleCalculator}
        jurisdiction={getJurisdictionById('ve-seniat')}
      />
    );

    expect(screen.getByText('Base CIF')).toBeInTheDocument();
    expect(screen.getByText('Total Tributos')).toBeInTheDocument();
    expect(screen.getByText('Costo Nacionalizado')).toBeInTheDocument();

    // Advanced accordion collapsed by default
    expect(screen.queryByLabelText(/Tasa de cambio/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Ajustes avanzados/i }));
    expect(screen.getByLabelText(/Tasa de cambio/i)).toBeInTheDocument();

    // Updating invoice value to 20,000 + 850 freight + 150 insurance = 21,000 CIF
    const invoiceInput = screen.getByLabelText(/Valor Factura/i);
    await user.clear(invoiceInput);
    await user.type(invoiceInput, '20000');
    expect(screen.getByTestId('kpi-cif-value').textContent).toContain('21,000');
  });

  it('BatchManifestTriageView runs quick triage, collapses 7-attribute sheet when questions exist, and auto-advances on confirm', async () => {
    const user = userEvent.setup();
    const onConfirmItem = vi.fn<(lineNumber: number, update: BatchItemConfirmation) => void>();

    render(
      <BatchManifestTriageView
        manifest={sampleBatch}
        onConfirmItem={onConfirmItem}
      />
    );

    const startBtn = screen.getByRole('button', { name: /Iniciar Triage rápido \(2 pendientes\)/i });
    await user.click(startBtn);

    // Line 2 is focused; clarifying question visible, 7-attribute sheet collapsed by default
    expect(screen.getByText(/¿Tiene microinversor integrado\?/)).toBeInTheDocument();
    expect(screen.queryByText(/Naturaleza y materia constitutiva/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Confirmar ítem/i }));
    expect(onConfirmItem).toHaveBeenCalledWith(2, expect.objectContaining({ hsCode: '8541.43.00.00' }));

    // Auto-advanced to line 3
    expect(screen.getByTestId('batch-inspector-header').textContent).toContain('SG-CAB6');
  });
});
