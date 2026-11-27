import {
  billingService,
  prisma,
  provisionInternalAdminWorkspace,
  type ProvisionInternalWorkspaceClient,
} from '@tariffos/database';
import type { ClassificationLinePayload } from '@tariffos/shared-types';
import { estimateTokenCostUsd } from '../admin/llm-pricing';
import { isSuperAdminUser } from '../admin/super-admin';

export interface CloudTenantContext {
  userId: string;
  userEmail: string | null;
  tenantId: string;
  role: string;
  isSuperAdmin?: boolean;
}

export type CloudAuthResult =
  | { ok: true; context: CloudTenantContext }
  | { ok: false; status: 401 | 403; error: string };

export async function resolveCloudTenantContext(): Promise<CloudAuthResult> {
  const { getAuthenticatedUser } = await import('../supabase/server');
  const user = await getAuthenticatedUser();
  if (!user) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }

  const [isSuperAdmin, membership] = await Promise.all([
    isSuperAdminUser({ userId: user.id, email: user.email }),
    prisma.membership.findFirst({
      where: { userId: user.id },
      select: { tenantId: true, role: true },
    }),
  ]);

  let tenantId = membership?.tenantId ?? null;
  let role = membership?.role ?? 'OWNER';

  if (!tenantId && isSuperAdmin) {
    const metaName = user.user_metadata?.full_name;
    const fullName =
      typeof metaName === 'string' && metaName.trim()
        ? metaName.trim()
        : (user.email?.split('@')[0] ?? 'Super Admin');
    const provisioned = await provisionInternalAdminWorkspace(
      prisma as unknown as ProvisionInternalWorkspaceClient,
      {
        userId: user.id,
        email: user.email ?? `${user.id}@tariffos.internal`,
        fullName,
        role: 'super_admin',
      },
    );
    tenantId = provisioned.tenantId;
    role = 'OWNER';
  }

  if (!tenantId) {
    return { ok: false, status: 403, error: 'No tenant membership found for user' };
  }

  return {
    ok: true,
    context: {
      userId: user.id,
      userEmail: user.email ?? null,
      tenantId,
      role,
      ...(isSuperAdmin ? { isSuperAdmin: true } : {}),
    },
  };
}

export async function checkTenantQuota(
  tenantId: string,
  options?: { requestedCount?: number; isBatch?: boolean; isSuperAdmin?: boolean },
) {
  if (options?.isSuperAdmin) {
    return { allowed: true };
  }
  const billingOptions =
    options?.requestedCount !== undefined || options?.isBatch !== undefined
      ? {
          ...(options.requestedCount !== undefined ? { requestedCount: options.requestedCount } : {}),
          ...(options.isBatch !== undefined ? { isBatch: options.isBatch } : {}),
        }
      : undefined;
  return billingService.checkBillingLimit(tenantId, billingOptions);
}

export function formatQuotaErrorResponse(
  reason = 'LIMIT_REACHED',
  options?: { isBatch?: boolean },
): {
  status: number;
  error: string;
  reason: string;
} {
  const status =
    reason === 'ACCOUNT_CANCELED' || reason === 'BATCH_NOT_IN_PLAN'
      ? 403
      : reason === 'QUOTA_CHECK_ERROR'
        ? 503
        : 402;
  const error =
    reason === 'ACCOUNT_CANCELED'
      ? 'Cuenta dada de baja. Contacta a soporte.'
      : reason === 'BATCH_NOT_IN_PLAN'
        ? 'Tu plan actual no incluye procesamiento masivo por lotes.'
        : reason === 'PAST_DUE'
          ? options?.isBatch
            ? 'Activa tu Piloto Operativo o Plan Agencia para procesar lotes.'
            : 'Activa tu Piloto Operativo o Plan Agencia para ejecutar clasificaciones.'
          : reason === 'QUOTA_CHECK_ERROR'
            ? options?.isBatch
              ? 'No pudimos verificar tu cuota en este momento. Intenta nuevamente.'
              : 'No pudimos validar tu cuota de servicio. Intenta nuevamente.'
            : options?.isBatch
              ? 'El tamaño del lote excede tu cuota disponible.'
              : 'Classification quota reached';
  return { status, error, reason };
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

  const inputTokens = line.tokenUsage?.inputTokens ?? 0;
  const outputTokens = line.tokenUsage?.outputTokens ?? 0;
  if (typeof billingService.recordUsageDelta === 'function') {
    await billingService.recordUsageDelta(tenantId, {
      count: 1,
      inputTokens,
      outputTokens,
    });
    return;
  }

  await billingService.incrementUsage(tenantId, 'classification', 1);
  if (
    (inputTokens > 0 || outputTokens > 0) &&
    typeof billingService.incrementTokenUsage === 'function'
  ) {
    await billingService.incrementTokenUsage(tenantId, inputTokens, outputTokens);
  }
}
