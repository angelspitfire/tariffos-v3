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
  oneTimeOnly: boolean;
  customPricing: boolean;
  allowBatch: boolean;
  creditableDays?: number;
  maxUsers: number;
  sortOrder?: number;
  isPublic: boolean;
  isArchived: boolean;
  items: string[];
} {
  if (!features || typeof features !== 'object' || Array.isArray(features)) {
    return {
      annualOnly: false,
      oneTimeOnly: false,
      customPricing: false,
      allowBatch: true,
      maxUsers: 1,
      sortOrder: undefined,
      isPublic: true,
      isArchived: false,
      items: [],
    };
  }
  const obj = features as Record<string, unknown>;
  const items = Array.isArray(obj.items)
    ? obj.items.filter((v): v is string => typeof v === 'string')
    : [];
  return {
    displayName: typeof obj.displayName === 'string' ? obj.displayName : undefined,
    annualPriceUsd: typeof obj.annualPriceUsd === 'number' ? obj.annualPriceUsd : undefined,
    annualOnly: Boolean(obj.annualOnly),
    oneTimeOnly: Boolean(obj.oneTimeOnly),
    customPricing: Boolean(obj.customPricing),
    allowBatch: obj.allowBatch === undefined ? true : Boolean(obj.allowBatch),
    creditableDays: typeof obj.creditableDays === 'number' ? obj.creditableDays : undefined,
    maxUsers: typeof obj.maxUsers === 'number' && obj.maxUsers > 0 ? obj.maxUsers : 1,
    sortOrder: typeof obj.sortOrder === 'number' ? obj.sortOrder : undefined,
    isPublic: obj.isPublic === undefined ? true : Boolean(obj.isPublic),
    isArchived: Boolean(obj.isArchived),
    items,
  };
}
