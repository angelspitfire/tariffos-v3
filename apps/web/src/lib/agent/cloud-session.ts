import { billingService, prisma } from '@tariffos/database';
import type { ClassificationLinePayload } from '@tariffos/shared-types';
import { estimateTokenCostUsd } from '@/lib/admin/llm-pricing';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export interface CloudTenantContext {
  userId: string;
  userEmail: string | null;
  tenantId: string;
  role: string;
}

export type CloudAuthResult =
  | { ok: true; context: CloudTenantContext }
  | { ok: false; status: 401 | 403; error: string };

export async function resolveCloudTenantContext(): Promise<CloudAuthResult> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    select: { tenantId: true, role: true },
  });

  if (!membership?.tenantId) {
    return { ok: false, status: 403, error: 'No tenant membership found for user' };
  }

  return {
    ok: true,
    context: {
      userId: user.id,
      userEmail: user.email ?? null,
      tenantId: membership.tenantId,
      role: membership.role,
    },
  };
}

export async function checkTenantQuota(
  tenantId: string,
  options?: { requestedCount?: number; isBatch?: boolean },
) {
  return billingService.checkBillingLimit(tenantId, options);
}

export async function persistClassificationOutcome(
  tenantId: string,
  line: ClassificationLinePayload,
  query: string,
  provider?: string,
): Promise<void> {
  const classificationId = `cls_${Date.now()}_${line.lineId}`;

  try {
    await prisma.decisionArtifact.create({
      data: {
        classificationId,
        tenantId,
        lineId: line.lineId,
        retrievalTrace: { query, tierUsed: line.tierUsed },
        promptSnapshot: { query },
        modelMetadata: {
          modelUsed: line.modelUsed,
          provider: provider ?? 'env',
          verifiedAgainstDb: line.verifiedAgainstDb,
          tokenUsage: line.tokenUsage ?? null,
          estimatedCostUsd: line.tokenUsage
            ? estimateTokenCostUsd(
                line.modelUsed,
                line.tokenUsage.inputTokens,
                line.tokenUsage.outputTokens,
              )
            : 0,
        },
        rerankingScores: { confidencePct: line.confidencePct, confidenceLevel: line.confidenceLevel },
        sustento: { rgiSteps: line.rgiSteps, flags: line.flags },
        finalDecision: {
          hsCode: line.hsCode,
          officialDescription: line.officialDescription,
          duties: line.duties,
        },
      },
    });
  } catch (err) {
    console.warn('[classify-stream] Skipping DecisionArtifact persistence:', err);
  }

  await billingService.incrementUsage(tenantId, 'classification', 1);
  if (
    line.tokenUsage &&
    (line.tokenUsage.inputTokens > 0 || line.tokenUsage.outputTokens > 0) &&
    typeof billingService.incrementTokenUsage === 'function'
  ) {
    await billingService.incrementTokenUsage(
      tenantId,
      line.tokenUsage.inputTokens,
      line.tokenUsage.outputTokens,
    );
  }
}
