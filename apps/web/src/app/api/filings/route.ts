import { NextResponse } from 'next/server';
import { prisma } from '@tariffos/database';
import { z } from 'zod';
import { getAuthenticatedUserId } from '@/lib/supabase/server';

const CreateFilingSchema = z.object({
  tenantId: z.string().min(1),
  referenceId: z.string().min(1),
});

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');
  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
  }

  const filings = await prisma.filing.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ filings });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = CreateFilingSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }

  const filing = await prisma.filing.create({
    data: {
      tenantId: body.data.tenantId,
      referenceId: body.data.referenceId,
      status: 'Draft',
    },
  });

  return NextResponse.json({ filing }, { status: 201 });
}
