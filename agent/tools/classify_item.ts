import { defineTool, type ToolContext } from 'eve/tools';
import { z } from 'zod';
import type { A2UIEnvelope, ClassificationLinePayload } from '@tariffos/shared-types';
import { resolveToolTenantId } from '../lib/tenant-auth';

export { resolveToolTenantId };

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

export type ClassifyItemInput = z.infer<typeof ClassifyItemInputSchema>;

export interface ClassifyItemOutput {
  line: ClassificationLinePayload;
  envelope: A2UIEnvelope;
}

export default defineTool({
  description:
    'Run the full TariffOS classification pipeline (Compliance Pre-Gate, Tier 0 SKU cache, RGI 1-6 reasoning, official DB verification, deterministic duties, and A2UIEnvelope) using server-derived tenant credentials.',
  inputSchema: ClassifyItemInputSchema,
  async execute(input: ClassifyItemInput, ctx: ToolContext): Promise<ClassifyItemOutput | null> {
    const [
      { classifyInvoiceBatch, mapPayloadToA2UIEnvelope },
      { isCloudModeEnabled },
    ] = await Promise.all([
      import('@tariffos/agent'),
      import('../../apps/web/src/lib/runtime-config'),
    ]);
    const tenantId = await resolveToolTenantId(ctx.session.auth);

    const item = {
      lineId: input.lineId,
      sku: input.sku,
      description: input.description,
      originCountry: input.originCountry,
      cifValue: input.cifValue,
    };

    const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());
    let line = null;

    if (isCloudModeEnabled() && tenantId !== 'eve-local-dev') {
      const { runAuthorizedClassificationLine } = await import(
        '../../apps/web/src/lib/agent/authorized-classify'
      );
      const authorized = await runAuthorizedClassificationLine({
        tenantId,
        userId: ctx.session.auth?.current?.principalId,
        countryCode: input.countryCode,
        item,
        queryForAudit: input.description,
        deepMode: input.deepMode,
      });
      line = authorized.line;
    } else if (hasDatabase) {
      const [
        { createPrismaPipelinePorts },
        { getActiveLlmRuntimeConfig, toRgiLlmRuntimeOverride },
      ] = await Promise.all([
        import('../../apps/web/src/lib/agent/prisma-ports'),
        import('../../apps/web/src/lib/admin/llm-settings'),
      ]);
      const runtimeLlm = await getActiveLlmRuntimeConfig();
      const ports = createPrismaPipelinePorts(toRgiLlmRuntimeOverride(runtimeLlm));
      const result = await classifyInvoiceBatch([item], ports, {
        tenantId,
        countryCode: input.countryCode,
        deepMode: input.deepMode,
      });
      line = result.lines[0] ?? null;
    } else {
      const { classifyItemOffline } = await import('../../apps/web/src/lib/agent/offline-classifier');
      line = classifyItemOffline(item);
    }

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
  label: {
    start: ({ description }) =>
      `Clasificando mercancía (RGI 1→6): ${description.slice(0, 40)}`,
    complete: (_input, output) =>
      output?.line?.hsCode
        ? `Clasificación completada (${output.line.hsCode})`
        : 'Clasificación completada',
  },
  toModelOutput(output) {
    if (!output) {
      return { type: 'error-text', value: 'No se pudo generar un dictamen para esta mercancía.' };
    }
    const verdict = output.envelope.inlineComponents.find((c) => c.type === 'verdict');
    const dossier = output.envelope.canvasComponents.find((c) => c.type === 'dossier');
    return {
      type: 'json',
      value: {
        status: output.envelope.classificationStatus,
        hsCode: verdict?.hsCode ?? output.line.hsCode,
        description: verdict?.description ?? output.line.officialDescription,
        confidencePct: output.line.confidencePct,
        confidenceLabel: verdict?.confidenceLabel ?? output.line.confidenceLevel,
        adValoremPercent: verdict?.adValoremPercent,
        vatPercent: verdict?.vatPercent,
        legalRegimeCode: verdict?.legalRegimeCode,
        permits: dossier?.permits ?? [],
        reviewStatus: dossier?.reviewStatus,
      },
    };
  },
});
