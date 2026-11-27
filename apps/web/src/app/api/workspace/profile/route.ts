import { prisma } from '@tariffos/database';
import { UserProfileSettingsSchema, type UserProfileSettings } from '@tariffos/shared-types';
import { resolveCloudTenantContext } from '@/lib/agent/cloud-session';
import {
  downloadBrokerSignatureAsDataUrl,
  uploadBrokerSignature,
} from '@/lib/workspace/signature-storage';
import { DEFAULT_USER_PROFILE } from '@/lib/workspace/types';

function mapProfileRow(
  row: {
    fullName: string | null;
    companyName: string | null;
    brokerLicense: string | null;
    approvalWorkflowMode: string | null;
    defaultIncoterm: string | null;
    preferredCurrency: string | null;
    detailLevel: string | null;
    role: string | null;
    updatedAt: Date;
  },
  email: string | null,
  brokerSignatureDataUrl?: string,
): UserProfileSettings {
  return UserProfileSettingsSchema.parse({
    ...DEFAULT_USER_PROFILE,
    email: email ?? DEFAULT_USER_PROFILE.email,
    fullName: row.fullName ?? DEFAULT_USER_PROFILE.fullName,
    companyName: row.companyName ?? DEFAULT_USER_PROFILE.companyName,
    brokerLicense: row.brokerLicense ?? DEFAULT_USER_PROFILE.brokerLicense,
    ...(brokerSignatureDataUrl ? { brokerSignatureDataUrl } : {}),
    role: row.role ?? DEFAULT_USER_PROFILE.role,
    approvalWorkflowMode: row.approvalWorkflowMode ?? DEFAULT_USER_PROFILE.approvalWorkflowMode,
    defaultIncoterm: row.defaultIncoterm ?? DEFAULT_USER_PROFILE.defaultIncoterm,
    preferredCurrency: row.preferredCurrency === 'EUR' ? 'EUR' : 'USD',
    detailLevel:
      row.detailLevel === 'concise' || row.detailLevel === 'exhaustive'
        ? row.detailLevel
        : 'standard',
    updatedAt: row.updatedAt.toISOString(),
  });
}

export async function GET(): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  const row = await prisma.userProfile.findUnique({ where: { id: auth.context.userId } });
  if (!row) return Response.json({ profile: null });

  const brokerSignatureDataUrl = row.signatureStorageKey
    ? await downloadBrokerSignatureAsDataUrl(row.signatureStorageKey).catch(() => undefined)
    : undefined;

  return Response.json({
    profile: mapProfileRow(row, auth.context.userEmail, brokerSignatureDataUrl),
  });
}

export async function PUT(request: Request): Promise<Response> {
  const auth = await resolveCloudTenantContext();
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = UserProfileSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 });
  }

  const p = parsed.data;
  let signaturePatch: { signatureStorageKey?: string | null } = {};
  if (p.brokerSignatureDataUrl === '') {
    signaturePatch = { signatureStorageKey: null };
  } else if (p.brokerSignatureDataUrl?.startsWith('data:image/')) {
    const uploadedKey = await uploadBrokerSignature(auth.context.userId, p.brokerSignatureDataUrl).catch(
      () => null,
    );
    if (uploadedKey) {
      signaturePatch = { signatureStorageKey: uploadedKey };
    }
  }

  const data = {
    fullName: p.fullName,
    companyName: p.companyName,
    brokerLicense: p.brokerLicense,
    approvalWorkflowMode: p.approvalWorkflowMode,
    defaultIncoterm: p.defaultIncoterm,
    preferredCurrency: p.preferredCurrency,
    detailLevel: p.detailLevel,
    role: p.role,
    ...signaturePatch,
  };

  await prisma.userProfile.upsert({
    where: { id: auth.context.userId },
    update: data,
    create: { id: auth.context.userId, ...data },
  });

  return Response.json({ ok: true });
}
