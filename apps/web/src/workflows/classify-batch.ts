import { classifyInvoiceBatch, type InvoiceItemInput } from '@tariffos/agent';
import { createPrismaPipelinePorts } from '@/lib/agent/prisma-ports';

export interface ClassifyBatchWorkflowInput {
  filingId: string;
  tenantId: string;
  countryCode: string;
  deepMode: boolean;
  items: InvoiceItemInput[];
}

/**
 * Durable batch classification workflow (Vercel Workflows compatible).
 * Add `"use workflow"` / `"use step"` directives when deploying with Workflow SDK.
 */
export async function classifyBatchWorkflow(input: ClassifyBatchWorkflowInput) {
  const ports = createPrismaPipelinePorts();
  return classifyInvoiceBatch(input.items, ports, {
    tenantId: input.tenantId,
    countryCode: input.countryCode,
    deepMode: input.deepMode,
  });
}
