import type {
  AdminAuditLogItem,
  AdminLeadRecord,
  AdminPlanRecord,
  ManualPaymentRecord,
  PlatformAdminRecord,
} from '@tariffos/shared-types';
import {
  createInitialOfflineAuditLogs,
  createInitialOfflineLeads,
  createInitialOfflinePayments,
  createInitialOfflinePlans,
  createInitialOfflinePlatformAdmins,
  createInitialOfflineTenants,
  type OfflineTenantRecord,
} from './offline-seed';

interface OfflineAdminState {
  plans: AdminPlanRecord[];
  leads: AdminLeadRecord[];
  tenants: OfflineTenantRecord[];
  payments: ManualPaymentRecord[];
  platformAdmins: PlatformAdminRecord[];
  auditLogs: AdminAuditLogItem[];
}

const globalForAdmin = globalThis as unknown as {
  __tariffosOfflineAdminState?: OfflineAdminState;
};

function createFreshState(): OfflineAdminState {
  return {
    plans: createInitialOfflinePlans(),
    leads: createInitialOfflineLeads(),
    tenants: createInitialOfflineTenants(),
    payments: createInitialOfflinePayments(),
    platformAdmins: createInitialOfflinePlatformAdmins(),
    auditLogs: createInitialOfflineAuditLogs(),
  };
}

export function getOfflineAdminState(): OfflineAdminState {
  if (!globalForAdmin.__tariffosOfflineAdminState) {
    globalForAdmin.__tariffosOfflineAdminState = createFreshState();
  }
  return globalForAdmin.__tariffosOfflineAdminState;
}

export function resetOfflineAdminState(): OfflineAdminState {
  globalForAdmin.__tariffosOfflineAdminState = createFreshState();
  return globalForAdmin.__tariffosOfflineAdminState;
}

export function appendOfflineAudit(
  entry: Omit<AdminAuditLogItem, 'id' | 'createdAt'>,
): AdminAuditLogItem {
  const state = getOfflineAdminState();
  const item: AdminAuditLogItem = {
    ...entry,
    id: `aud-${Date.now()}-${state.auditLogs.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  state.auditLogs.unshift(item);
  return item;
}

export function findOfflinePlan(planId: string | null | undefined): AdminPlanRecord | undefined {
  if (!planId) return undefined;
  return getOfflineAdminState().plans.find((p) => p.id === planId || p.name === planId);
}
