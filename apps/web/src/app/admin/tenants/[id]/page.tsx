import { TenantControlPanel } from '@/components/admin/organisms/TenantControlPanel';

export default async function AdminTenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TenantControlPanel tenantId={id} />;
}
