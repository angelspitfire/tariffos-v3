import { AUTO_APPROVE_CONFIDENCE_THRESHOLD } from '@tariffos/agent';
import { billingService, prisma } from '@tariffos/database';
import type { ClassificationLinePayload } from '@tariffos/shared-types';

/** Maps a classification line outcome into DB FilingLine status. */
export function mapLineStatus(line: ClassificationLinePayload): 'AUTO' | 'CONFIRM' | 'BLOCKED' {
  if (line.tierUsed === 'pre_gate_blocked' || line.flags.some((f) => f.type === 'blocking')) {
    return 'BLOCKED';
  }
  return line.confidencePct >= AUTO_APPROVE_CONFIDENCE_THRESHOLD && line.verifiedAgainstDb
    ? 'AUTO'
    : 'CONFIRM';
}

/** Upserts classified batch lines, increments tenant usage, and completes the parent Filing. */
export async function persistFilingLinesAndUsage(params: {
  filingId: string;
  tenantId: string;
  lines: readonly ClassificationLinePayload[];
}): Promise<{ persisted: number }> {
  const { filingId, tenantId, lines } = params;
  if (!process.env.DATABASE_URL) return { persisted: 0 };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    await prisma.filingLine.upsert({
      where: { filingId_lineNumber: { filingId, lineNumber: i + 1 } },
      update: {
        description: line.product,
        hsCode: line.hsCode,
        confidence: line.confidencePct / 100,
        status: mapLineStatus(line),
        cifValue: line.duties.cif,
        taxBreakdown: line.duties,
        rgiSteps: line.rgiSteps,
        candidates: line.alternatives,
        rawResult: line,
      },
      create: {
        tenantId,
        filingId,
        lineNumber: i + 1,
        description: line.product,
        hsCode: line.hsCode,
        confidence: line.confidencePct / 100,
        status: mapLineStatus(line),
        cifValue: line.duties.cif,
        taxBreakdown: line.duties,
        rgiSteps: line.rgiSteps,
        candidates: line.alternatives,
        rawResult: line,
      },
    });
  }

  if (lines.length > 0) {
    await billingService.incrementUsage(tenantId, 'classification', lines.length);
    const totalInput = lines.reduce((sum, line) => sum + (line.tokenUsage?.inputTokens ?? 0), 0);
    const totalOutput = lines.reduce((sum, line) => sum + (line.tokenUsage?.outputTokens ?? 0), 0);
    if (
      (totalInput > 0 || totalOutput > 0) &&
      typeof billingService.incrementTokenUsage === 'function'
    ) {
      await billingService.incrementTokenUsage(tenantId, totalInput, totalOutput);
    }
  }

  await prisma.filing.updateMany({
    where: { id: filingId, tenantId },
    data: { status: 'Completed' },
  });

  return { persisted: lines.length };
}
