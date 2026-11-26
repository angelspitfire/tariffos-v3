import { mapBatchToA2UIEnvelope, type BatchPipelineResult } from '@tariffos/agent';
import { prisma } from '@tariffos/database';
import {
  ClassificationLinePayloadSchema,
  type ClassificationLinePayload,
} from '@tariffos/shared-types';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import { buildBatchSummary } from '@/lib/inngest/batch-helpers';
import { isCloudModeEnabled } from '@/lib/runtime-config';

function toPipelineResult(lines: ClassificationLinePayload[]): BatchPipelineResult {
  let blockedByPreGate = 0;
  let tier0Hits = 0;
  let tier1Hits = 0;
  let tier2Hits = 0;

  for (const line of lines) {
    if (line.tierUsed === 'pre_gate_blocked') blockedByPreGate += 1;
    else if (line.tierUsed === 'tier0_sku') tier0Hits += 1;
    else if (line.tierUsed === 'tier1_fast') tier1Hits += 1;
    else tier2Hits += 1;
  }

  return {
    lines,
    stats: {
      totalLines: lines.length,
      uniqueItems: lines.length,
      blockedByPreGate,
      tier0Hits,
      tier1Hits,
      tier2Hits,
      webGroundingUsed: 0,
    },
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ filingId: string }> },
): Promise<Response> {
  if (!isCloudModeEnabled()) {
    return Response.json({ error: 'Batch polling requires cloud mode.' }, { status: 400 });
  }

  const auth = await resolveCloudTenantContext();
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { filingId } = await context.params;
  const filing = await prisma.filing.findFirst({
    where: { id: filingId, tenantId: auth.context.tenantId },
    select: {
      id: true,
      referenceId: true,
      status: true,
      lines: {
        orderBy: { lineNumber: 'asc' },
        select: { rawResult: true },
      },
    },
  });

  if (!filing) {
    return Response.json({ error: 'Expediente no encontrado.' }, { status: 404 });
  }

  const parsedLines: ClassificationLinePayload[] = [];
  for (const row of filing.lines) {
    const parsed = ClassificationLinePayloadSchema.safeParse(row.rawResult);
    if (parsed.success) parsedLines.push(parsed.data);
  }

  if (filing.status !== 'Completed' || parsedLines.length === 0) {
    return Response.json({
      filingId: filing.id,
      status: filing.status ?? 'In progress',
      totalLines: parsedLines.length,
      summary: null,
      envelope: null,
    });
  }

  const summary = buildBatchSummary(parsedLines);
  const envelope = mapBatchToA2UIEnvelope(toPipelineResult(parsedLines), {
    id: filing.id,
    title: filing.referenceId ? `Lote: ${filing.referenceId}` : 'Manifiesto de Clasificación en Lote',
    documentReference: filing.referenceId ?? filing.id,
  });

  return Response.json({
    filingId: filing.id,
    status: filing.status,
    totalLines: parsedLines.length,
    summary,
    envelope,
  });
}
