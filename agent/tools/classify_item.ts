import { defineTool } from 'eve/tools';
import { z } from 'zod';

const IncotermSchema = z.enum(['EXW', 'FOB', 'CFR', 'CIF', 'DDP']);

export const ClassifyItemInputSchema = z.object({
  countryCode: z.string().default('VE'),
  lineId: z.string().default('interactive-1'),
  sku: z.string().optional(),
  description: z.string().min(2),
  originCountry: z.string().default('CN'),
  cifValue: z.number().nonnegative().default(0),
  incoterm: IncotermSchema.default('FOB'),
  deepMode: z.boolean().default(false),
});

interface MinimalSessionAuth {
  readonly current: {
    readonly principalId: string;
    readonly authenticator: string;
  } | null;
}

/**
 * Resolves `tenantId` exclusively from the authenticated Eve session (`ctx.session.auth`),
 * never from LLM tool arguments.
 */
export async function resolveToolTenantId(
  auth: MinimalSessionAuth | undefined,
): Promise<string> {
  const principal = auth?.current ?? null;
  if (!principal) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Unauthorized: authenticated session required');
    }
    return 'eve-local-dev';
  }

  if (principal.authenticator === 'local-dev') {
    return 'eve-local-dev';
  }

  const { prisma } = await import('@tariffos/database');
  const membership = await prisma.membership.findFirst({
    where: { userId: principal.principalId },
    select: { tenantId: true },
  });
  if (!membership?.tenantId) {
    throw new Error('Unauthorized: no tenant membership for authenticated user');
  }
  return membership.tenantId;
}

export default defineTool({
  description:
    'Run the full TariffOS classification pipeline (Compliance Pre-Gate, Tier 0 SKU cache, RGI 1-6 reasoning, official DB verification, deterministic duties, and A2UIEnvelope) using server-derived tenant credentials.',
  inputSchema: ClassifyItemInputSchema,
  async execute(input, ctx) {
    const [{ classifyInvoiceBatch, mapPayloadToA2UIEnvelope }, { createPrismaPipelinePorts }] =
      await Promise.all([
        import('@tariffos/agent'),
        import('../../apps/web/src/lib/agent/prisma-ports'),
      ]);
    const tenantId = await resolveToolTenantId(ctx.session.auth);
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
        tenantId,
        countryCode: input.countryCode,
        deepMode: input.deepMode,
      },
    );

    const line = result.lines[0] ?? null;
    if (!line) return null;

    return {
      line,
      envelope: mapPayloadToA2UIEnvelope(line, {
        jurisdictionName:
          input.countryCode === 'VE' ? 'Venezuela (SENIAT — Decreto 4.944)' : input.countryCode,
        incoterm: input.incoterm,
        includeCalculator: input.cifValue > 0,
        reasoningDepth: input.deepMode ? 'deep' : 'standard',
      }),
    };
  },
});
