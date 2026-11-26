import type { AdminPermission } from '@tariffos/shared-types';
import {
  resolvePlatformAdminContext,
  type PlatformAdminContext,
} from './admin-session';

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function requireAdmin(
  permission: AdminPermission,
): Promise<{ ok: true; context: PlatformAdminContext } | { ok: false; response: Response }> {
  const auth = await resolvePlatformAdminContext(permission);
  if (!auth.ok) {
    return {
      ok: false,
      response: Response.json({ error: auth.error }, { status: auth.status }),
    };
  }
  return { ok: true, context: auth.context };
}

export function extractPlanFeaturesMeta(features: unknown): {
  displayName?: string;
  annualPriceUsd?: number;
  annualOnly: boolean;
  maxUsers: number;
  isPublic: boolean;
  isArchived: boolean;
  items: string[];
} {
  if (!features || typeof features !== 'object' || Array.isArray(features)) {
    return { annualOnly: false, maxUsers: 1, isPublic: true, isArchived: false, items: [] };
  }
  const obj = features as Record<string, unknown>;
  const items = Array.isArray(obj.items)
    ? obj.items.filter((v): v is string => typeof v === 'string')
    : [];
  return {
    displayName: typeof obj.displayName === 'string' ? obj.displayName : undefined,
    annualPriceUsd: typeof obj.annualPriceUsd === 'number' ? obj.annualPriceUsd : undefined,
    annualOnly: Boolean(obj.annualOnly),
    maxUsers: typeof obj.maxUsers === 'number' && obj.maxUsers > 0 ? obj.maxUsers : 1,
    isPublic: obj.isPublic === undefined ? true : Boolean(obj.isPublic),
    isArchived: Boolean(obj.isArchived),
    items,
  };
}
