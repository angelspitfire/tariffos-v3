import { prisma, recordAdminAudit } from '@tariffos/database';
import { UpdateLlmSettingsBodySchema } from '@tariffos/shared-types';
import { parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import {
  getAdminLlmSettingsPayload,
  resetLlmRuntimeConfig,
  saveLlmRuntimeConfig,
} from '@/lib/admin/llm-settings';
import { appendOfflineAudit } from '@/lib/admin/offline-store';
import { isCloudModeEnabled } from '@/lib/runtime-config';

export async function GET(): Promise<Response> {
  const guard = await requireAdmin('settings:manage');
  if (!guard.ok) return guard.response;

  const payload = await getAdminLlmSettingsPayload();
  return Response.json(payload, { status: 200 });
}

export async function PUT(request: Request): Promise<Response> {
  const guard = await requireAdmin('settings:manage');
  if (!guard.ok) return guard.response;

  const rawBody = await parseJsonBody(request);
  const parsed = UpdateLlmSettingsBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const input = parsed.data;
    const change = input.reset
      ? await resetLlmRuntimeConfig()
      : await saveLlmRuntimeConfig({
          provider: input.provider,
          model: input.model,
          deepModel: input.deepModel,
          baseUrl: input.baseUrl,
          maxRpm: input.maxRpm,
        });

    const auditEntry = {
      actorUserId: guard.context.userId,
      actorEmail: guard.context.userEmail,
      actorRole: guard.context.role,
      action: 'settings.llm_updated',
      targetType: 'system_setting',
      targetId: 'ai.runtime_config',
      reason:
        input.reason?.trim() ||
        (input.reset
          ? 'Restablecimiento de modelo LLM a variables de entorno'
          : `Modelo activo cambiado a ${change.after.provider}/${change.after.model}`),
      beforeState: change.before,
      afterState: change.after,
    };

    if (!isCloudModeEnabled()) {
      appendOfflineAudit({ ...auditEntry, tenantId: null });
    } else {
      await recordAdminAudit(prisma, {
        ...auditEntry,
        beforeState: JSON.parse(JSON.stringify(change.before)),
        afterState: JSON.parse(JSON.stringify(change.after)),
      });
    }

    const payload = await getAdminLlmSettingsPayload();
    return Response.json({ ok: true, ...payload }, { status: 200 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'No se pudo actualizar la configuración LLM' },
      { status: 400 },
    );
  }
}
