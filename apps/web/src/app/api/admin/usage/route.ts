import { prisma } from '@tariffos/database';
import type { AdminUsageRow } from '@tariffos/shared-types';
import { extractPlanFeaturesMeta, requireAdmin } from '@/lib/admin/http-helpers';
import {
  computeAvgTokensPerClassification,
  estimateTokenCostUsd,
} from '@/lib/admin/llm-pricing';
import { getActiveLlmRuntimeConfig } from '@/lib/admin/llm-settings';
import { findOfflinePlan, getOfflineAdminState } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(request: Request): Promise<Response> {
  const guard = await requireAdmin('usage:read');
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const month = Number(searchParams.get('month')) || now.getMonth() + 1;
  const year = Number(searchParams.get('year')) || now.getFullYear();

  if (!isCloudModeEnabled()) {
    const rows: AdminUsageRow[] = getOfflineAdminState().tenants
      .map((t) => {
        const plan = findOfflinePlan(t.planId);
        const limit = t.billingLimit > 0 ? t.billingLimit : 100;
        const percentUsed = Math.round((t.usedThisMonth / limit) * 100);
        return {
          tenantId: t.id,
          tenantName: t.name,
          ownerEmail: t.ownerEmail,
          planName: plan?.displayName ?? t.planId ?? 'Sin plan',
          billingStatus: t.billingStatus,
          used: t.usedThisMonth,
          limit,
          percentUsed,
          nearLimit: percentUsed >= 80,
          inputTokens: t.inputTokensThisMonth,
          outputTokens: t.outputTokensThisMonth,
          avgTokensPerClassification: computeAvgTokensPerClassification(
            t.inputTokensThisMonth,
            t.outputTokensThisMonth,
            t.usedThisMonth,
          ),
          estimatedCostUsd: estimateTokenCostUsd(
            null,
            t.inputTokensThisMonth,
            t.outputTokensThisMonth,
          ),
          activeBatchJobs: t.activeBatchJobs,
          failedBatchJobs: t.failedBatchJobs,
        };
      })
      .sort((a, b) => b.percentUsed - a.percentUsed);

    return Response.json({ mode: 'offline', month, year, rows }, { status: 200 });
  }

  const runtimeConfig = await getActiveLlmRuntimeConfig().catch(() => null);
  const activeModelId = runtimeConfig?.model ?? null;

  const tenants = await prisma.tenant.findMany({
    include: {
      plan: { select: { name: true, classificationLimit: true, features: true } },
      usageRecords: { where: { month, year } },
      batchJobs: {
        where: { status: { in: ['PENDING', 'PROCESSING', 'FAILED'] } },
        select: { status: true },
      },
    },
  });

  const rows: AdminUsageRow[] = tenants
    .map((t) => {
      const usage = t.usageRecords[0];
      const used = usage?.count ?? 0;
      const meta = extractPlanFeaturesMeta(t.plan?.features);
      const isUnlimited = meta.unlimited || t.plan?.name === 'tariffos_internal';
      const limit = t.billingLimit > 0 ? t.billingLimit : (t.plan?.classificationLimit ?? 100);
      const percentUsed = isUnlimited ? 0 : limit > 0 ? Math.round((used / limit) * 100) : 0;
      const inputTokens = usage?.inputTokens ?? 0;
      const outputTokens = usage?.outputTokens ?? 0;
      return {
        tenantId: t.id,
        tenantName: t.name,
        ownerEmail: t.ownerEmail,
        planName: meta.displayName ?? t.plan?.name ?? 'Sin plan',
        billingStatus: t.billingStatus,
        used,
        limit,
        percentUsed,
        nearLimit: percentUsed >= 80,
        inputTokens,
        outputTokens,
        avgTokensPerClassification: computeAvgTokensPerClassification(inputTokens, outputTokens, used),
        estimatedCostUsd: estimateTokenCostUsd(activeModelId, inputTokens, outputTokens),
        activeBatchJobs: t.batchJobs.filter(
          (j) => j.status === 'PENDING' || j.status === 'PROCESSING',
        ).length,
        failedBatchJobs: t.batchJobs.filter((j) => j.status === 'FAILED').length,
      };
    })
    .sort((a, b) => b.percentUsed - a.percentUsed);

  return Response.json({ mode: 'cloud', month, year, rows }, { status: 200 });
}
