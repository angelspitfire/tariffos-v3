import {
  SAAS_PLANS,
  type AdminAuditLogItem,
  type AdminLeadRecord,
  type AdminPlanRecord,
  type ManualPaymentRecord,
  type TenantBillingStatus,
} from '@tariffos/shared-types';

export interface OfflineMemberRecord {
  userId: string;
  email: string;
  name: string;
  role: string;
  position?: string;
}

export interface OfflineTenantRecord {
  id: string;
  name: string;
  taxId: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  countryCode: string;
  planId: string | null;
  billingStatus: TenantBillingStatus;
  billingLimit: number;
  allowOverage: boolean;
  createdAt: string;
  members: OfflineMemberRecord[];
  usedThisMonth: number;
  inputTokensThisMonth: number;
  outputTokensThisMonth: number;
  activeBatchJobs: number;
  failedBatchJobs: number;
}

export function createInitialOfflinePlans(): AdminPlanRecord[] {
  const publicPlans: AdminPlanRecord[] = SAAS_PLANS.map((plan) => ({
    id: plan.planId,
    name: plan.planId,
    displayName: plan.name,
    description: plan.description,
    basePrice: plan.annualOnly ? plan.annualPriceUsd : plan.monthlyPriceUsd,
    annualPriceUsd: plan.annualPriceUsd,
    annualOnly: Boolean(plan.annualOnly),
    classificationLimit: plan.monthlyQuota,
    maxTokens: plan.monthlyQuota * 10_000,
    maxUsers: plan.maxUsers ?? 1,
    overagePrice: 0,
    allowOverage: false,
    isPublic: plan.published,
    isArchived: false,
    features: [...plan.features],
    tenantCount: plan.planId === 'agencia' ? 1 : 0,
  }));

  const legacyHiddenPlans: AdminPlanRecord[] = [
    {
      id: 'trial',
      name: 'trial',
      displayName: 'Cortesía Admin (Trial)',
      description: 'Plan de cortesía interno asignable manualmente por el administrador.',
      basePrice: 0,
      annualPriceUsd: 0,
      annualOnly: false,
      classificationLimit: 5,
      maxTokens: 50_000,
      maxUsers: 1,
      overagePrice: 0,
      allowOverage: false,
      isPublic: false,
      isArchived: false,
      features: ['Cortesía controlada desde /admin/onboarding'],
      tenantCount: 1,
    },
    {
      id: 'pro',
      name: 'pro',
      displayName: 'Pro (Legacy)',
      description: 'Plan histórico oculto del embudo público.',
      basePrice: 299,
      annualPriceUsd: 2990,
      annualOnly: false,
      classificationLimit: 400,
      maxTokens: 4_000_000,
      maxUsers: 3,
      overagePrice: 0,
      allowOverage: false,
      isPublic: false,
      isArchived: false,
      features: ['Plan legado'],
      tenantCount: 1,
    },
  ];

  return [...publicPlans, ...legacyHiddenPlans];
}

export function createInitialOfflineLeads(): AdminLeadRecord[] {
  return [
    {
      id: 'lead-demo-1',
      email: 'gerencia@aduanacaribe.ve',
      name: 'Carlos Mendoza',
      company: 'Aduanas del Caribe C.A.',
      phone: '+58 412 555 0199',
      notes: 'Importación frecuente de electrónica y repuestos.',
      country: 'VE',
      volume: '300-500/mes',
      source: 'landing_corporate_cta',
      status: 'PENDING',
      approvedAt: null,
      createdAt: '2026-11-24T14:20:00.000Z',
    },
    {
      id: 'lead-demo-2',
      email: 'operaciones@importadoralara.com',
      name: 'María Pérez',
      company: 'Importadora Lara S.A.',
      phone: '+58 414 555 0144',
      notes: null,
      country: 'VE',
      volume: '40-100/mes',
      source: 'landing_hero',
      status: 'CONTACTED',
      approvedAt: null,
      createdAt: '2026-11-25T09:10:00.000Z',
    },
  ];
}

export function createInitialOfflineTenants(): OfflineTenantRecord[] {
  return [
    {
      id: 'ten-demo-1',
      name: 'Agencia Aduanal Maiquetía S.A.',
      taxId: 'J-30192837-4',
      ownerName: 'Roberto Silva',
      ownerEmail: 'rsilva@maiquetia-aduanas.ve',
      countryCode: 'VE',
      planId: 'pro',
      billingStatus: 'ACTIVE',
      billingLimit: 400,
      allowOverage: false,
      createdAt: '2026-11-01T10:00:00.000Z',
      members: [
        { userId: 'usr-1', email: 'rsilva@maiquetia-aduanas.ve', name: 'Roberto Silva', role: 'OWNER' },
        { userId: 'usr-2', email: 'analista@maiquetia-aduanas.ve', name: 'Ana Gómez', role: 'MEMBER' },
      ],
      usedThisMonth: 332,
      inputTokensThisMonth: 184000,
      outputTokensThisMonth: 49200,
      activeBatchJobs: 1,
      failedBatchJobs: 0,
    },
    {
      id: 'ten-demo-2',
      name: 'Logística Maracaibo Express',
      taxId: 'J-40998811-2',
      ownerName: 'Lucía Fernández',
      ownerEmail: 'lfernandez@maracaiboexpress.ve',
      countryCode: 'VE',
      planId: 'trial',
      billingStatus: 'TRIALING',
      billingLimit: 5,
      allowOverage: false,
      createdAt: '2026-11-20T16:30:00.000Z',
      members: [
        { userId: 'usr-3', email: 'lfernandez@maracaiboexpress.ve', name: 'Lucía Fernández', role: 'OWNER' },
      ],
      usedThisMonth: 4,
      inputTokensThisMonth: 6200,
      outputTokensThisMonth: 1800,
      activeBatchJobs: 0,
      failedBatchJobs: 1,
    },
  ];
}

export function createInitialOfflinePayments(): ManualPaymentRecord[] {
  return [
    {
      paymentId: 'pay-demo-1',
      userId: 'usr-3',
      tenantId: 'ten-demo-2',
      userEmail: 'lfernandez@maracaiboexpress.ve',
      companyName: 'Logística Maracaibo Express',
      planId: 'pro',
      planName: 'Pro',
      billingCycle: 'monthly',
      monthsCovered: 1,
      amount: 299,
      currency: 'USD',
      method: 'zelle',
      referenceCode: 'ZEL-772190',
      paidAt: '2026-11-25T18:00:00.000Z',
      status: 'pending_verification',
      notes: 'Comprobante enviado desde activar plan.',
    },
  ];
}

export function createInitialOfflineAuditLogs(): AdminAuditLogItem[] {
  return [
    {
      id: 'aud-demo-1',
      actorUserId: 'offline-admin',
      actorEmail: 'admin@tariffos.app',
      actorRole: 'super_admin',
      action: 'tenant.onboarded',
      targetType: 'tenant',
      targetId: 'ten-demo-1',
      tenantId: 'ten-demo-1',
      reason: 'Alta inicial de agencia piloto',
      beforeState: null,
      afterState: { planId: 'pro', billingStatus: 'ACTIVE' },
      createdAt: '2026-11-01T10:05:00.000Z',
    },
  ];
}
