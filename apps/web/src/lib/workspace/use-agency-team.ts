'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  normalizeAgencyRole,
  type AgencyInvitationSummary,
  type AgencyMemberSummary,
  type AgencyRole,
} from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export interface AgencyTeamState {
  role: AgencyRole;
  currentUser: AgencyMemberSummary | null;
  members: AgencyMemberSummary[];
  invitations: AgencyInvitationSummary[];
  loading: boolean;
  refreshTeam: () => Promise<void>;
  inviteMember: (email: string, role: AgencyRole) => Promise<{ ok: boolean; error?: string }>;
  updateMemberRole: (userId: string, role: AgencyRole) => Promise<{ ok: boolean; error?: string }>;
  revokeInvitation: (invitationId: string) => Promise<{ ok: boolean; error?: string }>;
}

export function useAgencyTeam(fallbackName = 'Operador'): AgencyTeamState {
  const cloud = isCloudModeEnabled();
  const [role, setRole] = useState<AgencyRole>('OWNER');
  const [currentUser, setCurrentUser] = useState<AgencyMemberSummary | null>(
    cloud ? null : { userId: 'local-owner', email: null, fullName: fallbackName, role: 'OWNER' },
  );
  const [members, setMembers] = useState<AgencyMemberSummary[]>([]);
  const [invitations, setInvitations] = useState<AgencyInvitationSummary[]>([]);
  const [loading, setLoading] = useState(cloud);

  const refreshTeam = useCallback(async () => {
    if (!cloud) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/workspace/team');
      if (!res.ok) return;
      const json = (await res.json()) as {
        role?: string;
        currentUser?: AgencyMemberSummary | null;
        members?: AgencyMemberSummary[];
        invitations?: AgencyInvitationSummary[];
      };
      setRole(normalizeAgencyRole(json.role ?? 'OWNER'));
      setCurrentUser(json.currentUser ?? null);
      setMembers(Array.isArray(json.members) ? json.members : []);
      setInvitations(Array.isArray(json.invitations) ? json.invitations : []);
    } catch {
      // Offline / transient network errors keep safe defaults.
    } finally {
      setLoading(false);
    }
  }, [cloud]);

  useEffect(() => {
    void refreshTeam();
  }, [refreshTeam]);

  const inviteMember = useCallback(
    async (email: string, nextRole: AgencyRole) => {
      const res = await fetch('/api/workspace/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: nextRole }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        return { ok: false, error: err?.error ?? `HTTP ${res.status}` };
      }
      await refreshTeam();
      return { ok: true };
    },
    [refreshTeam],
  );

  const updateMemberRole = useCallback(
    async (userId: string, nextRole: AgencyRole) => {
      const res = await fetch('/api/workspace/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: nextRole }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        return { ok: false, error: err?.error ?? `HTTP ${res.status}` };
      }
      await refreshTeam();
      return { ok: true };
    },
    [refreshTeam],
  );

  const revokeInvitation = useCallback(
    async (invitationId: string) => {
      const res = await fetch(
        `/api/workspace/team?invitationId=${encodeURIComponent(invitationId)}`,
        { method: 'DELETE' },
      );
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        return { ok: false, error: err?.error ?? `HTTP ${res.status}` };
      }
      await refreshTeam();
      return { ok: true };
    },
    [refreshTeam],
  );

  return {
    role,
    currentUser,
    members,
    invitations,
    loading,
    refreshTeam,
    inviteMember,
    updateMemberRole,
    revokeInvitation,
  };
}
