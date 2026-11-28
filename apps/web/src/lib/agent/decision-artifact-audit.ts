import { createHash } from 'node:crypto';
import { billingService, prisma } from '@tariffos/database';
import type { AuditArtifactMeta, ClassificationLinePayload } from '@tariffos/shared-types';
import { estimateTokenCostUsd } from '../admin/llm-pricing';

export interface PersistClassificationAuditOptions {
  classificationId?: string;
  userId?: string;
  countryCode?: string;
  sourceSha256?: string;
}

/** Computes a deterministic SHA-256 hex digest for source files or raw classification payloads. */
export function computeSourceSha256(content: string | Uint8Array): string {
  return createHash('sha256').update(content).digest('hex');
}

export async function persistClassificationOutcome(
  tenantId: string,
  line: ClassificationLinePayload,
  query: string,
  provider?: string,
  auditOptions?: PersistClassificationAuditOptions,
): Promise<AuditArtifactMeta | undefined> {
  const classificationId =
    auditOptions?.classificationId ?? `cls_${Date.now()}_${line.lineId}`;
  const sourceSha256 = auditOptions?.sourceSha256 ?? computeSourceSha256(query);
  let auditMeta: AuditArtifactMeta | undefined;

  try {
    const artifactDelegate = prisma.decisionArtifact as typeof prisma.decisionArtifact & {
      count?: (args: { where: { classificationId: string } }) => Promise<number>;
    };
    const countryDelegate = (
      prisma as unknown as {
        country?: {
          findUnique?: (args: {
            where: { code: string };
            select: { datasetVersion: true };
          }) => Promise<{ datasetVersion: string | null } | null>;
        };
      }
    ).country;

    const [priorCount, countryRow] = await Promise.all([
      typeof artifactDelegate.count === 'function'
        ? artifactDelegate.count({ where: { classificationId } })
        : Promise.resolve(0),
      auditOptions?.countryCode && typeof countryDelegate?.findUnique === 'function'
        ? countryDelegate.findUnique({
            where: { code: auditOptions.countryCode },
            select: { datasetVersion: true },
          })
        : Promise.resolve(null),
    ]);

    const version = priorCount + 1;
    const datasetVersion = countryRow?.datasetVersion ?? undefined;

    const created = await prisma.decisionArtifact.create({
      data: {
        classificationId,
        tenantId,
        lineId: line.lineId,
        ...(auditOptions?.userId ? { userId: auditOptions.userId } : {}),
        sourceSha256,
        ...(datasetVersion ? { datasetVersion } : {}),
        version,
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
        rerankingScores: {
          confidencePct: line.confidencePct,
          confidenceLevel: line.confidenceLevel,
        },
        sustento: { rgiSteps: line.rgiSteps, flags: line.flags },
        finalDecision: {
          hsCode: line.hsCode,
          officialDescription: line.officialDescription,
          duties: line.duties,
        },
      },
    });

    auditMeta = {
      ...(created?.id ? { artifactId: created.id } : {}),
      version,
      ...(datasetVersion ? { datasetVersion } : {}),
      sourceSha256,
    };
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
    return auditMeta;
  }

  if (typeof billingService.incrementUsage === 'function') {
    await billingService.incrementUsage(tenantId, 'classification', 1);
  }
  if (
    (inputTokens > 0 || outputTokens > 0) &&
    typeof billingService.incrementTokenUsage === 'function'
  ) {
    await billingService.incrementTokenUsage(tenantId, inputTokens, outputTokens);
  }

  return auditMeta;
}
