// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  pdfExtract: vi.fn(),
}));

vi.mock('@tariffos/agent', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tariffos/agent')>();
  return {
    ...actual,
    PdfTextAdapter: class {
      extract = mocks.pdfExtract;
    },
  };
});

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

import { POST } from './route';

describe('POST /api/attachments/extract', () => {
  const originalCloud = process.env.NEXT_PUBLIC_CLOUD_MODE;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_CLOUD_MODE = 'false';
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    if (originalCloud === undefined) delete process.env.NEXT_PUBLIC_CLOUD_MODE;
    else process.env.NEXT_PUBLIC_CLOUD_MODE = originalCloud;
  });

  it('enforces cloud authentication when NEXT_PUBLIC_CLOUD_MODE is true', async () => {
    vi.stubEnv('NEXT_PUBLIC_CLOUD_MODE', 'true');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key-123');
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: false,
      status: 401,
      error: 'Authentication required',
    });

    const form = new FormData();
    form.append('file', new File(['hello'], 'spec.txt', { type: 'text/plain' }));
    const req = new NextRequest('http://localhost/api/attachments/extract', {
      method: 'POST',
      body: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('extracts PDF text across pages using PdfTextAdapter', async () => {
    mocks.pdfExtract
      .mockResolvedValueOnce({ text: 'Página 1: Inversor solar 5kW MPPT 48V', claims: [], reader: 'text-layer', source: {} })
      .mockResolvedValueOnce({ text: 'Página 2: Eficiencia 97.6% IP65', claims: [], reader: 'text-layer', source: {} })
      .mockResolvedValueOnce(null);

    const form = new FormData();
    form.append('file', new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'ficha.pdf', { type: 'application/pdf' }));
    const req = new NextRequest('http://localhost/api/attachments/extract', {
      method: 'POST',
      body: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { kind: string; text: string; pagesExtracted: number };
    expect(json.kind).toBe('pdf');
    expect(json.pagesExtracted).toBe(2);
    expect(json.text).toContain('Inversor solar 5kW');
    expect(json.text).toContain('Eficiencia 97.6%');
  });

  it('returns base64 dataUrl for image attachments', async () => {
    const form = new FormData();
    form.append('file', new File([new Uint8Array([1, 2, 3])], 'placa.png', { type: 'image/png' }));
    const req = new NextRequest('http://localhost/api/attachments/extract', {
      method: 'POST',
      body: form,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { kind: string; mimeType: string; dataUrl: string };
    expect(json.kind).toBe('image');
    expect(json.mimeType).toBe('image/png');
    expect(json.dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
