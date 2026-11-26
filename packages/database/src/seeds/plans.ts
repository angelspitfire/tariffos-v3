import { SAAS_PLANS } from '@tariffos/shared-types';
import type { PrismaClient } from '../generated/client';

const LEGACY_HIDDEN_PLAN_SLUGS = ['trial', 'basico', 'profesional', 'pro', 'corporate'] as const;

export async function seedCommercialPlans(prisma: PrismaClient): Promise<number> {
  for (const plan of SAAS_PLANS) {
    const features = {
      displayName: plan.name,
      monthlyPriceUsd: plan.monthlyPriceUsd,
      annualPriceUsd: plan.annualPriceUsd,
      annualOnly: Boolean(plan.annualOnly),
      oneTimeOnly: Boolean(plan.oneTimeOnly),
      customPricing: Boolean(plan.customPricing),
      allowBatch: plan.allowBatch ?? true,
      ...(plan.creditableDays ? { creditableDays: plan.creditableDays } : {}),
      maxUsers: plan.maxUsers ?? 1,
      isPublic: plan.published,
      isArchived: false,
      items: plan.features,
      sortOrder: plan.sortOrder,
    };

    await prisma.plan.upsert({
      where: { name: plan.planId },
      update: {
        description: plan.description,
        maxClassifications: plan.monthlyQuota,
        classificationLimit: plan.monthlyQuota,
        basePrice: plan.annualOnly ? plan.annualPriceUsd : plan.monthlyPriceUsd,
        features,
      },
      create: {
        name: plan.planId,
        description: plan.description,
        maxClassifications: plan.monthlyQuota,
        classificationLimit: plan.monthlyQuota,
        basePrice: plan.annualOnly ? plan.annualPriceUsd : plan.monthlyPriceUsd,
        features,
      },
    });
  }

  for (const slug of LEGACY_HIDDEN_PLAN_SLUGS) {
    const existing = await prisma.plan.findUnique({
      where: { name: slug },
      select: { id: true, features: true },
    });
    if (!existing) continue;
    const prevFeatures =
      existing.features && typeof existing.features === 'object' && !Array.isArray(existing.features)
        ? (existing.features as Record<string, unknown>)
        : {};
    await prisma.plan.update({
      where: { id: existing.id },
      data: {
        features: {
          ...prevFeatures,
          isPublic: false,
        },
      },
    });
  }

  return SAAS_PLANS.length;
}
