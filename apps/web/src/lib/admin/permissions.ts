import type { AdminPermission, PlatformRole } from '@tariffos/shared-types';

const ALL_PERMISSIONS: readonly AdminPermission[] = [
  'admin:read',
  'plans:manage',
  'leads:manage',
  'tenants:onboard',
  'tenants:manage',
  'tenants:deactivate',
  'billing:read',
  'billing:approve',
  'usage:read',
  'audit:read',
  'admins:manage',
  'settings:manage',
  'ai_quality:read',
  'ingestion:read',
  'ingestion:manage',
];

const ROLE_PERMISSIONS: Record<PlatformRole, ReadonlySet<AdminPermission>> = {
  user: new Set<AdminPermission>(),
  support: new Set<AdminPermission>([
    'admin:read',
    'billing:read',
    'usage:read',
    'ai_quality:read',
    'ingestion:read',
  ]),
  ops_billing: new Set<AdminPermission>([
    'admin:read',
    'leads:manage',
    'tenants:onboard',
    'tenants:manage',
    'tenants:deactivate',
    'billing:read',
    'billing:approve',
    'usage:read',
    'audit:read',
    'ai_quality:read',
    'ingestion:read',
  ]),
  super_admin: new Set<AdminPermission>(ALL_PERMISSIONS),
};

export function normalizePlatformRole(raw: string | null | undefined): PlatformRole {
  const normalized = (raw ?? '').trim().toLowerCase();
  if (normalized === 'super_admin') return 'super_admin';
  if (normalized === 'ops_billing') return 'ops_billing';
  if (normalized === 'support') return 'support';
  return 'user';
}

export function isPlatformAdminRole(role: PlatformRole): boolean {
  return role !== 'user';
}

export function hasAdminPermission(role: PlatformRole, permission: AdminPermission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}
