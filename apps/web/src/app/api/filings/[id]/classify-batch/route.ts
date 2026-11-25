import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUserId } from '@/lib/supabase/server';
import { classifyBatchWorkflow } from '@/workflows/classify-batch';

const BatchRequestSchema = z.object({
  tenantId: z.string().min(1),
  countryCode: z.string().default('VE'),
  deepMode: z.boolean().default(false),
  items: z.array(
    z.object({
      lineId: z.string().min(1),
      sku: z.string().optional(),
      description: z.string().min(1),
      originCountry: z.string().default('CN'),
      cifValue: z.number().nonnegative(),
      quantity: z.number().positive().optional(),
      unit: z.string().optional(),
    }),
  ).min(1),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: filingId } = await context.params;
  const parsed = BatchRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await classifyBatchWorkflow({
    filingId,
    tenantId: parsed.data.tenantId,
    countryCode: parsed.data.countryCode,
    deepMode: parsed.data.deepMode,
    items: parsed.data.items,
  });

  return NextResponse.json(result);
}
