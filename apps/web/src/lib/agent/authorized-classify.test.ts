// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ClassificationLinePayload } from '@tariffos/shared-types';

const mocks = vi.hoisted(() => ({
  checkTenantQuota: vi.fn(),
  persistClassificationOutcome: vi.fn(),
  getActiveLlmRuntimeConfig: vi.fn(),
  createPrismaPipelinePorts: vi.fn(),
  classifyInvoiceBatch: vi.fn(),
  membershipFindFirst: vi.fn(),
}));

vi.mock('@tariffos/agent', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/agent')>();
  return {
    ...actual,
    classifyInvoiceBatch: mocks.classifyInvoiceBatch,
  };
});

vi.mock('@tariffos/database', () => ({
  prisma: {
    membership: { findFirst: mocks.membershipFindFirst },
  },
}));

vi.mock('@/lib/admin/llm-settings', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/admin/llm-settings')>();
  return {
    ...actual,
    getActiveLlmRuntimeConfig: mocks.getActiveLlmRuntimeConfig,
  };
});

vi.mock('@/lib/agent/cloud-session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/agent/cloud-session')>();
  return {
    ...actual,
    checkTenantQuota: mocks.checkTenantQuota,
    persistClassificationOutcome: mocks.persistClassificationOutcome,
  };
});

vi.mock('@/lib/agent/prisma-ports', () => ({
  createPrismaPipelinePorts: mocks.createPrismaPipelinePorts,
}));

import {
  AuthorizedClassificationError,
  runAuthorizedClassificationLine,
} from './authorized-classify';
import classifyItemTool from '../../../../../agent/tools/classify_item';

const SAMPLE_LINE: ClassificationLinePayload = {
  lineId: 'interactive-1',
  product: 'Inversor solar híbrido 5kW',
  hsCode: '8504.40.90.00',
  officialDescription: 'Convertidores estáticos',
  originCountry: 'CN',
  confidenceLevel: 'Alto',
  confidencePct: 92,
  confidenceReason: 'Match oficial',
  rgiSteps: [],
  alternatives: [],
  rejected: [],
  flags: [],
  unresolved: [],
  duties: { cif: 1000, adValoremRate: 14, arancelAmount: 140, ivaRate: 16, ivaAmount: 182.4, unit: 'u' },
  tierUsed: 'tier2_rgi',
  verifiedAgainstDb: true,
  modelUsed: 'google/gemini-2.5-flash',
};

describe('runAuthorizedClassificationLine & Eve classify_item cloud enforcement', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('rejects unsupported countries before quota or LLM execution', async () => {
    await expect(
      runAuthorizedClassificationLine({
        tenantId: 'tenant-1',
        countryCode: 'XX',
        item: {
          lineId: 'interactive-1',
          description: 'Laptop 14 pulgadas',
          originCountry: 'CN',
          cifValue: 1000,
        },
        queryForAudit: 'Laptop 14 pulgadas',
      }),
    ).rejects.toMatchObject({ status: 422 });
    expect(mocks.checkTenantQuota).not.toHaveBeenCalled();
  });

  it('rejects over-quota or past-due tenants with structured status and code', async () => {
    mocks.checkTenantQuota.mockResolvedValueOnce({ allowed: false, reason: 'LIMIT_REACHED' });

    await expect(
      runAuthorizedClassificationLine({
        tenantId: 'tenant-1',
        countryCode: 'VE',
        item: {
          lineId: 'interactive-1',
          description: 'Laptop 14 pulgadas',
          originCountry: 'CN',
          cifValue: 1000,
        },
        queryForAudit: 'Laptop 14 pulgadas',
      }),
    ).rejects.toBeInstanceOf(AuthorizedClassificationError);

    expect(mocks.classifyInvoiceBatch).not.toHaveBeenCalled();
  });

  it('passes active DB LLM override to createPrismaPipelinePorts and persists outcome', async () => {
    mocks.checkTenantQuota.mockResolvedValueOnce({ allowed: true });
    mocks.getActiveLlmRuntimeConfig.mockResolvedValueOnce({
      source: 'database',
      provider: 'google',
      model: 'gemini-2.5-flash',
      deepModel: 'gemini-2.5-pro',
      baseUrl: null,
      canRunLive: true,
      updatedAt: '2026-11-26T00:00:00Z',
    });
    const fakePorts = { verifyHsCode: vi.fn() };
    mocks.createPrismaPipelinePorts.mockReturnValueOnce(fakePorts);
    mocks.classifyInvoiceBatch.mockResolvedValueOnce({
      lines: [SAMPLE_LINE],
      stats: { totalLines: 1, uniqueItems: 1, blockedByPreGate: 0, tier0Hits: 0, tier1Hits: 0, tier2Hits: 1, webGroundingUsed: 0 },
    });
    mocks.persistClassificationOutcome.mockResolvedValueOnce(undefined);

    const out = await runAuthorizedClassificationLine({
      tenantId: 'tenant-1',
      countryCode: 'VE',
      deepMode: true,
      item: {
        lineId: 'interactive-1',
        description: 'Inversor solar híbrido 5kW',
        originCountry: 'CN',
        cifValue: 1000,
      },
      queryForAudit: 'Inversor solar híbrido 5kW',
    });

    expect(mocks.createPrismaPipelinePorts).toHaveBeenCalledWith({
      provider: 'google',
      model: 'gemini-2.5-flash',
      deepModel: 'gemini-2.5-pro',
      baseUrl: null,
    });
    expect(mocks.persistClassificationOutcome).toHaveBeenCalledWith(
      'tenant-1',
      SAMPLE_LINE,
      'Inversor solar híbrido 5kW',
      'google',
    );
    expect(out.line.hsCode).toBe('8504.40.90.00');
  });

  it('enforces quota and persists outcome when Eve classify_item runs in cloud mode', async () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUD_MODE', 'true');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    mocks.membershipFindFirst.mockResolvedValueOnce({ tenantId: 'tenant-eve-1' });
    mocks.checkTenantQuota.mockResolvedValueOnce({ allowed: false, reason: 'PAST_DUE' });

    const execute = (
      classifyItemTool as unknown as {
        execute: (input: Record<string, unknown>, ctx: Record<string, unknown>) => Promise<unknown>;
      }
    ).execute;

    await expect(
      execute(
        {
          countryCode: 'VE',
          lineId: 'interactive-1',
          description: 'Motor eléctrico trifásico 5HP',
          originCountry: 'CN',
          cifValue: 1000,
          incoterm: 'FOB',
          deepMode: false,
        },
        { session: { auth: { current: { principalId: 'user-1', authenticator: 'supabase' } } } },
      ),
    ).rejects.toThrow(/Piloto Operativo|Plan Agencia/i);

    expect(mocks.classifyInvoiceBatch).not.toHaveBeenCalled();
  });
});
