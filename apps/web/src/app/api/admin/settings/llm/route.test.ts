import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getAdminLlmSettingsPayload: vi.fn(),
  saveLlmRuntimeConfig: vi.fn(),
  resetLlmRuntimeConfig: vi.fn(),
  testLlmRuntimeConfig: vi.fn(),
  recordAdminAudit: vi.fn(),
  isCloudModeEnabled: vi.fn(() => true),
}));

vi.mock('@/lib/admin/http-helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/admin/http-helpers')>();
  return { ...actual, requireAdmin: mocks.requireAdmin };
});

vi.mock('@/lib/admin/llm-settings', () => ({
  getAdminLlmSettingsPayload: mocks.getAdminLlmSettingsPayload,
  saveLlmRuntimeConfig: mocks.saveLlmRuntimeConfig,
  resetLlmRuntimeConfig: mocks.resetLlmRuntimeConfig,
  testLlmRuntimeConfig: mocks.testLlmRuntimeConfig,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {},
  recordAdminAudit: mocks.recordAdminAudit,
}));

vi.mock('@/lib/runtime-config', () => ({
  isCloudModeEnabled: mocks.isCloudModeEnabled,
}));

import { GET, PUT } from './route';
import { POST as TEST_POST } from './test/route';

const samplePayload = {
  active: { provider: 'google', model: 'gemini-2.5-flash', canRunLive: true },
  source: 'database',
  updatedAt: '2026-11-26T00:00:00Z',
  providers: [],
  presets: { nvidia: [], google: [], openrouter: [], 'openai-compatible': [] },
  envDefaults: { provider: 'nvidia', model: 'nvidia/nemotron-3.5-super-vl-120b-a12b' },
  embeddingLock: { model: 'text-embedding-3-small', dims: 768 },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({
    ok: true,
    context: { userId: 'adm-1', userEmail: 'boss@tariffos.app', role: 'super_admin' },
  });
  mocks.getAdminLlmSettingsPayload.mockResolvedValue(samplePayload);
});

describe('/api/admin/settings/llm', () => {
  it('enforces settings:manage permission on GET', async () => {
    mocks.requireAdmin.mockResolvedValueOnce({
      ok: false,
      response: Response.json({ error: 'Forbidden' }, { status: 403 }),
    });
    const res = await GET();
    expect(res.status).toBe(403);
    expect(mocks.requireAdmin).toHaveBeenCalledWith('settings:manage');
  });

  it('saves valid LLM config and writes an audit log entry', async () => {
    mocks.saveLlmRuntimeConfig.mockResolvedValueOnce({
      before: { provider: 'nvidia', model: 'old' },
      after: { provider: 'google', model: 'gemini-2.5-flash' },
    });

    const res = await PUT(
      new Request('http://localhost/api/admin/settings/llm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          model: 'gemini-2.5-flash',
          deepModel: 'gemini-2.5-pro',
          reason: 'Menor latencia',
        }),
      }),
    );

    expect(res.status).toBe(200);
    expect(mocks.saveLlmRuntimeConfig).toHaveBeenCalledTimes(1);
    expect(mocks.recordAdminAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'settings.llm_updated',
        targetId: 'ai.runtime_config',
        reason: 'Menor latencia',
      }),
    );
  });

  it('supports resetting back to env defaults', async () => {
    mocks.resetLlmRuntimeConfig.mockResolvedValueOnce({
      before: { provider: 'google', model: 'gemini-2.5-flash' },
      after: { provider: 'nvidia', model: 'nvidia/nemotron-3.5-super-vl-120b-a12b' },
    });

    const res = await PUT(
      new Request('http://localhost/api/admin/settings/llm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      }),
    );

    expect(res.status).toBe(200);
    expect(mocks.resetLlmRuntimeConfig).toHaveBeenCalledTimes(1);
  });

  it('POST /test executes the smoke test probe', async () => {
    mocks.testLlmRuntimeConfig.mockResolvedValueOnce({
      ok: true,
      provider: 'google',
      model: 'gemini-2.5-flash',
      latencyMs: 320,
    });

    const res = await TEST_POST(
      new Request('http://localhost/api/admin/settings/llm/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google', model: 'gemini-2.5-flash' }),
      }),
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; latencyMs: number };
    expect(json.ok).toBe(true);
    expect(json.latencyMs).toBe(320);
  });
});
