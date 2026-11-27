import type {
  CreatePlatformAdminInput,
  PlatformAdminRecord,
  UpdatePlatformAdminInput,
} from '@tariffos/shared-types';
import { appendOfflineAudit, getOfflineAdminState } from '@/lib/admin/offline-store';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export interface UpsertCloudAdminAuthResult {
  userId: string;
  action: 'created' | 'updated';
}

/**
 * Creates or updates a confirmed Supabase Auth user for an internal TariffOS admin,
 * setting `app_metadata.platform_role` and `user_metadata.must_change_password`.
 */
export async function upsertCloudAdminAuthUser(params: {
  email: string;
  password: string;
  fullName: string;
  role: string;
  mustChangePassword: boolean;
}): Promise<UpsertCloudAdminAuthResult> {
  const supabaseAdmin = createSupabaseAdminClient();
  const listRes = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listRes.error) {
    throw new Error(`No se pudieron consultar usuarios en Supabase Auth: ${listRes.error.message}`);
  }

  const existing = (listRes.data?.users ?? []).find(
    (u) => u.email?.trim().toLowerCase() === params.email,
  );
  const metadataPatch = {
    full_name: params.fullName,
    must_change_password: params.mustChangePassword,
  };

  if (existing) {
    const updRes = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password: params.password,
      email_confirm: true,
      ban_duration: 'none',
      user_metadata: { ...(existing.user_metadata ?? {}), ...metadataPatch },
      app_metadata: { ...(existing.app_metadata ?? {}), platform_role: params.role },
    });
    if (updRes.error || !updRes.data?.user) {
      throw new Error(
        `No se pudo actualizar el usuario en Supabase Auth: ${updRes.error?.message ?? 'unknown'}`,
      );
    }
    return { userId: updRes.data.user.id, action: 'updated' };
  }

  const crtRes = await supabaseAdmin.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    user_metadata: metadataPatch,
    app_metadata: { platform_role: params.role },
  });
  if (crtRes.error || !crtRes.data?.user) {
    throw new Error(
      `No se pudo crear el usuario en Supabase Auth: ${crtRes.error?.message ?? 'unknown'}`,
    );
  }
  return { userId: crtRes.data.user.id, action: 'created' };
}

export function upsertOfflinePlatformAdmin(params: {
  input: CreatePlatformAdminInput;
  email: string;
  planSlug: string;
  actorUserId: string;
  actorEmail: string | null;
  actorRole: string;
}): PlatformAdminRecord {
  const state = getOfflineAdminState();
  const now = new Date().toISOString();
  const notes = `${params.input.fullName} (${params.input.companyName})`;
  const existing = state.platformAdmins.find((a) => a.email.toLowerCase() === params.email);
  const admin: PlatformAdminRecord = existing
    ? { ...existing, role: params.input.role, isActive: true, notes, updatedAt: now }
    : {
        id: `pa-${Date.now()}`,
        email: params.email,
        role: params.input.role,
        isActive: true,
        notes,
        createdBy: params.actorEmail ?? `admin:${params.actorUserId}`,
        createdAt: now,
        updatedAt: now,
      };
  state.platformAdmins = existing
    ? state.platformAdmins.map((a) => (a.id === admin.id ? admin : a))
    : [...state.platformAdmins, admin];

  appendOfflineAudit({
    actorUserId: params.actorUserId,
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    action: 'platform_admin.provisioned',
    targetType: 'platform_admin',
    targetId: admin.id,
    tenantId: null,
    reason: `Alta interna (${params.input.role}) con plan ${params.planSlug}`,
    beforeState: null,
    afterState: { email: params.email, role: params.input.role, planSlug: params.planSlug },
  });
  return admin;
}

export function updateOfflinePlatformAdmin(params: {
  input: UpdatePlatformAdminInput;
  email: string;
  actorUserId: string;
  actorEmail: string | null;
  actorRole: string;
}): PlatformAdminRecord | null {
  const state = getOfflineAdminState();
  const target = state.platformAdmins.find((a) => a.email.toLowerCase() === params.email);
  if (!target) return null;
  const updated: PlatformAdminRecord = {
    ...target,
    isActive: params.input.action === 'grant',
    role: params.input.action === 'grant' && params.input.role ? params.input.role : target.role,
    updatedAt: new Date().toISOString(),
  };
  state.platformAdmins = state.platformAdmins.map((a) => (a.id === updated.id ? updated : a));
  appendOfflineAudit({
    actorUserId: params.actorUserId,
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    action: params.input.action === 'revoke' ? 'platform_admin.revoked' : 'platform_admin.granted',
    targetType: 'platform_admin',
    targetId: updated.id,
    tenantId: null,
    reason: params.input.reason ?? null,
    beforeState: { isActive: target.isActive, role: target.role },
    afterState: { isActive: updated.isActive, role: updated.role },
  });
  return updated;
}
