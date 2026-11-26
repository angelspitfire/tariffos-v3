import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findMany: vi.fn(),
  isCloudModeEnabled: vi.fn(() => true),
}));

vi.mock('@/lib/admin/http-helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/admin/http-helpers')>();
  return { ...actual, requireAdmin: mocks.requireAdmin };
});

vi.mock('@tariffos/database', () => ({
  prisma: {
    decisionArtifact: {
      findMany: mocks.findMany,
    },
  },
}));

vi.mock('@/lib/runtime-config', () => ({
  isCloudModeEnabled: mocks.isCloudModeEnabled,
}));

import { GET } from './route';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({
    ok: true,
    context: { userId: 'adm-1', userEmail: 'ops@tariffos.app', role: 'ops_billing' },
  });
});

describe('GET /api/admin/ai-quality', () => {
  it('filters artifacts by model and maxConfidence and aggregates per-model stats', async () => {
    mocks.findMany.mockResolvedValueOnce([
      {
        id: 'art-1',
        classificationId: 'cls-1',
        tenantId: 'ten-1',
        filingId: null,
        lineId: 'l-1',
        retrievalTrace: { query: 'Motor 5HP', tierUsed: 'tier2_rgi_llm' },
        promptSnapshot: { query: 'Motor 5HP' },
        modelMetadata: { modelUsed: 'gemini-2.5-flash', provider: 'google', verifiedAgainstDb: true },
        rerankingScores: { confidencePct: 92, confidenceLevel: 'Alto' },
        sustento: { rgiSteps: [], flags: [] },
        finalDecision: { hsCode: '8501.52.10.00', officialDescription: 'Motores' },
        createdAt: new Date('2026-11-26T00:00:00Z'),
        tenant: { name: 'Agencia Alfa' },
      },
      {
        id: 'art-2',
        classificationId: 'cls-2',
        tenantId: 'ten-1',
        filingId: null,
        lineId: 'l-2',
        retrievalTrace: { query: 'Válvula', tierUsed: 'tier2_rgi_llm' },
        promptSnapshot: { query: 'Válvula' },
        modelMetadata: { modelUsed: 'gemini-2.5-flash', provider: 'google', verifiedAgainstDb: false },
        rerankingScores: { confidencePct: 68, confidenceLevel: 'Medio' },
        sustento: { rgiSteps: [], flags: [{ type: 'warn' }] },
        finalDecision: { hsCode: '8481.80.99.00', officialDescription: 'Válvulas' },
        createdAt: new Date('2026-11-26T01:00:00Z'),
        tenant: { name: 'Agencia Alfa' },
      },
    ]);

    const res = await GET(
      new Request('http://localhost/api/admin/ai-quality?model=gemini&maxConfidence=80'),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      artifacts: Array<{ id: string; flagCount: number }>;
      modelStats: Array<{ model: string; count: number; avgConfidencePct: number; verifiedRatePct: number }>;
    };

    expect(json.artifacts).toHaveLength(1);
    expect(json.artifacts[0]?.id).toBe('art-2');
    expect(json.artifacts[0]?.flagCount).toBe(1);
    expect(json.modelStats[0]).toEqual({
      model: 'gemini-2.5-flash',
      provider: 'google',
      count: 1,
      avgConfidencePct: 68,
      verifiedRatePct: 0,
    });
  });
});
