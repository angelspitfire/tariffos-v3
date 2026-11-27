export interface MinimalSessionAuth {
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
