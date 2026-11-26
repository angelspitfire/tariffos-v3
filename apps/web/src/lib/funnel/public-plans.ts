import { prisma } from '@tariffos/database';
import {
  DEFAULT_PAYMENT_INSTRUCTIONS,
  SAAS_PLANS,
  type SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import { extractPlanFeaturesMeta } from '@/lib/admin/http-helpers';
import { getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

function buildSortOrder(slug: string, fallbackIdx: number): number {
  const staticIdx = SAAS_PLANS.findIndex((p) => p.planId === slug);
  return staticIdx >= 0 ? staticIdx + 1 : 100 + fallbackIdx;
}

export async function loadPublicPlans(): Promise<SubscriptionPlanConfig[]> {
  if (!isCloudModeEnabled()) {
    return getOfflineAdminState()
      .plans.filter((p) => p.isPublic && !p.isArchived)
      .map((p, idx) => ({
        planId: p.name,
        name: p.displayName,
        description: p.description ?? '',
        monthlyPriceUsd: p.annualOnly ? 0 : p.basePrice,
        annualPriceUsd: p.annualPriceUsd,
        annualOnly: p.annualOnly,
        maxUsers: p.maxUsers,
        currency: 'USD' as const,
        monthlyQuota: p.classificationLimit,
        features: p.features,
        paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
        published: true,
        sortOrder: buildSortOrder(p.name, idx),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  try {
    const rows = await prisma.plan.findMany({ orderBy: { basePrice: 'asc' } });
    const mapped: SubscriptionPlanConfig[] = [];
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const meta = extractPlanFeaturesMeta(row.features);
      if (!meta.isPublic || meta.isArchived) continue;
      const fallback = SAAS_PLANS.find((p) => p.planId === row.name);
      mapped.push({
        planId: row.name,
        name: meta.displayName ?? fallback?.name ?? row.name,
        description: row.description ?? fallback?.description ?? '',
        monthlyPriceUsd: meta.annualOnly ? 0 : row.basePrice,
        annualPriceUsd: meta.annualPriceUsd ?? fallback?.annualPriceUsd ?? (meta.customPricing || meta.oneTimeOnly ? 0 : row.basePrice * 10),
        annualOnly: meta.annualOnly || Boolean(fallback?.annualOnly),
        oneTimeOnly: meta.oneTimeOnly || Boolean(fallback?.oneTimeOnly),
        customPricing: meta.customPricing || Boolean(fallback?.customPricing),
        allowBatch: meta.allowBatch,
        creditableDays: meta.creditableDays ?? fallback?.creditableDays,
        maxUsers: meta.maxUsers || fallback?.maxUsers || 1,
        currency: 'USD',
        monthlyQuota: row.classificationLimit,
        features: meta.items.length > 0 ? meta.items : [...(fallback?.features ?? [])],
        paymentInstructions: fallback?.paymentInstructions ?? DEFAULT_PAYMENT_INSTRUCTIONS,
        published: true,
        sortOrder: buildSortOrder(row.name, i),
      });
    }
    if (mapped.length === 0) return [...SAAS_PLANS];
    return mapped.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (err: unknown) {
    console.warn('[loadPublicPlans] Falling back to static SAAS_PLANS:', err);
    return [...SAAS_PLANS];
  }
}
