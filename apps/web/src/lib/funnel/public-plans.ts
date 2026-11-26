import { prisma } from '@tariffos/database';
import {
  DEFAULT_PAYMENT_INSTRUCTIONS,
  SAAS_PLANS,
  type SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import { extractPlanFeaturesMeta } from '@/lib/admin/http-helpers';
import { getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

function buildSortOrder(
  slug: string,
  fallbackIdx: number,
  options?: { isCustomPricing?: boolean; metaSortOrder?: number },
): number {
  if (slug === 'corporate') return 2000 + fallbackIdx;
  if (options?.isCustomPricing) return 1000 + fallbackIdx;
  if (typeof options?.metaSortOrder === 'number') return options.metaSortOrder;
  const staticIdx = SAAS_PLANS.findIndex((p) => p.planId === slug);
  return staticIdx >= 0 ? staticIdx + 1 : 100 + fallbackIdx;
}

export async function loadPublicPlans(): Promise<SubscriptionPlanConfig[]> {
  if (!isCloudModeEnabled()) {
    return getOfflineAdminState()
      .plans.filter((p) => p.isPublic && !p.isArchived)
      .map((p, idx) => {
        const fallback = SAAS_PLANS.find((s) => s.planId === p.name);
        const hasPrice = p.basePrice > 0 || p.annualPriceUsd > 0;
        const customPricing =
          p.name === 'corporate' || (!hasPrice && Boolean(fallback?.customPricing));
        const annualOnly = p.annualOnly || (p.name === 'enterprise' && hasPrice);
        return {
          planId: p.name,
          name: p.displayName,
          description: p.description ?? '',
          monthlyPriceUsd: annualOnly || customPricing ? 0 : p.basePrice,
          annualPriceUsd: customPricing ? 0 : p.annualPriceUsd,
          annualOnly,
          oneTimeOnly: Boolean(fallback?.oneTimeOnly),
          customPricing,
          maxUsers: p.maxUsers,
          currency: 'USD' as const,
          monthlyQuota: p.classificationLimit,
          features: p.features,
          paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
          published: true,
          sortOrder: buildSortOrder(p.name, idx, { isCustomPricing: customPricing }),
        };
      })
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
      const hasDbPrice = row.basePrice > 0 || (meta.annualPriceUsd ?? 0) > 0;
      const customPricing =
        row.name === 'corporate' ||
        meta.customPricing ||
        (!hasDbPrice && Boolean(fallback?.customPricing));
      const annualOnly =
        meta.annualOnly ||
        Boolean(fallback?.annualOnly) ||
        (row.name === 'enterprise' && hasDbPrice && !customPricing);
      mapped.push({
        planId: row.name,
        name: meta.displayName ?? fallback?.name ?? row.name,
        description: row.description ?? fallback?.description ?? '',
        monthlyPriceUsd: annualOnly || customPricing ? 0 : row.basePrice,
        annualPriceUsd: customPricing
          ? 0
          : (meta.annualPriceUsd ??
            fallback?.annualPriceUsd ??
            (meta.oneTimeOnly ? 0 : row.basePrice * 10)),
        annualOnly,
        oneTimeOnly: meta.oneTimeOnly || Boolean(fallback?.oneTimeOnly),
        customPricing,
        allowBatch: meta.allowBatch,
        creditableDays: meta.creditableDays ?? fallback?.creditableDays,
        maxUsers: meta.maxUsers || fallback?.maxUsers || 1,
        currency: 'USD',
        monthlyQuota: row.classificationLimit,
        features: meta.items.length > 0 ? meta.items : [...(fallback?.features ?? [])],
        paymentInstructions: fallback?.paymentInstructions ?? DEFAULT_PAYMENT_INSTRUCTIONS,
        published: true,
        sortOrder: buildSortOrder(row.name, i, {
          isCustomPricing: customPricing,
          metaSortOrder: meta.sortOrder,
        }),
      });
    }
    if (mapped.length === 0) return [...SAAS_PLANS];
    return mapped.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (err: unknown) {
    console.warn('[loadPublicPlans] Falling back to static SAAS_PLANS:', err);
    return [...SAAS_PLANS];
  }
}
