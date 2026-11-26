import { defineTool } from 'eve/tools';
import { z } from 'zod';

export default defineTool({
  description: 'Run the full TariffOS classification pipeline (Compliance Pre-Gate, Tier 0 SKU cache, RGI 1-6 reasoning, official DB verification, and deterministic duties).',
  inputSchema: z.object({
    tenantId: z.string().min(1),
    countryCode: z.string().default('VE'),
    lineId: z.string().default('interactive-1'),
    sku: z.string().optional(),
    description: z.string().min(2),
    originCountry: z.string().default('CN'),
    cifValue: z.number().nonnegative().default(0),
    deepMode: z.boolean().default(false),
  }),
  async execute(input) {
    const [{ classifyInvoiceBatch }, { createPrismaPipelinePorts }] = await Promise.all([
      import('@tariffos/agent'),
      import('../../apps/web/src/lib/agent/prisma-ports'),
    ]);
    const ports = createPrismaPipelinePorts();
    const result = await classifyInvoiceBatch(
      [
        {
          lineId: input.lineId,
          sku: input.sku,
          description: input.description,
          originCountry: input.originCountry,
          cifValue: input.cifValue,
        },
      ],
      ports,
      {
        tenantId: input.tenantId,
        countryCode: input.countryCode,
        deepMode: input.deepMode,
      },
    );

    return result.lines[0] ?? null;
  },
});
