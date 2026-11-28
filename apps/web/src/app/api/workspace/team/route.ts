import crypto from 'node:crypto';
import { prisma } from '@tariffos/database';
import {
  AgencyRoleSchema,
  canManageAgencyTeam,
  normalizeAgencyRole,
  type AgencyInvitationSummary,
  type AgencyMemberSummary,
} from '@tariffos/shared-types';
import { z } from 'zod';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';

const InviteSchema = z.object({ email: z.string().trim().email().transform((v) => v.toLowerCase()), role: AgencyRoleSchema.default('ANALYST') });
const RolePatchSchema = z.object({ userId: z.string().trim().min(1), role: AgencyRoleSchema });
const SEVEN_DAYS_MS = 7 * 86_400_000;

function toMemberSummary(row: { userId: string; email: string | null; name: string | null; role: string; position: string | null }): AgencyMemberSummary {
  return {
    userId: row.userId,
    email: row.email ?? null,
    fullName: row.name?.trim() || row.email?.split('@')[0] || 'Operador',
    role: normalizeAgencyRole(row.role),
    position: row.position ?? null,
  };
}

function toInvitationSummary(row: { id: string; email: string; role: string; status: string; invitedByName: string | null; expiresAt: Date }): AgencyInvitationSummary {
  return {
    id: row.id,
    email: row.email,
    role: normalizeAgencyRole(row.role),
    status: row.status as AgencyInvitationSummary['status'],
    invitedByName: row.invitedByName ?? null,
    expiresAt: row.expiresAt.toISOString(),
  };
}

async function parseJson<T>(request: Request, schema: z.ZodType<T>): Promise<{ ok: true; data: T } | { ok: false; res: Response }> {
  let raw: unknown;
  try { raw = await request.json(); } catch { return { ok: false, res: Response.json({ error: 'Invalid JSON payload' }, { status: 400 }) }; }
  const parsed = schema.safeParse(raw);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, res: Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 }) };
}

export async function GET(): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  const role = normalizeAgencyRole(auth.context.role);
  const canManage = canManageAgencyTeam(role);
  const [memberRows, invitationRows] = await Promise.all([
    prisma.membership.findMany({ where: { tenantId: auth.context.tenantId }, select: { userId: true, email: true, name: true, role: true, position: true }, orderBy: { createdAt: 'asc' } }),
    canManage ? prisma.invitation.findMany({ where: { tenantId: auth.context.tenantId, status: 'PENDING' }, select: { id: true, email: true, role: true, status: true, invitedByName: true, expiresAt: true }, orderBy: { createdAt: 'desc' } }) : Promise.resolve([]),
  ]);
  const members = memberRows.map(toMemberSummary);
  const currentUser = members.find((m) => m.userId === auth.context.userId) ?? { userId: auth.context.userId, email: auth.context.userEmail, fullName: auth.context.userEmail?.split('@')[0] ?? 'Operador', role };
  return Response.json({ role, currentUser, members, invitations: invitationRows.map(toInvitationSummary) });
}

export async function POST(request: Request): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  if (!canManageAgencyTeam(normalizeAgencyRole(auth.context.role))) return Response.json({ error: 'Only agency owners can invite team members.' }, { status: 403 });
  const body = await parseJson(request, InviteSchema);
  if (!body.ok) return body.res;

  const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS);
  const token = crypto.randomBytes(24).toString('hex');
  const inviter = auth.context.userEmail ?? 'OWNER';
  const row = await prisma.invitation.upsert({
    where: { tenantId_email: { tenantId: auth.context.tenantId, email: body.data.email } },
    update: { role: body.data.role, status: 'PENDING', token, invitedById: auth.context.userId, invitedByName: inviter, expiresAt, acceptedAt: null, acceptedById: null },
    create: { tenantId: auth.context.tenantId, email: body.data.email, role: body.data.role, status: 'PENDING', token, invitedById: auth.context.userId, invitedByName: inviter, expiresAt },
  });
  return Response.json({ ok: true, invitation: toInvitationSummary(row) }, { status: 201 });
}

export async function PATCH(request: Request): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  if (!canManageAgencyTeam(normalizeAgencyRole(auth.context.role))) return Response.json({ error: 'Only agency owners can update team roles.' }, { status: 403 });
  const body = await parseJson(request, RolePatchSchema);
  if (!body.ok) return body.res;

  const membership = await prisma.membership.findUnique({ where: { userId_tenantId: { userId: body.data.userId, tenantId: auth.context.tenantId } } });
  if (!membership) return Response.json({ error: 'Member not found' }, { status: 404 });

  if (normalizeAgencyRole(membership.role) === 'OWNER' && body.data.role !== 'OWNER') {
    const ownerCount = await prisma.membership.count({ where: { tenantId: auth.context.tenantId, role: { in: ['OWNER', 'ADMIN'] } } });
    if (ownerCount <= 1) return Response.json({ error: 'Cannot demote the last OWNER of the agency.' }, { status: 400 });
  }

  const updated = await prisma.membership.update({
    where: { userId_tenantId: { userId: body.data.userId, tenantId: auth.context.tenantId } },
    data: { role: body.data.role },
    select: { userId: true, email: true, name: true, role: true, position: true },
  });
  return Response.json({ ok: true, member: toMemberSummary(updated) });
}

export async function DELETE(request: Request): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  if (!canManageAgencyTeam(normalizeAgencyRole(auth.context.role))) return Response.json({ error: 'Only agency owners can revoke invitations.' }, { status: 403 });
  const invitationId = new URL(request.url).searchParams.get('invitationId')?.trim();
  if (!invitationId) return Response.json({ error: 'Missing invitationId parameter' }, { status: 400 });

  await prisma.invitation.updateMany({ where: { id: invitationId, tenantId: auth.context.tenantId }, data: { status: 'REVOKED' } });
  return Response.json({ ok: true });
}
