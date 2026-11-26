import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { A2UIEnvelopeSchema } from '@tariffos/shared-types';
import { resolveInitialDossierReview } from '@tariffos/agent';
import { POST as classifyStreamPost } from '@/app/api/classify-stream/route';
import { POST as batchPost } from '@/app/api/batch/route';
import {
  consumePendingQuery,
  savePendingQuery,
} from '@/lib/funnel/funnel-storage';
import { createWorkspacePersistence } from '@/lib/workspace/persistence';
import { getJurisdictionById } from '@/lib/workspace/jurisdictions';
import { buildOfflineBatchEnvelope } from '@/lib/workspace/offline-batch-samples';
import { DossierApprovalBar } from '@/components/workspace/molecules/DossierApprovalBar';
import { BatchManifestTriageView } from '@/components/workspace/organisms/BatchManifestTriageView';

function extractResultEnvelope(sseBody: string) {
  const blocks = sseBody.split('\n\n').filter((b) => b.includes('event: result'));
  const dataLine = blocks[0]?.split('\n').find((l) => l.startsWith('data: '));
  return A2UIEnvelopeSchema.parse(JSON.parse(dataLine?.slice(6) ?? '{}'));
}

describe('Phase D.3 End-to-End Smoke Gate', () => {
  it('1) Hero query handoff -> POST /api/classify-stream emits SSE progress and Dictamen A2UIEnvelope', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    savePendingQuery('Inversor solar híbrido 5 kW 48V MPPT');
    const handoff = consumePendingQuery();
    expect(handoff).toBe('Inversor solar híbrido 5 kW 48V MPPT');

    const res = await classifyStreamPost(
      new Request('http://localhost/api/classify-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: handoff, countryCode: 'VE', cifValue: 5000 }),
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain('pre_gate');
    expect(body).toContain('rgi_reasoning');
    expect(body).toContain('verifying_tariff');

    const envelope = extractResultEnvelope(body);
    const verdict = envelope.inlineComponents.find((c) => c.type === 'verdict');
    const dossier = envelope.canvasComponents.find((c) => c.type === 'dossier');
    expect(verdict?.type === 'verdict' && verdict.preferredCanvasTab).toBe('dossier');
    expect(dossier?.type === 'dossier' && dossier.hsCode.length).toBeGreaterThanOrEqual(8);
  });

  it('2) Ambiguous query triggers HITL merceological sheet & AgentReviewTrigger on incomplete dossier', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const res = await classifyStreamPost(
      new Request('http://localhost/api/classify-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'motor eléctrico', countryCode: 'VE' }),
      }),
    );

    expect(res.status).toBe(200);
    const envelope = extractResultEnvelope(await res.text());
    expect(envelope.workflowState).toBe('needs_input');
    expect(envelope.inlineComponents.some((c) => c.type === 'merceological_sheet')).toBe(true);

    const reviewed = resolveInitialDossierReview(
      {
        type: 'dossier',
        id: 'dos-hitl',
        title: 'Motor eléctrico',
        hsCode: '8501.52.10.00',
        officialDescription: 'Motores de corriente alterna polifásicos',
        jurisdictionName: 'Venezuela (SENIAT)',
        confidencePct: 68,
        rgiSteps: [],
        legalNotes: [],
        technicalSpecs: [],
        permits: [],
        unresolved: ['Potencia nominal (kW)'],
      },
      'agent_decides',
    );
    expect(reviewed.reviewStatus).toBe('in_review');
    expect(reviewed.agentReviewTrigger?.missingFields).toContain('Potencia nominal (kW)');
  });

  it('3) Dossier 1-click approval & Tier 0 SKU precedent dual-write persistence', async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn<() => void>();
    const onRequestReview = vi.fn<(note: string) => void>();

    render(
      <DossierApprovalBar
        dossier={{
          type: 'dossier',
          id: 'dos-seal',
          title: 'Inversor solar híbrido 5 kW',
          hsCode: '8504.40.90.00',
          officialDescription: 'Convertidores estáticos',
          jurisdictionName: 'Venezuela (SENIAT)',
          confidencePct: 94,
          rgiSteps: [],
          legalNotes: [],
          technicalSpecs: [],
          permits: [],
          reviewStatus: 'draft_ai',
        }}
        workflowMode="agent_decides"
        onApprove={onApprove}
        onRequestReview={onRequestReview}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Aprobar y sellar/i }));
    expect(onApprove).toHaveBeenCalledTimes(1);

    const persistence = createWorkspacePersistence();
    const now = new Date().toISOString();
    await persistence.saveSkuPrecedent({
      id: 'sku-smoke-1',
      sku: 'SG-INV5K',
      normalizedSku: 'SG-INV5K',
      title: 'Inversor solar híbrido 5 kW',
      description: 'Inversor solar híbrido 5 kW 48V',
      hsCode: '8504.40.90.00',
      jurisdictionId: 've-seniat',
      adValoremPercent: 10,
      vatPercent: 16,
      legalRegime: 'Libre',
      reviewStatus: 'approved',
      usageCount: 1,
      createdAt: now,
      updatedAt: now,
    });
    const loaded = await persistence.loadSkuPrecedents();
    expect(loaded.some((p) => p.sku === 'SG-INV5K')).toBe(true);
  });

  it('4) Multi-item batch via POST /api/batch and BatchManifestTriageView quick triage auto-advance', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const batchRes = await batchPost(
      new Request('http://localhost/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filingId: 'fil-smoke-1',
          countryCode: 'VE',
          sourceText: 'LINE 1 | Inversor solar 5kW | 5000\nLINE 2 | Panel solar 550W | 9600',
        }),
      }),
    );
    expect(batchRes.status).toBe(200);
    const batchJson = (await batchRes.json()) as { totalItems: number };
    expect(batchJson.totalItems).toBe(2);

    const user = userEvent.setup();
    const jur = getJurisdictionById('ve-seniat');
    const batchEnvelope = buildOfflineBatchEnvelope('Lote solar', jur);
    const manifest = batchEnvelope.canvasComponents.find((c) => c.type === 'batch_manifest');
    expect(manifest?.type).toBe('batch_manifest');
    if (manifest?.type !== 'batch_manifest') return;

    render(<BatchManifestTriageView manifest={manifest} />);
    const pendingBefore = manifest.items.filter((i) => i.status === 'needs_review').length;
    if (pendingBefore > 0) {
      await user.click(screen.getByRole('button', { name: /Iniciar Triage rápido/i }));
      await user.click(screen.getByRole('button', { name: /Confirmar ítem/i }));
      expect(screen.getByTestId('batch-inspector-header')).toBeInTheDocument();
    }
  });
});
