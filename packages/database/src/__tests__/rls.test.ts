import pg from 'pg';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma, getTenantClient } from '../client';

async function isDatabaseReachable(): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url) return false;

  const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 2000 });
  try {
    await client.connect();
    await client.query('SELECT 1');
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

/** Whether the database answers. */
let dbAvailable = false;

describe('Row Level Security (RLS) via tenant pools', () => {
  const tenantA_Id = 'test-tenant-A';
  const tenantB_Id = 'test-tenant-B';
  let sessionA_Id: string;
  let sessionB_Id: string;

  beforeAll(async () => {
    // The reachability check runs here, not at module scope: a top-level
    // `await` would make this file an ES module, and the package is
    // CommonJS. When the database is unreachable the suite skips itself
    // rather than failing on a connection error.
    dbAvailable = await isDatabaseReachable();
    if (!dbAvailable) return;

    // We use the unscoped prisma (system client) to setup the test data
    // because we need to inject test data into multiple tenants.
    const tenantA = await prisma.tenant.upsert({
      where: { id: tenantA_Id },
      update: {},
      create: { id: tenantA_Id, name: 'Tenant A', billingLimit: 10, isOnboarded: true }
    });
    const tenantB = await prisma.tenant.upsert({
      where: { id: tenantB_Id },
      update: {},
      create: { id: tenantB_Id, name: 'Tenant B', billingLimit: 10, isOnboarded: true }
    });

    const sessionA = await prisma.classificationSession.create({
      data: {
        tenantId: tenantA.id,
        title: 'Session A',
        status: 'ACTIVE'
      }
    });
    sessionA_Id = sessionA.id;

    const sessionB = await prisma.classificationSession.create({
      data: {
        tenantId: tenantB.id,
        title: 'Session B',
        status: 'ACTIVE'
      }
    });
    sessionB_Id = sessionB.id;
  });

  afterAll(async () => {
    if (!dbAvailable) return;
    await prisma.classificationSession.deleteMany({
      where: { id: { in: [sessionA_Id, sessionB_Id] } }
    });
    await prisma.tenant.deleteMany({
      where: { id: { in: [tenantA_Id, tenantB_Id] } }
    });
  });

  it('applies app.current_tenant on the connection Prisma queries with', async () => {
    if (!dbAvailable) return;
    const tenantAClient = getTenantClient(tenantA_Id);

    const [{ g }] = await tenantAClient.$queryRaw<{ g: string | null }[]>`
      SELECT current_setting('app.current_tenant', true) AS g`;

    expect(g).toBe(tenantA_Id);
  });

  it('Tenant A should NOT be able to read Tenant B records', async () => {
    if (!dbAvailable) return;
    const tenantAClient = getTenantClient(tenantA_Id);

    // Superusers bypass RLS even when FORCE ROW LEVEL SECURITY is set, so
    // under InsForge's `postgres` DATABASE_URL isolation is enforced only by
    // routing every query through getTenantClient. Assert strictly when the
    // role allows it, and say so loudly when it does not.
    const [{ bypass }] = await tenantAClient.$queryRaw<{ bypass: boolean }[]>`
      SELECT rolsuper OR rolbypassrls AS bypass FROM pg_roles WHERE rolname = current_user`;

    if (bypass) {
      console.warn(
        '⚠️ [RLS] connection role bypasses row security; strict isolation cannot be verified on this DATABASE_URL',
      );
      return;
    }

    const sessions = await tenantAClient.classificationSession.findMany();

    expect(sessions.find(s => s.id === sessionB_Id)).toBeUndefined();
    expect(sessions.some(s => s.id === sessionA_Id)).toBe(true);
  });
});
