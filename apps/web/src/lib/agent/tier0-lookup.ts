import { prisma } from '@tariffos/database';
import type { SkuPrecedentRecord } from '@tariffos/agent';

/**
 * Looks up an active custom classification rule (preferring tenant-specific rules
 * over `GLOBAL`) or a previously approved `ProductMaster` entry by description or SKU.
 */
export async function findTenantSkuPrecedent(
  tenantId: string,
  skuOrDesc: string,
): Promise<SkuPrecedentRecord | null> {
  const trimmed = skuOrDesc.trim();
  if (!trimmed) return null;

  const rules = await prisma.customClassificationRule.findMany({
    where: {
      isActive: true,
      tenantId: { in: [tenantId, 'GLOBAL'] },
      inputDescription: { equals: trimmed, mode: 'insensitive' },
    },
    take: 2,
  });

  const matchedRule = rules.find((rule) => rule.tenantId === tenantId) ?? rules[0];
  if (matchedRule) {
    return {
      hsCode: matchedRule.targetHsCode,
      officialDescription: matchedRule.inputDescription,
      confidencePct: Math.round(matchedRule.confidence * 100),
      approvedByBroker: true,
    };
  }

  const product = await prisma.productMaster.findFirst({
    where: {
      tenantId,
      OR: [
        { description: { equals: trimmed, mode: 'insensitive' } },
        { metadata: { path: ['sku'], equals: trimmed } },
      ],
    },
  });
  if (!product?.hsCode) return null;

  return {
    hsCode: product.hsCode,
    officialDescription: product.description,
    confidencePct: Math.round((product.confidence ?? 0.98) * 100),
    approvedByBroker: true,
  };
}
