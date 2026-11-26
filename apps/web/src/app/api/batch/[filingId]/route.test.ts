// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ClassificationLinePayload } from '@tariffos/shared-types';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  filingFindFirst: vi.fn(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    filing: { findFirst: mocks.filingFindFirst },
  },
}));

import { GET } from './route';

const SAMPLE_LINE: ClassificationLinePayload = {
  lineId: 'line-1',
  product: 'Inversor solar híbrido 5kW',
  hsCode: '8504.40.90.00',
  officialDescription: 'Convertidores estáticos',
  originCountry: 'CN',
  confidenceLevel: 'Alto',
  confidencePct: 91,
  confidenceReason: 'Exact match',
  rgiSteps: [],
  alternatives: [],
  rejected: [],
  flags: [],
  unresolved: [],
  duties: { cif: 1500, adValoremRate: 14, arancelAmount: 210, ivaRate: 16, ivaAmount: 273.6, unit: 'u' },
  tierUsed: 'tier2_rgi',
  verifiedAgainstDb: true,
  modelUsed: 'test',
};

describe('GET /api/batch/[filingId]', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it('returns 404 when filing does not belong to authenticated tenant', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { tenantId: 'tenant-ve', userId: 'user-1', role: 'ADMIN' },
    });
    mocks.filingFindFirst.mockResolvedValue(null);

    const res = await GET(new Request('http://localhost/api/batch/fil-other'), {
      params: Promise.resolve({ filingId: 'fil-other' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns validated A2UIEnvelope and BatchSummary once Filing is Completed', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { tenantId: 'tenant-ve', userId: 'user-1', role: 'ADMIN' },
    });
    mocks.filingFindFirst.mockResolvedValue({
      id: 'fil-42',
      referenceId: 'factura.xlsx',
      status: 'Completed',
      lines: [{ lineNumber: 1, rawResult: SAMPLE_LINE }],
    });

    const res = await GET(new Request('http://localhost/api/batch/fil-42'), {
      params: Promise.resolve({ filingId: 'fil-42' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      filingId: string;
      status: string;
      totalLines: number;
      envelope: { canvasComponents: Array<{ type: string }> } | null;
      summary: { totalCifUsd: number } | null;
    };
    expect(body.status).toBe('Completed');
    expect(body.totalLines).toBe(1);
    expect(body.summary?.totalCifUsd).toBe(1500);
    expect(body.envelope?.canvasComponents[0]?.type).toBe('batch_manifest');
  });
});
