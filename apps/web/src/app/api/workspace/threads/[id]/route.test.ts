import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    classificationSession: {
      findUnique: mocks.findUnique,
      update: mocks.update,
    },
  },
}));

import { GET, PATCH } from './route';

describe('/api/workspace/threads/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { userId: 'u-1', userEmail: 'broker@tariffos.ve', tenantId: 't-1', role: 'OWNER' },
    });
  });

  it('returns 404 when missing and 403 when session belongs to another tenant', async () => {
    mocks.findUnique.mockResolvedValueOnce(null);
    const missing = await GET(new Request('http://localhost/api/workspace/threads/missing'), {
      params: Promise.resolve({ id: 'missing' }),
    });
    expect(missing.status).toBe(404);

    mocks.findUnique.mockResolvedValueOnce({ id: 'thr-other', tenantId: 't-other' });
    const forbidden = await GET(new Request('http://localhost/api/workspace/threads/thr-other'), {
      params: Promise.resolve({ id: 'thr-other' }),
    });
    expect(forbidden.status).toBe(403);
  });

  it('hydrates full messages on GET for an authorized tenant session', async () => {
    const now = new Date('2026-11-28T10:00:00Z');
    mocks.findUnique.mockResolvedValueOnce({
      id: 'thr-1',
      tenantId: 't-1',
      title: 'Válvula industrial',
      description: JSON.stringify({ jurisdictionId: 've-seniat', status: 'regular', eveSessionId: 'eve-1' }),
      processKind: 'single_ruling',
      operationalStatus: 'processing',
      clientRef: 'PDVSA · OC-99',
      primaryHsCode: '8481.80.99.00',
      itemProgressJson: null,
      createdByUserId: 'u-1',
      assignedToUserId: null,
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: 'm1',
          role: 'user',
          content: JSON.stringify({
            id: 'm1',
            role: 'user',
            text: 'Válvula de bola acero 2"',
            createdAt: now.toISOString(),
            jurisdictionId: 've-seniat',
          }),
          createdAt: now,
        },
      ],
    });

    const res = await GET(new Request('http://localhost/api/workspace/threads/thr-1'), {
      params: Promise.resolve({ id: 'thr-1' }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      thread: { id: string; messagesLoaded: boolean; clientRef: string; messages: Array<{ text: string }> };
    };
    expect(json.thread.id).toBe('thr-1');
    expect(json.thread.messagesLoaded).toBe(true);
    expect(json.thread.clientRef).toBe('PDVSA · OC-99');
    expect(json.thread.messages[0]?.text).toBe('Válvula de bola acero 2"');
  });

  it('patches targeted metadata without rewriting ChatMessage and enforces tenant ownership', async () => {
    mocks.findUnique.mockResolvedValueOnce({ id: 'thr-2', tenantId: 'other-tenant', description: '{}' });
    const forbidden = await PATCH(
      new Request('http://localhost/api/workspace/threads/thr-2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientRef: 'X' }),
      }),
      { params: Promise.resolve({ id: 'thr-2' }) },
    );
    expect(forbidden.status).toBe(403);

    const now = new Date('2026-11-28T11:00:00Z');
    mocks.findUnique.mockResolvedValueOnce({
      id: 'thr-1',
      tenantId: 't-1',
      description: JSON.stringify({ jurisdictionId: 've-seniat', status: 'regular', eveSessionId: 'eve-1' }),
    });
    mocks.update.mockResolvedValueOnce({
      id: 'thr-1',
      tenantId: 't-1',
      title: 'Válvula industrial',
      description: JSON.stringify({ jurisdictionId: 've-seniat', status: 'archived', eveSessionId: 'eve-1' }),
      processKind: 'single_ruling',
      operationalStatus: 'archived',
      clientRef: 'Cliente ABC · FAC-10',
      primaryHsCode: '8481.80.99.00',
      itemProgressJson: null,
      createdByUserId: 'u-1',
      assignedToUserId: 'u-9',
      createdAt: now,
      updatedAt: now,
    });

    const ok = await PATCH(
      new Request('http://localhost/api/workspace/threads/thr-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientRef: 'Cliente ABC · FAC-10',
          operationalStatus: 'archived',
          status: 'archived',
          assignedToUserId: 'u-9',
        }),
      }),
      { params: Promise.resolve({ id: 'thr-1' }) },
    );
    expect(ok.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'thr-1' },
        data: expect.objectContaining({
          clientRef: 'Cliente ABC · FAC-10',
          operationalStatus: 'archived',
          status: 'ARCHIVED',
          assignedToUserId: 'u-9',
        }),
      }),
    );
  });
});
