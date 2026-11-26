import { TestLlmSettingsBodySchema } from '@tariffos/shared-types';
import { parseJsonBody, requireAdmin } from '@/lib/admin/http-helpers';
import { testLlmRuntimeConfig } from '@/lib/admin/llm-settings';

export async function POST(request: Request): Promise<Response> {
  const guard = await requireAdmin('settings:manage');
  if (!guard.ok) return guard.response;

  const rawBody = await parseJsonBody(request);
  const parsed = TestLlmSettingsBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const result = await testLlmRuntimeConfig(parsed.data);
  return Response.json(result, { status: result.ok ? 200 : 422 });
}
