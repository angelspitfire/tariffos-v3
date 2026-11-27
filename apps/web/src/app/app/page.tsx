import { redirect } from 'next/navigation';
import { WorkspaceSplitShell } from '@/components/workspace/templates/WorkspaceSplitShell';
import { resolveCloudFunnelGateRedirect } from '@/lib/funnel/server-account-gate';

export const dynamic = 'force-dynamic';

export default async function WorkspaceAppPage() {
  const redirectTarget = await resolveCloudFunnelGateRedirect({
    route: 'app',
    hasFunnelPlanParam: false,
  });
  if (redirectTarget) {
    redirect(redirectTarget);
  }
  return <WorkspaceSplitShell />;
}
