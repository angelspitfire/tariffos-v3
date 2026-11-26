import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  deleteMany: vi.fn(),
  transaction: vi.fn(),
  txUpsert: vi.fn(),
  txMsgDeleteMany: vi.fn(),
  txMsgCreateMany: vi.fn(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    classificationSession: {
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
      deleteMany: mocks.deleteMany,
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
    mocks.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) =>
      cb({
        classificationSession: { upsert: mocks.txUpsert },
        chatMessage: { deleteMany: mocks.txMsgDeleteMany, createMany: mocks.txMsgCreateMany },
      }),
    );
  });

  it('loads tenant threads from ClassificationSession + ChatMessage', async () => {
    const now = new Date('2026-11-26T10:00:00Z');
    mocks.findMany.mockResolvedValue([
      {
        id: 'thr-1',
        title: 'MacBook Pro 14',
        description: JSON.stringify({ jurisdictionId: 've-seniat', status: 'regular' }),
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

    const res = await GET();
    expect(res.status).toBe(200);
    const json = (await res.json()) as { threads: Array<{ id: string; messages: Array<{ text: string }> }> };
    expect(json.threads).toHaveLength(1);
    expect(json.threads[0]?.messages[0]?.text).toBe('MacBook Pro 14');
  });

  it('upserts thread and messages inside transaction while blocking cross-tenant overwrites', async () => {
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

    mocks.findUnique.mockResolvedValueOnce({ tenantId: 't-1' });
    const ok = await PUT(
      new Request('http://localhost/api/workspace/threads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'thr-1',
          title: 'Laptop',
          jurisdictionId: 've-seniat',
          status: 'regular',
          messages: [{ id: 'm1', role: 'user', text: 'Laptop', createdAt: '2026-11-26T10:00:00Z', jurisdictionId: 've-seniat' }],
          createdAt: '2026-11-26T10:00:00Z',
          updatedAt: '2026-11-26T10:00:00Z',
        }),
      }),
    );
    expect(ok.status).toBe(200);
    expect(mocks.txUpsert).toHaveBeenCalledTimes(1);
    expect(mocks.txMsgCreateMany).toHaveBeenCalledTimes(1);
  });

  it('deletes tenant-scoped thread by id', async () => {
    const res = await DELETE(new Request('http://localhost/api/workspace/threads?id=thr-1', { method: 'DELETE' }));
    expect(res.status).toBe(200);
    expect(mocks.deleteMany).toHaveBeenCalledWith({ where: { id: 'thr-1', tenantId: 't-1' } });
  });
});
