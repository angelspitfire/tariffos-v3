import {
  SUPPORTED_LIVE_COUNTRIES,
  classifyInvoiceBatch,
  isSupportedLiveCountry,
  type InvoiceItemInput,
} from '@tariffos/agent';
import type { ClassificationLinePayload, StreamProgressEvent } from '@tariffos/shared-types';
import { getActiveLlmRuntimeConfig, toRgiLlmRuntimeOverride } from '../admin/llm-settings';
import { isSuperAdminUser } from '../admin/super-admin';
import {
  checkTenantQuota,
  formatQuotaErrorResponse,
  persistClassificationOutcome,
} from './cloud-session';
import { createPrismaPipelinePorts } from './prisma-ports';

export class AuthorizedClassificationError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'AuthorizedClassificationError';
    this.status = status;
    this.code = code;
  }
}

export interface RunAuthorizedClassificationParams {
  tenantId: string;
  userId?: string;
  isSuperAdmin?: boolean;
  countryCode: string;
  item: InvoiceItemInput;
  queryForAudit: string;
  deepMode?: boolean;
  onProgress?: (event: StreamProgressEvent) => void;
}

export interface RunAuthorizedClassificationResult {
  line: ClassificationLinePayload;
  provider: string;
}

/**
 * Single cloud classification seam enforcing country availability, tenant quota,
 * active DB LLM runtime override, pipeline execution, and DecisionArtifact/usage persistence.
 */
export async function runAuthorizedClassificationLine(
  params: RunAuthorizedClassificationParams,
): Promise<RunAuthorizedClassificationResult> {
  if (!isSupportedLiveCountry(params.countryCode)) {
    throw new AuthorizedClassificationError(
      `La jurisdicción ${params.countryCode} aún no tiene arancel cargado en modo Cloud. Disponible actualmente: ${SUPPORTED_LIVE_COUNTRIES.join(', ')}.`,
      422,
      'UNSUPPORTED_COUNTRY',
    );
  }

  const bypassQuota =
    Boolean(params.isSuperAdmin) ||
    (params.userId ? await isSuperAdminUser({ userId: params.userId }) : false);
  if (!bypassQuota) {
    const quota = await checkTenantQuota(params.tenantId);
    if (!quota.allowed) {
      const formatted = formatQuotaErrorResponse(quota.reason);
      throw new AuthorizedClassificationError(formatted.error, formatted.status, formatted.reason);
    }
  }

  const runtimeLlm = await getActiveLlmRuntimeConfig();
  const ports = createPrismaPipelinePorts(toRgiLlmRuntimeOverride(runtimeLlm));

  const batch = await classifyInvoiceBatch([params.item], ports, {
    tenantId: params.tenantId,
    countryCode: params.countryCode,
    deepMode: params.deepMode,
    onProgress: params.onProgress,
  });

  const line = batch.lines[0];
  if (!line) {
    throw new AuthorizedClassificationError(
      'Live classification pipeline returned no result line.',
      500,
      'EMPTY_PIPELINE_RESULT',
    );
  }

  await persistClassificationOutcome(
    params.tenantId,
    line,
    params.queryForAudit,
    runtimeLlm.provider,
  );

  return { line, provider: runtimeLlm.provider };
}
