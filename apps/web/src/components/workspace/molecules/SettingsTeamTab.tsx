'use client';

import { useState } from 'react';
import { MailPlus, Shield, Trash2, Users } from 'lucide-react';
import type {
  AgencyInvitationSummary,
  AgencyMemberSummary,
  AgencyRole,
} from '@tariffos/shared-types';

export interface SettingsTeamTabProps {
  currentUserId?: string;
  members: readonly AgencyMemberSummary[];
  invitations: readonly AgencyInvitationSummary[];
  onInvite: (email: string, role: AgencyRole) => Promise<{ ok: boolean; error?: string }>;
  onUpdateRole: (userId: string, role: AgencyRole) => Promise<{ ok: boolean; error?: string }>;
  onRevokeInvitation: (invitationId: string) => Promise<{ ok: boolean; error?: string }>;
}

const ROLE_OPTIONS: ReadonlyArray<{ value: AgencyRole; label: string }> = [
  { value: 'ANALYST', label: 'Analista' },
  { value: 'REVIEWER', label: 'Revisor / Agente' },
  { value: 'OWNER', label: 'Dueño' },
];

export function SettingsTeamTab({
  currentUserId,
  members,
  invitations,
  onInvite,
  onUpdateRole,
  onRevokeInvitation,
}: SettingsTeamTabProps) {
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AgencyRole>('ANALYST');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const ownerCount = members.filter((m) => m.role === 'OWNER').length;

  const handleInvite = async () => {
    const clean = email.trim();
    if (!clean) {
      setFeedback('Ingresa un correo electrónico válido.');
      return;
    }
    setBusy(true);
    setFeedback(null);
    const res = await onInvite(clean, inviteRole);
    setBusy(false);
    if (!res.ok) {
      setFeedback(res.error ?? 'No se pudo enviar la invitación.');
      return;
    }
    setEmail('');
    setFeedback(`Invitación enviada a ${clean}.`);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-card border border-border-subtle bg-surface-muted/40 p-4">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink-primary">
          <MailPlus className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
          Invitar miembro a la agencia
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleInvite();
              }
            }}
            placeholder="correo@agencia.ve"
            aria-label="Correo del colaborador"
            className="h-9 min-w-52 flex-1 rounded-field border border-border-subtle bg-surface-input px-3 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          />
          <select
            aria-label="Rol de invitación"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as AgencyRole)}
            className="h-9 rounded-field border border-border-subtle bg-surface-panel px-2.5 text-xs text-ink-primary focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleInvite()}
            className="h-9 cursor-pointer rounded-full bg-surface-inverted px-4 text-xs font-semibold text-ink-on-inverted transition-colors hover:bg-surface-inverted-hover disabled:opacity-50"
          >
            Enviar invitación
          </button>
        </div>
        {feedback ? <p className="mt-2 text-xs text-accent-ink">{feedback}</p> : null}
      </section>

      <section className="space-y-2">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          Miembros activos ({members.length})
        </h3>
        <ul className="divide-y divide-border-hairline rounded-card border border-border-subtle bg-surface-panel">
          {members.map((member) => {
            const isLastOwner = member.role === 'OWNER' && ownerCount <= 1;
            const isSelf = member.userId === currentUserId;
            return (
              <li key={member.userId} className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 text-xs">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-primary">
                    {member.fullName} {isSelf ? <span className="text-[11px] font-normal text-ink-muted">(Tú)</span> : null}
                  </p>
                  <p className="truncate text-[11px] text-ink-muted">{member.email ?? 'Sin correo'}</p>
                </div>
                <select
                  aria-label={`Rol de ${member.fullName}`}
                  value={member.role}
                  disabled={isLastOwner}
                  onChange={(e) => void onUpdateRole(member.userId, e.target.value as AgencyRole)}
                  className="h-8 rounded-lg border border-border-subtle bg-surface-panel px-2 text-xs text-ink-primary disabled:opacity-60"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </li>
            );
          })}
        </ul>
      </section>

      {invitations.length > 0 ? (
        <section className="space-y-2">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary">
            <Shield className="h-3.5 w-3.5" aria-hidden="true" />
            Invitaciones pendientes ({invitations.length})
          </h3>
          <ul className="divide-y divide-border-hairline rounded-card border border-border-subtle bg-surface-panel">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-2 px-3.5 py-2 text-xs">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink-primary">{inv.email}</p>
                  <p className="text-[11px] text-ink-muted">Rol: {ROLE_OPTIONS.find((r) => r.value === inv.role)?.label ?? inv.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void onRevokeInvitation(inv.id)}
                  aria-label={`Revocar invitación a ${inv.email}`}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-subtle px-2.5 py-1 text-[11px] text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  Revocar
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
