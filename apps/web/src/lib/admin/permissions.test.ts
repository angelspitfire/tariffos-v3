import { describe, expect, it } from 'vitest';
import { hasAdminPermission, isPlatformAdminRole, normalizePlatformRole } from './permissions';

describe('admin permissions RBAC matrix', () => {
  it('normalizes unknown or empty roles to user', () => {
    expect(normalizePlatformRole(null)).toBe('user');
    expect(normalizePlatformRole(undefined)).toBe('user');
    expect(normalizePlatformRole('OWNER')).toBe('user');
    expect(normalizePlatformRole('SUPER_ADMIN')).toBe('super_admin');
    expect(normalizePlatformRole('ops_billing')).toBe('ops_billing');
  });

  it('denies all admin permissions to regular users', () => {
    expect(isPlatformAdminRole('user')).toBe(false);
    expect(hasAdminPermission('user', 'admin:read')).toBe(false);
    expect(hasAdminPermission('user', 'billing:approve')).toBe(false);
    expect(hasAdminPermission('user', 'plans:manage')).toBe(false);
  });

  it('grants read-only operational visibility to support role', () => {
    expect(isPlatformAdminRole('support')).toBe(true);
    expect(hasAdminPermission('support', 'admin:read')).toBe(true);
    expect(hasAdminPermission('support', 'billing:read')).toBe(true);
    expect(hasAdminPermission('support', 'usage:read')).toBe(true);
    expect(hasAdminPermission('support', 'billing:approve')).toBe(false);
    expect(hasAdminPermission('support', 'tenants:deactivate')).toBe(false);
    expect(hasAdminPermission('support', 'plans:manage')).toBe(false);
  });

  it('grants operational billing, leads, onboarding, and deactivation to ops_billing', () => {
    expect(isPlatformAdminRole('ops_billing')).toBe(true);
    expect(hasAdminPermission('ops_billing', 'leads:manage')).toBe(true);
    expect(hasAdminPermission('ops_billing', 'tenants:onboard')).toBe(true);
    expect(hasAdminPermission('ops_billing', 'tenants:manage')).toBe(true);
    expect(hasAdminPermission('ops_billing', 'tenants:deactivate')).toBe(true);
    expect(hasAdminPermission('ops_billing', 'billing:approve')).toBe(true);
    expect(hasAdminPermission('ops_billing', 'audit:read')).toBe(true);
    expect(hasAdminPermission('ops_billing', 'plans:manage')).toBe(false);
    expect(hasAdminPermission('ops_billing', 'admins:manage')).toBe(false);
  });

  it('grants full platform permissions to super_admin', () => {
    expect(isPlatformAdminRole('super_admin')).toBe(true);
    expect(hasAdminPermission('super_admin', 'plans:manage')).toBe(true);
    expect(hasAdminPermission('super_admin', 'admins:manage')).toBe(true);
    expect(hasAdminPermission('super_admin', 'tenants:deactivate')).toBe(true);
    expect(hasAdminPermission('super_admin', 'settings:manage')).toBe(true);
    expect(hasAdminPermission('super_admin', 'ai_quality:read')).toBe(true);
  });

  it('restricts settings:manage to super_admin while allowing ai_quality:read to ops and support', () => {
    expect(hasAdminPermission('ops_billing', 'settings:manage')).toBe(false);
    expect(hasAdminPermission('support', 'settings:manage')).toBe(false);
    expect(hasAdminPermission('ops_billing', 'ai_quality:read')).toBe(true);
    expect(hasAdminPermission('support', 'ai_quality:read')).toBe(true);
    expect(hasAdminPermission('user', 'ai_quality:read')).toBe(false);
  });

  it('grants ingestion:read to support/ops_billing/super_admin and restricts ingestion:manage to super_admin', () => {
    expect(hasAdminPermission('user', 'ingestion:read')).toBe(false);
    expect(hasAdminPermission('user', 'ingestion:manage')).toBe(false);
    expect(hasAdminPermission('support', 'ingestion:read')).toBe(true);
    expect(hasAdminPermission('support', 'ingestion:manage')).toBe(false);
    expect(hasAdminPermission('ops_billing', 'ingestion:read')).toBe(true);
    expect(hasAdminPermission('ops_billing', 'ingestion:manage')).toBe(false);
    expect(hasAdminPermission('super_admin', 'ingestion:read')).toBe(true);
    expect(hasAdminPermission('super_admin', 'ingestion:manage')).toBe(true);
  });
});
