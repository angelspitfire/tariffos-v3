import { getClientSubscriptionToken } from 'inngest/react';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import { batchChannel } from '@/lib/inngest/channels';
import { inngest } from '@/lib/inngest/client';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { prisma } from '@tariffos/database';

export async function POST(
  _request: Request,
  context: { params: Promise<{ filingId: string }> },
): Promise<Response> {
  if (!isCloudModeEnabled()) {
    return Response.json(
      { error: 'Realtime subscription tokens require cloud mode.' },
      { status: 400 },
    );
  }

  const auth = await resolveCloudTenantContext();
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { filingId } = await context.params;
  const ownedFiling = await prisma.filing.findFirst({
    where: { id: filingId, tenantId: auth.context.tenantId },
    select: { id: true },
  });

  if (!ownedFiling) {
    return Response.json({ error: 'Expediente no encontrado.' }, { status: 404 });
  }

  const token = await getClientSubscriptionToken(inngest, {
    channel: batchChannel(filingId),
    topics: ['progress'],
  });

  return Response.json({ token });
}
