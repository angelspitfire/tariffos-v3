import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  classifyThreadIntent: vi.fn(),
  defaultProvider: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  deleteMany: vi.fn(),
  groupBy: vi.fn(),
  transaction: vi.fn(),
  txUpsert: vi.fn(),
  txMsgDeleteMany: vi.fn(),
  txMsgCreateMany: vi.fn(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@tariffos/agent', () => ({
  classifyThreadIntent: mocks.classifyThreadIntent,
  defaultProvider: mocks.defaultProvider,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    classificationSession: {
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
      deleteMany: mocks.deleteMany,
      groupBy: mocks.groupBy,
    },
    $transaction: mocks.transaction,
  },
}));

import { DELETE, GET, PUT } from './route';

describe('/api/workspace/threads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { userId: 'u-1', userEmail: 'broker@tariffos.ve', tenantId: 't-1', role: 'OWNER' },
    });
    mocks.defaultProvider.mockReturnValue({ name: 'typesafe-jev', classifyChoice: vi.fn() });
    mocks.classifyThreadIntent.mockResolvedValue({
      processKind: 'single_ruling',
      operationalStatus: 'processing',
      urgency: 'routine',
      retentionPolicy: 'track_until_approved',
      confidence: 0.94,
      source: 'system_one',
    });
    mocks.groupBy.mockResolvedValue([]);
    mocks.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) =>
      cb({
        classificationSession: { upsert: mocks.txUpsert },
        chatMessage: { deleteMany: mocks.txMsgDeleteMany, createMany: mocks.txMsgCreateMany },
      }),
    );
  });

  it('loads tenant threads from ClassificationSession + ChatMessage in backward-compatible default mode', async () => {
    const now = new Date('2026-11-26T10:00:00Z');
    mocks.findMany.mockResolvedValue([
      {
        id: 'thr-1',
        title: 'MacBook Pro 14',
        description: JSON.stringify({
          jurisdictionId: 've-seniat',
          status: 'regular',
          eveSessionId: 'wrun_durable_01',
        }),
        processKind: 'single_ruling',
        operationalStatus: 'processing',
        clientRef: null,
        primaryHsCode: '8471.30.12.00',
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
              text: 'MacBook Pro 14',
              createdAt: now.toISOString(),
              jurisdictionId: 've-seniat',
            }),
            createdAt: now,
          },
        ],
      },
    ]);

    const res = await GET(new Request('http://localhost/api/workspace/threads'));
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      threads: Array<{ id: string; eveSessionId?: string; messages: Array<{ text: string }> }>;
    };
    expect(json.threads).toHaveLength(1);
    expect(json.threads[0]?.eveSessionId).toBe('wrun_durable_01');
    expect(json.threads[0]?.messages[0]?.text).toBe('MacBook Pro 14');
  });

  it('supports lightweight paginated summary queries with status/kind/q filters and operational counts', async () => {
    const now = new Date('2026-11-28T10:00:00Z');
    mocks.findMany.mockResolvedValue([
      {
        id: 'thr-s1',
        title: 'Concentrado Polar',
        description: JSON.stringify({ jurisdictionId: 've-seniat', status: 'regular' }),
        processKind: 'oga_escalation',
        operationalStatus: 'in_review',
        clientRef: 'Importadora Polar · BL-8821',
        primaryHsCode: '2106.90.29.00',
        itemProgressJson: null,
        createdByUserId: 'u-1',
        assignedToUserId: 'u-2',
        createdAt: now,
        updatedAt: now,
      },
    ]);
    mocks.groupBy.mockResolvedValue([
      { operationalStatus: 'in_review', _count: { _all: 3 } },
      { operationalStatus: 'needs_input', _count: { _all: 2 } },
    ]);

    const res = await GET(
      new Request(
        'http://localhost/api/workspace/threads?view=summary&limit=30&q=polar&status=in_review&kind=oga_escalation',
      ),
    );
    expect(res.status).toBe(200);
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 31,
        where: expect.objectContaining({
          tenantId: 't-1',
          operationalStatus: 'in_review',
          processKind: 'oga_escalation',
        }),
      }),
    );
    const callArgs = mocks.findMany.mock.calls[0]?.[0] as { include?: unknown };
    expect(callArgs.include).toBeUndefined();

    const json = (await res.json()) as {
      threads: Array<{ id: string; messagesLoaded: boolean; messages: unknown[]; clientRef?: string }>;
      nextCursor: string | null;
      counts: Record<string, number>;
    };
    expect(json.threads[0]?.messagesLoaded).toBe(false);
    expect(json.threads[0]?.messages).toEqual([]);
    expect(json.threads[0]?.clientRef).toBe('Importadora Polar · BL-8821');
    expect(json.nextCursor).toBeNull();
    expect(json.counts).toMatchObject({ in_review: 3, needs_input: 2 });
  });

  it('upserts thread, derives/stores System 1 triage when omitted, and blocks cross-tenant overwrites', async () => {
    mocks.findUnique.mockResolvedValueOnce({ tenantId: 'other-tenant' });
    const forbidden = await PUT(
      new Request('http://localhost/api/workspace/threads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'thr-1',
          title: 'X',
          jurisdictionId: 've-seniat',
          status: 'regular',
          messages: [],
          createdAt: '2026-11-26T10:00:00Z',
          updatedAt: '2026-11-26T10:00:00Z',
        }),
      }),
    );
    expect(forbidden.status).toBe(403);

    mocks.findUnique.mockResolvedValueOnce({ tenantId: 't-1', createdByUserId: 'u-1', processKind: 'quick_lookup' });
    const ok = await PUT(
      new Request('http://localhost/api/workspace/threads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'thr-1',
          title: 'Laptop',
          jurisdictionId: 've-seniat',
          status: 'regular',
          clientRef: 'Tech VE · FAC-19',
          eveSessionId: 'wrun_durable_02',
          messages: [
            {
              id: 'm1',
              role: 'user',
              text: 'Laptop',
              createdAt: '2026-11-26T10:00:00Z',
              jurisdictionId: 've-seniat',
            },
          ],
          createdAt: '2026-11-26T10:00:00Z',
          updatedAt: '2026-11-26T10:00:00Z',
        }),
      }),
    );
    expect(ok.status).toBe(200);
    const body = (await ok.json()) as { ok: boolean; triage?: { processKind: string } };
    expect(body.triage?.processKind).toBe('single_ruling');
    expect(mocks.classifyThreadIntent).toHaveBeenCalledTimes(1);
    expect(mocks.txUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          processKind: 'single_ruling',
          operationalStatus: 'processing',
          clientRef: 'Tech VE · FAC-19',
        }),
        create: expect.objectContaining({
          createdByUserId: 'u-1',
          clientRef: 'Tech VE · FAC-19',
        }),
      }),
    );
    expect(mocks.txMsgCreateMany).toHaveBeenCalledTimes(1);
  });

  it('deletes tenant-scoped thread by id', async () => {
    const res = await DELETE(new Request('http://localhost/api/workspace/threads?id=thr-1', { method: 'DELETE' }));
    expect(res.status).toBe(200);
    expect(mocks.deleteMany).toHaveBeenCalledWith({ where: { id: 'thr-1', tenantId: 't-1' } });
  });
});
