import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

interface PrismaGlobals {
  prisma: PrismaClient | undefined;
}
const globalForPrisma = global as unknown as PrismaGlobals;

const LOG_EVENTS: Array<'query' | 'error' | 'warn'> =
  process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'];

function createDisabledPrismaProxy(): PrismaClient {
  const writeBlocked = (model: unknown, method: unknown): never => {
    throw new Error(
      `[Prisma] DATABASE_URL is not set — blocked ${String(model)}.${String(method)} write. Configure DATABASE_URL for @tariffos/database.`,
    );
  };
  const proxy = new Proxy({} as PrismaClient, {
    get: (_target, prop) => {
      if (prop === '$connect' || prop === '$disconnect') return () => Promise.resolve();
      if (prop === '$transaction') {
        return async () => {
          throw new Error(
            '[Prisma] DATABASE_URL is not set — blocked $transaction. Configure DATABASE_URL for @tariffos/database.',
          );
        };
      }
      if (prop === '$extends') return () => proxy;
      if (typeof prop === 'symbol') return undefined;
      return new Proxy(
        {},
        {
          get: (_m, method) => {
            if (typeof method === 'symbol') return undefined;
            if (method === 'findMany') return async () => [];
            if (method === 'findFirst' || method === 'findUnique') return async () => null;
            if (method === 'count') return async () => 0;
            if (method === 'aggregate') return async () => ({ _sum: {}, _avg: {}, _count: {} });
            if (method === 'groupBy') return async () => [];
            if (
              method === 'create' ||
              method === 'createMany' ||
              method === 'upsert' ||
              method === 'update' ||
              method === 'updateMany' ||
              method === 'delete' ||
              method === 'deleteMany' ||
              method === 'executeRaw' ||
              method === '$executeRaw'
            ) {
              return async () => writeBlocked(prop, method);
            }
            return async () => null;
          },
        },
      );
    },
  });
  return proxy;
}

export function initializePrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  if (!process.env.DATABASE_URL && process.env.NEXT_PHASE) {
    return new Proxy({} as PrismaClient, { get: () => () => Promise.resolve() });
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn('⚠️ [Prisma] DATABASE_URL is not set. Reads return empty; writes throw.');
    return createDisabledPrismaProxy();
  }

  try {
    const pool = new pg.Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    const client = new (PrismaClient as unknown as new (opts: Record<string, unknown>) => PrismaClient)({
      adapter,
      log: LOG_EVENTS,
    });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
    return client;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('accelerateUrl')) {
      console.warn('⚠️ [Prisma] Running in Edge environment without Database Adapter. Prisma disabled.');
    } else {
      console.warn('⚠️ [Prisma] Database unavailable. Prisma safely disabled.');
    }
    const client = new (PrismaClient as unknown as new (opts: Record<string, unknown>) => PrismaClient)({
      log: LOG_EVENTS,
    });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
    return client;
  }
}

export const prisma = initializePrisma();

/**
 * Returns the shared pooled Prisma client.
 * Tenant isolation is enforced by explicit `tenantId` predicates at the query
 * boundary rather than allocating unbounded per-tenant `pg.Pool` instances.
 */
export function getTenantClient(_tenantId: string): PrismaClient {
  return prisma;
}

export const getPrismaClient = getTenantClient;
export const getUnscopedSystemPrisma = (): PrismaClient => prisma;
