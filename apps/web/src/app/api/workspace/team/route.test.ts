import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  memberFindMany: vi.fn(),
  memberFindUnique: vi.fn(),
  memberUpdate: vi.fn(),
  memberCount: vi.fn(),
  invFindMany: vi.fn(),
  invUpsert: vi.fn(),
  invUpdateMany: vi.fn(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    membership: {
      findMany: mocks.memberFindMany,
      findUnique: mocks.memberFindUnique,
      update: mocks.memberUpdate,
      count: mocks.memberCount,
    },
    invitation: {
      findMany: mocks.invFindMany,
      upsert: mocks.invUpsert,
      updateMany: mocks.invUpdateMany,
    },
  },
}));

import { DELETE, GET, PATCH, POST } from './route';

describe('/api/workspace/team', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { userId: 'u-owner', userEmail: 'owner@agencia.ve', tenantId: 't-1', role: 'OWNER' },
    });
  });

  it('returns members for any role, and hides invitations from non-OWNER members', async () => {
    mocks.memberFindMany.mockResolvedValue([
      { userId: 'u-owner', email: 'owner@agencia.ve', name: 'Carlos', role: 'OWNER', position: 'Director' },
      { userId: 'u-analyst', email: 'ana@agencia.ve', name: 'Ana', role: 'MEMBER', position: 'Analista' },
    ]);
    mocks.invFindMany.mockResolvedValue([
      {
        id: 'inv-1',
        email: 'nuevo@agencia.ve',
        role: 'REVIEWER',
        status: 'PENDING',
        invitedByName: 'Carlos',
        expiresAt: new Date('2026-12-05T00:00:00Z'),
      },
    ]);

    const ownerRes = await GET();
    expect(ownerRes.status).toBe(200);
    const ownerJson = (await ownerRes.json()) as {
      role: string;
      members: Array<{ userId: string; role: string }>;
      invitations: Array<{ id: string }>;
    };
    expect(ownerJson.role).toBe('OWNER');
    expect(ownerJson.members[1]?.role).toBe('ANALYST');
    expect(ownerJson.invitations).toHaveLength(1);

    mocks.resolveCloudTenantContext.mockResolvedValueOnce({
      ok: true,
      context: { userId: 'u-analyst', userEmail: 'ana@agencia.ve', tenantId: 't-1', role: 'MEMBER' },
    });
    const analystRes = await GET();
    expect(analystRes.status).toBe(200);
    const analystJson = (await analystRes.json()) as { role: string; invitations: unknown[] };
    expect(analystJson.role).toBe('ANALYST');
    expect(analystJson.invitations).toEqual([]);
  });

  it('enforces OWNER RBAC on POST invite, PATCH role update (guarding last OWNER), and DELETE revoke', async () => {
    mocks.resolveCloudTenantContext.mockResolvedValueOnce({
      ok: true,
      context: { userId: 'u-analyst', userEmail: 'ana@agencia.ve', tenantId: 't-1', role: 'ANALYST' },
    });
    const forbidden = await POST(
      new Request('http://localhost/api/workspace/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'rev@agencia.ve', role: 'REVIEWER' }),
      }),
    );
    expect(forbidden.status).toBe(403);

    mocks.invUpsert.mockResolvedValueOnce({
      id: 'inv-2',
      email: 'rev@agencia.ve',
      role: 'REVIEWER',
      status: 'PENDING',
      invitedByName: 'owner@agencia.ve',
      expiresAt: new Date('2026-12-05T00:00:00Z'),
    });
    const created = await POST(
      new Request('http://localhost/api/workspace/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'rev@agencia.ve', role: 'REVIEWER' }),
      }),
    );
    expect(created.status).toBe(201);
    expect(mocks.invUpsert).toHaveBeenCalledTimes(1);

    // Guard against demoting the last OWNER
    mocks.memberFindUnique.mockResolvedValueOnce({ id: 'm-1', userId: 'u-owner', role: 'OWNER' });
    mocks.memberCount.mockResolvedValueOnce(1);
    const lastOwnerErr = await PATCH(
      new Request('http://localhost/api/workspace/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'u-owner', role: 'ANALYST' }),
      }),
    );
    expect(lastOwnerErr.status).toBe(400);

    mocks.memberFindUnique.mockResolvedValueOnce({ id: 'm-2', userId: 'u-analyst', role: 'MEMBER' });
    mocks.memberUpdate.mockResolvedValueOnce({
      userId: 'u-analyst',
      email: 'ana@agencia.ve',
      name: 'Ana',
      role: 'REVIEWER',
      position: 'Analista',
    });
    const promoted = await PATCH(
      new Request('http://localhost/api/workspace/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'u-analyst', role: 'REVIEWER' }),
      }),
    );
    expect(promoted.status).toBe(200);

    const revoked = await DELETE(
      new Request('http://localhost/api/workspace/team?invitationId=inv-2', { method: 'DELETE' }),
    );
    expect(revoked.status).toBe(200);
    expect(mocks.invUpdateMany).toHaveBeenCalledWith({
      where: { id: 'inv-2', tenantId: 't-1' },
      data: { status: 'REVOKED' },
    });
  });
});
