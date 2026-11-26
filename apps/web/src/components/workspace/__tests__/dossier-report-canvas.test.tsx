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
});
