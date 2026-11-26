import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  A2UIEnvelopeSchema,
  StreamProgressEventSchema,
  type A2UIEnvelope,
  type StreamProgressEvent,
} from '@tariffos/shared-types';

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  checkBillingLimit: vi.fn(),
  incrementUsage: vi.fn(),
  membershipFindFirst: vi.fn(),
  decisionArtifactCreate: vi.fn(),
  classifyInvoiceBatch: vi.fn(),
}));

vi.mock('@tariffos/agent', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/agent')>();
  return {
    ...actual,
    classifyInvoiceBatch: mocks.classifyInvoiceBatch,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
}));

vi.mock('@tariffos/database', () => ({
  billingService: {
    checkBillingLimit: mocks.checkBillingLimit,
    incrementUsage: mocks.incrementUsage,
  },
  prisma: {
    membership: { findFirst: mocks.membershipFindFirst },
    decisionArtifact: { create: mocks.decisionArtifactCreate },
    productMaster: { findFirst: vi.fn().mockResolvedValue(null) },
    nationalTariff: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    legalKnowledgeChunk: { findMany: vi.fn().mockResolvedValue([]) },
    hsPermitRequirement: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

import { POST } from './route';

function parseSseFrames(raw: string): Array<{ event: string; data: unknown }> {
  return raw
    .split('\n\n')
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      let event = 'message';
      let dataLine = '';
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        if (line.startsWith('data:')) dataLine += line.slice(5).trim();
      }
      return { event, data: dataLine ? JSON.parse(dataLine) : null };
    });
}

describe('POST /api/classify-stream', () => {
  const originalCloudMode = process.env.NEXT_PUBLIC_CLOUD_MODE;
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    if (originalCloudMode === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloudMode;
    if (originalSupabaseUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    if (originalSupabaseKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseKey;
  });

  it('returns 400 for invalid input payloads', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const req = new Request('http://localhost/api/classify-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('streams progress stages and a Zod-valid A2UIEnvelope opening in dossier for a well-specified item', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const req = new Request('http://localhost/api/classify-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Motor eléctrico trifásico industrial 5 HP 220V 60Hz',
        countryCode: 'VE',
        jurisdictionId: 've-seniat',
        approvalWorkflowMode: 'always_review',
        cifValue: 1200,
        originCountry: 'CN',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');

    const body = await res.text();
    const frames = parseSseFrames(body);
    const progressFrames = frames.filter((f) => f.event === 'progress');
    const resultFrames = frames.filter((f) => f.event === 'result');

    const stages = progressFrames.map(
      (f) => StreamProgressEventSchema.parse(f.data) as StreamProgressEvent,
    );
    expect(stages.map((s) => s.stage)).toEqual([
      'pre_gate',
      'sku_lookup',
      'hybrid_retrieval',
      'rgi_reasoning',
      'verifying_tariff',
      'complete',
    ]);

    expect(resultFrames).toHaveLength(1);
    const envelope: A2UIEnvelope = A2UIEnvelopeSchema.parse(resultFrames[0].data);
    expect(envelope.classificationStatus).toBe('classified');

    const verdict = envelope.inlineComponents.find((c) => c.type === 'verdict');
    const dossier = envelope.canvasComponents.find((c) => c.type === 'dossier');
    expect(verdict).toBeDefined();
    expect(verdict?.type === 'verdict' && verdict.preferredCanvasTab).toBe('dossier');
    expect(dossier).toBeDefined();
    expect(dossier?.type === 'dossier' && dossier.reviewStatus).toBe('in_review');
  });

  it('pauses with HITL merceological_sheet and questionnaire when critical specs are missing', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
    const req = new Request('http://localhost/api/classify-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Motor eléctrico industrial',
        countryCode: 'VE',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const frames = parseSseFrames(await res.text());
    const resultFrame = frames.find((f) => f.event === 'result');
    expect(resultFrame).toBeDefined();

    const envelope = A2UIEnvelopeSchema.parse(resultFrame?.data);
    expect(envelope.classificationStatus).toBe('needs_details');
    expect(envelope.workflowState).toBe('needs_input');
    expect(envelope.inlineComponents.some((c) => c.type === 'merceological_sheet')).toBe(true);
    expect(envelope.inlineComponents.some((c) => c.type === 'questionnaire')).toBe(true);
  });

  it('enforces tenant quota in cloud mode and returns 402 on LIMIT_REACHED', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'broker@example.com' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'tenant-1', role: 'OWNER' });
    mocks.checkBillingLimit.mockResolvedValue({ allowed: false, reason: 'LIMIT_REACHED' });

    const req = new Request('http://localhost/api/classify-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Inversor solar híbrido 5kW 48V MPPT',
        countryCode: 'VE',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(402);
    const json = (await res.json()) as { reason?: string };
    expect(json.reason).toBe('LIMIT_REACHED');
    expect(mocks.checkBillingLimit).toHaveBeenCalledWith('tenant-1');
  });

  it('persists DecisionArtifact and increments usage on cloud-mode classification', async () => {
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'true';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'broker@example.com' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'tenant-1', role: 'OWNER' });
    mocks.checkBillingLimit.mockResolvedValue({ allowed: true });
    mocks.decisionArtifactCreate.mockResolvedValue({ id: 'art-1' });
    mocks.incrementUsage.mockResolvedValue(undefined);

    const req = new Request('http://localhost/api/classify-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Inversor solar híbrido 5kW 48V MPPT',
        countryCode: 'VE',
        approvalWorkflowMode: 'direct_seal',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const frames = parseSseFrames(await res.text());
    const resultFrame = frames.find((f) => f.event === 'result');
    const envelope = A2UIEnvelopeSchema.parse(resultFrame?.data);
    const dossier = envelope.canvasComponents.find((c) => c.type === 'dossier');
    expect(dossier?.type === 'dossier' && dossier.reviewStatus).toBe('draft_ai');
    expect(mocks.decisionArtifactCreate).toHaveBeenCalledTimes(1);
    expect(mocks.incrementUsage).toHaveBeenCalledWith('tenant-1', 'classification', 1);
  });

  it('rejects non-VE jurisdictions in cloud mode with 422', async () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUD_MODE', 'true');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');

    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'broker@example.com' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'tenant-1', role: 'OWNER' });
    mocks.checkBillingLimit.mockResolvedValue({ allowed: true });

    const req = new Request('http://localhost/api/classify-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Laptop 14 inch',
        jurisdictionId: 'us-htsus',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
    const json = (await res.json()) as { countryCode?: string; supportedCountries?: string[] };
    expect(json.countryCode).toBe('US');
    expect(json.supportedCountries).toEqual(['VE']);
  });

  it('runs the live pipeline with NVIDIA_API_KEY and emits SSE error instead of mock fallback on failure', async () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUD_MODE', 'true');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@host:6543/postgres');
    vi.stubEnv('LLM_PROVIDER', 'nvidia');
    vi.stubEnv('NVIDIA_API_KEY', 'nvapi-live');

    mocks.getAuthenticatedUser.mockResolvedValue({ id: 'user-1', email: 'broker@example.com' });
    mocks.membershipFindFirst.mockResolvedValue({ tenantId: 'tenant-1', role: 'OWNER' });
    mocks.checkBillingLimit.mockResolvedValue({ allowed: true });
    mocks.classifyInvoiceBatch.mockRejectedValueOnce(new Error('NVIDIA rate limit'));

    const req = new Request('http://localhost/api/classify-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Apple Watch Series 9',
        jurisdictionId: 've-seniat',
        attachmentsText: 'GPS + Cellular, caja aluminio 45mm',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const frames = parseSseFrames(await res.text());
    expect(mocks.classifyInvoiceBatch).toHaveBeenCalledTimes(1);
    const passedItem = mocks.classifyInvoiceBatch.mock.calls[0]?.[0]?.[0] as { description: string };
    expect(passedItem.description).toContain('GPS + Cellular');
    expect(frames.some((f) => f.event === 'error')).toBe(true);
    expect(frames.some((f) => f.event === 'result')).toBe(false);
  });
});
