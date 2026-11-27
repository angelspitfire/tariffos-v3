import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  A2UICanvasComponent,
  A2UIDossierComponent,
} from '@tariffos/shared-types';
import { getJurisdictionById } from '@/lib/workspace/jurisdictions';
import { DEFAULT_USER_PROFILE } from '@/lib/workspace/types';
import { DossierView } from '../organisms/DossierView';
import { WorkspaceCanvasPane } from '../organisms/WorkspaceCanvasPane';

const sampleProfile = {
  ...DEFAULT_USER_PROFILE,
  fullName: 'Ana Aduana',
  email: 'ana@agencia.ve',
  companyName: 'Agencia Aduanal VE',
  brokerLicense: 'SENIAT-1234',
};

const compressorDossier: A2UIDossierComponent = {
  type: 'dossier',
  id: 'dos-rtf-100',
  title: 'Dictamen · Compresor de Aire de Tornillo RTF-100',
  hsCode: '8414.80.12.00',
  officialDescription: 'Los demás — Compresores de aire — De tornillo',
  jurisdictionName: 'Venezuela (SENIAT — Decreto 4.944)',
  confidenceLevel: 'Alto',
  confidencePct: 90,
  confidenceReason: 'Compresor estacionario de tornillo rotativo 75 kW / 8 bar encaja en RGI 1 y RGI 6.',
  rgiSteps: [
    {
      rule: 'RGI 1',
      note: 'Sección XVI, Cap. 84',
      application: 'Partida 84.14 — Compresores de aire',
      conclusion: 'Partida 84.14',
    },
    {
      rule: 'RGI 6',
      note: 'Subpartida nacional 10 dígitos',
      application: '8414.80.1 (Aire) → 8414.80.12.00 (De tornillo)',
      conclusion: '8414.80.12.00',
    },
  ],
  legalNotes: ['Nota 1 Sección XVI', 'Nota 2 Capítulo 84'],
  technicalSpecs: [
    { key: 'Potencia', value: '75 kW (100 HP)' },
    { key: 'Presión', value: '0,8 MPa (8 bar)' },
  ],
  permits: [],
  flags: [
    {
      type: 'warn',
      title: 'Salvaguardias / AD',
      text: 'Verificar medidas antidumping o salvaguardias vigentes para origen extrazona.',
    },
    {
      type: 'info',
      title: 'OGA / Régimen Legal',
      text: 'Decreto 4.944 registra AEC 14BK, Unidad Física u.',
    },
  ],
  rejectedAlternatives: [
    {
      hsCode: '8414.30.99.00',
      reason: 'Compresor de aire de línea industrial, no circuito frigorífico.',
      rule: 'RGI 1 y RGI 6',
    },
  ],
  unresolved: [
    'Confirmar ausencia de chasis remolcable con ruedas en ficha técnica.',
    'Definir despacho separado vs. CAU / Subcapítulo III Cap. 98 para el set completo.',
  ],
  reviewStatus: 'in_review',
  verifiedAgainstOfficial: true,
};

