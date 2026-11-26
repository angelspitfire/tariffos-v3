import { prisma } from '@tariffos/database';
import type { SkuPrecedentRecord } from '@tariffos/agent';
import { searchProductMasterSemantic } from './product-master-embedding';

/**
 * Looks up an active custom classification rule (preferring tenant-specific rules
 * over `GLOBAL`), exact `ProductMaster` match (description or SKU), or high-confidence
 * semantic `ProductMaster.embedding` match (`>= 0.94` cosine similarity).
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
  if (product?.hsCode) {
    return {
      hsCode: product.hsCode,
      officialDescription: product.description,
      confidencePct: Math.round((product.confidence ?? 0.98) * 100),
      approvedByBroker: true,
    };
  }

  return searchProductMasterSemantic(tenantId, trimmed);
}
