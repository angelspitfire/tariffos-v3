import { SAAS_PLANS } from '@tariffos/shared-types';
import type { PrismaClient } from '../generated/client';

export async function seedCommercialPlans(prisma: PrismaClient): Promise<number> {
  for (const plan of SAAS_PLANS) {
    await prisma.plan.upsert({
      where: { name: plan.planId },
      update: {
        description: plan.description,
        maxClassifications: plan.monthlyQuota,
        classificationLimit: plan.monthlyQuota,
        basePrice: plan.annualOnly ? plan.annualPriceUsd : plan.monthlyPriceUsd,
        features: {
          displayName: plan.name,
          monthlyPriceUsd: plan.monthlyPriceUsd,
          annualPriceUsd: plan.annualPriceUsd,
          annualOnly: Boolean(plan.annualOnly),
          maxUsers: plan.maxUsers ?? 1,
          items: plan.features,
          sortOrder: plan.sortOrder,
        },
      },
      create: {
        name: plan.planId,
        description: plan.description,
        maxClassifications: plan.monthlyQuota,
        classificationLimit: plan.monthlyQuota,
        basePrice: plan.annualOnly ? plan.annualPriceUsd : plan.monthlyPriceUsd,
        features: {
          displayName: plan.name,
          monthlyPriceUsd: plan.monthlyPriceUsd,
          annualPriceUsd: plan.annualPriceUsd,
          annualOnly: Boolean(plan.annualOnly),
          maxUsers: plan.maxUsers ?? 1,
          items: plan.features,
          sortOrder: plan.sortOrder,
        },
      },
    });
  }
  return SAAS_PLANS.length;
}