describe('DossierView visual report & Canvas RGI routing', () => {
  it('renders the RGI SVG diagram, compliance flags, rejected alternatives, and unresolved checklist', async () => {
    const user = userEvent.setup();
    const onOpenRgi = vi.fn();

    render(
      <DossierView
        dossier={compressorDossier}
        profile={sampleProfile}
        workflowMode="agent_decides"
        onApprove={vi.fn()}
        onRequestReview={vi.fn()}
        onOpenRgi={onOpenRgi}
      />,
    );

    expect(screen.getByRole('img', { name: /Diagrama de decisión RGI/i })).toBeInTheDocument();
    expect(screen.getByText('Salvaguardias / AD')).toBeInTheDocument();
    expect(screen.getByText(/Verificar medidas antidumping/i)).toBeInTheDocument();
    expect(screen.getByText('8414.30.99.00')).toBeInTheDocument();
    expect(screen.getByText(/Confirmar ausencia de chasis remolcable/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Ver comparador completo/i }));
    expect(onOpenRgi).toHaveBeenCalledTimes(1);
  });

  it('uses an explicit select for sealing policy and shifts primary CTA to Descargar PDF once approved', async () => {
    const user = userEvent.setup();
    const onChangeWorkflowMode = vi.fn();

    const { rerender } = render(
      <DossierView
        dossier={compressorDossier}
        profile={sampleProfile}
        workflowMode="agent_decides"
        onApprove={vi.fn()}
        onRequestReview={vi.fn()}
        onChangeWorkflowMode={onChangeWorkflowMode}
      />,
    );

    const policySelect = screen.getByRole('combobox', { name: /Política de sellado/i });
    expect(policySelect).toHaveValue('agent_decides');
    await user.selectOptions(policySelect, 'always_review');
    expect(onChangeWorkflowMode).toHaveBeenCalledWith('always_review');

    const pdfBtnUnapproved = screen.getByRole('button', { name: /Descargar PDF/i });
    expect(pdfBtnUnapproved.className).not.toContain('bg-accent-brand');

    rerender(
      <DossierView
        dossier={{ ...compressorDossier, reviewStatus: 'approved' }}
        profile={sampleProfile}
        workflowMode="agent_decides"
        onApprove={vi.fn()}
        onRequestReview={vi.fn()}
        onChangeWorkflowMode={onChangeWorkflowMode}
      />,
    );

    const pdfBtnApproved = screen.getByRole('button', { name: /Descargar PDF/i });
    expect(pdfBtnApproved.className).toContain('bg-accent-brand');
  });

  it('renders full RGI step conclusions inside role="img" without 20-char mid-word truncation', () => {
    const longConclusion = 'Compresor estacionario de tornillo rotativo 75 kW clasificado por texto de partida';
    const dossierWithLongStep: A2UIDossierComponent = {
      ...compressorDossier,
      rgiSteps: [
        {
          rule: 'RGI 1 — Texto de partida',
          application: longConclusion,
          conclusion: longConclusion,
        },
      ],
    };

    render(
      <DossierView
        dossier={dossierWithLongStep}
        profile={sampleProfile}
        workflowMode="agent_decides"
        onApprove={vi.fn()}
        onRequestReview={vi.fn()}
      />,
    );

    const diagram = screen.getByRole('img', { name: /Diagrama de decisión RGI de 8414\.80\.12\.00/i });
    expect(diagram.textContent).toContain('RGI 1 — Texto de partida');
    expect(diagram.textContent).toContain(longConclusion);
  });

  it('activates the rgi_comparator tab in WorkspaceCanvasPane instead of falling back to dossier', () => {
    const components: A2UICanvasComponent[] = [compressorDossier];

    render(
      <WorkspaceCanvasPane
        components={components}
        activeTab="rgi_comparator"
        jurisdiction={getJurisdictionById('ve-seniat')}
        profile={sampleProfile}
        onSelectTab={vi.fn()}
        onApproveDossier={vi.fn()}
        onRequestDossierReview={vi.fn()}
        onSaveSku={vi.fn()}
        onSaveSignature={vi.fn()}
        onExportPdf={vi.fn()}
        onConfirmBatchItem={vi.fn()}
      />,
    );

    expect(screen.getByText(/Recorrido RGI \(1 → 6\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Alternativas Descartadas/i)).toBeInTheDocument();
  });

  it('mounts DutyCalculatorView on demand when activeTab is calculator even if only dossier was emitted, and displays submitted compliance notes', () => {
    const dossierWithNote: A2UIDossierComponent = {
      ...compressorDossier,
      reviewStatus: 'in_review',
      approvalMeta: {
        status: 'in_review',
        updatedAt: '2026-11-27T12:00:00.000Z',
        complianceNotes: 'Adjuntar factura comercial sellada y catálogo técnico.',
      },
    };

    const { rerender } = render(
      <WorkspaceCanvasPane
        components={[dossierWithNote]}
        activeTab="dossier"
        jurisdiction={getJurisdictionById('ve-seniat')}
        profile={sampleProfile}
        onSelectTab={vi.fn()}
        onApproveDossier={vi.fn()}
        onRequestDossierReview={vi.fn()}
        onSaveSku={vi.fn()}
        onSaveSignature={vi.fn()}
        onExportPdf={vi.fn()}
        onConfirmBatchItem={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Adjuntar factura comercial sellada y catálogo técnico\./i),
    ).toBeInTheDocument();

    rerender(
      <WorkspaceCanvasPane
        components={[dossierWithNote]}
        activeTab="calculator"
        jurisdiction={getJurisdictionById('ve-seniat')}
        profile={sampleProfile}
        onSelectTab={vi.fn()}
        onApproveDossier={vi.fn()}
        onRequestDossierReview={vi.fn()}
        onSaveSku={vi.fn()}
        onSaveSignature={vi.fn()}
        onExportPdf={vi.fn()}
        onConfirmBatchItem={vi.fn()}
      />,
    );

    expect(screen.getByRole('tab', { name: /Tributos CIF/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByLabelText(/Valor Factura/i)).toBeInTheDocument();
    expect(screen.getByTestId('kpi-cif-value')).toBeInTheDocument();
  });
});
