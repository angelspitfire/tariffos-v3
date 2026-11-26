import type {
  AdminAiQualityArtifactDetail,
  AdminAiQualityArtifactSummary,
  AdminAiQualityModelStat,
} from '@tariffos/shared-types';

export interface RawDecisionArtifactRow {
  id: string;
  classificationId: string;
  tenantId: string;
  filingId: string | null;
  lineId: string | null;
  retrievalTrace: unknown;
  promptSnapshot: unknown;
  modelMetadata: unknown;
  rerankingScores: unknown;
  sustento: unknown;
  finalDecision: unknown;
  createdAt: Date;
  tenant?: { name: string } | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function mapArtifactToSummary(row: RawDecisionArtifactRow): AdminAiQualityArtifactSummary {
  const retrieval = asRecord(row.retrievalTrace);
  const prompt = asRecord(row.promptSnapshot);
  const meta = asRecord(row.modelMetadata);
  const scores = asRecord(row.rerankingScores);
  const sustento = asRecord(row.sustento);
  const decision = asRecord(row.finalDecision);
  const flags = Array.isArray(sustento.flags) ? sustento.flags : [];

  return {
    id: row.id,
    classificationId: row.classificationId,
    tenantId: row.tenantId,
    tenantName: row.tenant?.name ?? row.tenantId,
    query: asString(prompt.query) || asString(retrieval.query) || 'Sin descripción',
    hsCode: asString(decision.hsCode, 'N/A'),
    officialDescription: asString(decision.officialDescription),
    modelUsed: asString(meta.modelUsed, 'unknown'),
    provider: asString(meta.provider, 'env'),
    tierUsed: asString(retrieval.tierUsed, 'unknown'),
    confidencePct: Math.round(asNumber(scores.confidencePct, 0)),
    confidenceLevel: asString(scores.confidenceLevel, 'Medio'),
    verifiedAgainstDb: Boolean(meta.verifiedAgainstDb),
    flagCount: flags.length,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapArtifactToDetail(row: RawDecisionArtifactRow): AdminAiQualityArtifactDetail {
  return {
    ...mapArtifactToSummary(row),
    filingId: row.filingId,
    lineId: row.lineId,
    retrievalTrace: asRecord(row.retrievalTrace),
    promptSnapshot: asRecord(row.promptSnapshot),
    modelMetadata: asRecord(row.modelMetadata),
    rerankingScores: asRecord(row.rerankingScores),
    sustento: row.sustento ? asRecord(row.sustento) : null,
    finalDecision: asRecord(row.finalDecision),
  };
}

export function aggregateModelStats(
  items: AdminAiQualityArtifactSummary[],
): AdminAiQualityModelStat[] {
  const buckets = new Map<
    string,
    { model: string; provider: string; count: number; confSum: number; verified: number }
  >();

  for (const item of items) {
    const key = `${item.provider}::${item.modelUsed}`;
    const existing = buckets.get(key) ?? {
      model: item.modelUsed,
      provider: item.provider,
      count: 0,
      confSum: 0,
      verified: 0,
    };
    existing.count += 1;
    existing.confSum += item.confidencePct;
    if (item.verifiedAgainstDb) existing.verified += 1;
    buckets.set(key, existing);
  }

  return Array.from(buckets.values())
    .map((b) => ({
      model: b.model,
      provider: b.provider,
      count: b.count,
      avgConfidencePct: b.count > 0 ? Math.round(b.confSum / b.count) : 0,
      verifiedRatePct: b.count > 0 ? Math.round((b.verified / b.count) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function createOfflineDecisionArtifacts(): AdminAiQualityArtifactDetail[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'art-offline-1',
      classificationId: 'cls_offline_1',
      tenantId: 'ten-demo-1',
      tenantName: 'Aduanas Bolívar C.A.',
      filingId: null,
      lineId: 'interactive-1',
      query: 'Motor eléctrico trifásico industrial 5 HP 220V 60Hz',
      hsCode: '8501.52.10.00',
      officialDescription: 'Motores de corriente alterna, polifásicos, de potencia superior a 750 W pero inferior o igual a 75 kW',
      modelUsed: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
      provider: 'nvidia',
      tierUsed: 'tier2_rgi_llm',
      confidencePct: 94,
      confidenceLevel: 'Alto',
      verifiedAgainstDb: true,
      flagCount: 0,
      createdAt: now,
      retrievalTrace: { query: 'Motor eléctrico trifásico 5 HP', tierUsed: 'tier2_rgi_llm' },
      promptSnapshot: { query: 'Motor eléctrico trifásico industrial 5 HP 220V 60Hz' },
      modelMetadata: {
        modelUsed: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
        provider: 'nvidia',
        verifiedAgainstDb: true,
      },
      rerankingScores: { confidencePct: 94, confidenceLevel: 'Alto' },
      sustento: {
        rgiSteps: [
          {
            rule: 'RGI 1',
            note: 'Capítulo 85, Partida 85.01',
            items: ['Motor eléctrico trifásico 5 HP (~3.73 kW)'],
            conclusion: 'Partida 8501',
          },
        ],
        flags: [],
      },
      finalDecision: { hsCode: '8501.52.10.00', duties: { cif: 1200, totalTax: 312 } },
    },
  ];
}
