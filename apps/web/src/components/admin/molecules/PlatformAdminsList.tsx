import type { PlatformAdminRecord } from '@tariffos/shared-types';
import { AdminRoleBadge } from '@/components/admin/atoms/AdminRoleBadge';

export interface PlatformAdminsListProps {
  admins: readonly PlatformAdminRecord[];
  loading: boolean;
  busy: boolean;
  onToggleAccess: (admin: PlatformAdminRecord) => void;
}

export function PlatformAdminsList({
  admins,
  loading,
  busy,
  onToggleAccess,
}: PlatformAdminsListProps) {
  if (loading) {
    return <p className="text-xs text-ink-muted">Cargando lista de administradores...</p>;
  }
  if (admins.length === 0) {
    return <p className="text-xs text-ink-muted">No hay administradores registrados todavía.</p>;
  }

  return (
    <div className="divide-y divide-border-hairline border-t border-border-hairline">
      {admins.map((item) => (
        <div key={item.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-semibold text-ink-primary">{item.email}</span>
              <AdminRoleBadge role={item.role} />
              {!item.isActive ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/30">
                  Revocado
                </span>
              ) : null}
            </div>
            {item.notes ? <div className="text-[11px] text-ink-muted">{item.notes}</div> : null}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => onToggleAccess(item)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer disabled:opacity-50 ${
              item.isActive
                ? 'border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            {item.isActive ? 'Revocar' : 'Reactivar'}
          </button>
        </div>
      ))}
    </div>
  );
}
