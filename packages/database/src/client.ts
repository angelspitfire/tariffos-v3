import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

interface PrismaGlobals {
  prisma: PrismaClient | undefined;
  tenantClients: Map<string, PrismaClient> | undefined;
  tenantPools: Map<string, pg.Pool> | undefined;
}
const globalForPrisma = global as unknown as PrismaGlobals;

const LOG_EVENTS: Array<'query' | 'error' | 'warn'> =
  process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'];

export function initializePrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  if (!process.env.DATABASE_URL && process.env.NEXT_PHASE) {
    return new Proxy({} as any, { get: () => () => Promise.resolve() }) as any;
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn('⚠️ [Prisma] DATABASE_URL is not set. Reads return empty; writes throw — app data access is Prisma-canonical (@tariffos/database); InsForge DB reads are legacy/compat only (onboarding, debug-db).');
    const writeBlocked = (model: unknown, method: unknown): never => {
      throw new Error(
        `[Prisma] DATABASE_URL is not set — blocked ${String(model)}.${String(method)} write. App data access is Prisma-canonical; configure DATABASE_URL.`
      );
    };
    const proxy = new Proxy({} as PrismaClient, {
      get: (_target, prop) => {
        if (prop === '$connect' || prop === '$disconnect') return () => Promise.resolve();
        if (prop === '$transaction') return async () => {
          throw new Error('[Prisma] DATABASE_URL is not set — blocked $transaction. App data access is Prisma-canonical; configure DATABASE_URL.');
        };
        if (prop === '$extends') return (ext: any) => proxy;
        if (typeof prop === 'symbol') return undefined;
        // Return a chained proxy for model access (e.g. prisma.tenant.findMany).
        // Reads return empty results; writes throw instead of fake-succeeding.
        return new Proxy({}, {
          get: (_m, method) => {
            if (typeof method === 'symbol') return undefined;
            if (method === 'findMany') return async () => [];
            if (method === 'findFirst') return async () => null;
            if (method === 'findUnique') return async () => null;
            if (method === 'count') return async () => 0;
            if (method === 'aggregate') return async () => ({ _sum: {}, _avg: {}, _count: {} });
            if (method === 'groupBy') return async () => [];
            if (method === 'create' || method === 'createMany' || method === 'upsert' ||
                method === 'update' || method === 'updateMany' || method === 'delete' ||
                method === 'deleteMany' || method === 'executeRaw' || method === '$executeRaw') {
              return async () => writeBlocked(prop, method);
            }
            return async () => null;
          }
        });
      }
    });
    return proxy;
  }

  try {
    const pool = new pg.Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    const prisma = new (PrismaClient as any)({
      adapter,
      log: LOG_EVENTS,
    });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
    return prisma;
  } catch (e: any) {
    if (e.message && e.message.includes('accelerateUrl')) {
      console.warn('⚠️ [Prisma] Running in Edge environment without Database Adapter. Prisma safely disabled.');
    } else {
      console.warn('⚠️ [Prisma] Database unavailable. Prisma safely disabled.');
    }
    const prisma = new (PrismaClient as any)({
      log: LOG_EVENTS,
    });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
    return prisma;
  }
}

export const prisma = initializePrisma();

/**
 * Tenant-scoped Prisma client backed by a pool dedicated to that tenant.
 *
 * `app.current_tenant` is applied in the pool's `verify` hook, which pg-pool
 * runs for each **new** connection and awaits before handing the connection to
 * the caller. The parameterized setter therefore completes first (so RLS is
 * always in force) and the caller's query lands on an idle socket — the
 * ordering that otherwise triggers pg's "already executing a query"
 * deprecation. Reused connections keep the setting for their lifetime; since
 * the pool serves exactly one tenant it can never bleed.
 *
 * Deliberately NOT implemented as `prisma.$transaction([set_config, query])`
 * around every operation: that forced each read onto a single `PgTransaction`
 * client, which made Prisma's concurrent relation loads collide, and cost
 * BEGIN/SET/COMMIT round trips on every read. Also NOT in a `connect` hook:
 * pg-pool hands the connection over in the same tick, so the setter would
 * still be queued when the caller's query arrives.
 */
export function getTenantClient(tenantId: string): PrismaClient {
  if (!tenantId) return prisma;

  const clients = (globalForPrisma.tenantClients ??= new Map());
  const pools = (globalForPrisma.tenantPools ??= new Map());

  const cached = clients.get(tenantId);
  if (cached) return cached;

  const url = process.env.DATABASE_URL;
  if (!url) return prisma; // Proxy path: reads empty, writes throw.

  // `verify` is pg-pool's per-new-connection gate; it is not in @types/pg.
  const setTenantGUC = (
    client: pg.Client,
    done: (err?: Error) => void,
  ): void => {
    client.query(
      "SELECT set_config('app.current_tenant', $1, false)",
      [tenantId],
      (err) => {
        // Fail loud: RLS policies are permissive when the GUC is unset, so a
        // connection that could not be isolated must never be handed out.
        if (err) {
          console.error(`⚠️ [Prisma] Failed to set app.current_tenant for ${tenantId}:`, err);
          done(err);
          return;
        }
        done();
      },
    );
  };

  const pool = new pg.Pool({
    connectionString: url,
    max: Number(process.env.TENANT_POOL_MAX ?? 5),
    verify: setTenantGUC,
  } as pg.PoolConfig & { verify: typeof setTenantGUC });

  const client = new (PrismaClient as any)({
    adapter: new PrismaPg(pool),
    log: LOG_EVENTS,
  }) as PrismaClient;

  clients.set(tenantId, client);
  pools.set(tenantId, pool);
  return client;
}

export const getPrismaClient = getTenantClient; // For backwards compatibility
export const getUnscopedSystemPrisma = (): PrismaClient => prisma; // For system-level operations
