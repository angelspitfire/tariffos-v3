import { INTERNAL_TARIFFOS_PLAN_DISPLAY_NAME } from './internal-plan';

export interface SuperAdminCredentialsEmailInput {
  recipientEmail: string;
  recipientName: string;
  temporaryPassword: string;
  role: string;
  appBaseUrl?: string;
}

export interface SuperAdminEmailDeliveryResult {
  delivered: boolean;
  provider: 'resend' | 'cloudflare' | 'none';
  includedTemporaryPassword: boolean;
  messageId?: string;
  error?: string;
}

export interface RenderedEmailMessage {
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildSuperAdminCredentialsEmail(
  input: SuperAdminCredentialsEmailInput,
): RenderedEmailMessage {
  const baseUrl = (input.appBaseUrl ?? 'https://tariffos.app').replace(/\/+$/, '');
  const loginAdminUrl = `${baseUrl}/login?next=%2Fadmin`;
  const workspaceUrl = `${baseUrl}/app`;
  const subject = 'Tus credenciales de acceso Super Admin — TariffOS';

  const text = [
    `Hola ${input.recipientName},`,
    '',
    `Tu cuenta interna de administración (${input.role}) en TariffOS ha sido habilitada con el plan exclusivo "${INTERNAL_TARIFFOS_PLAN_DISPLAY_NAME}" (sin límites ni pasarela de pago).`,
    '',
    'Credenciales temporales de acceso:',
    `- Usuario (correo): ${input.recipientEmail}`,
    `- Clave temporal: ${input.temporaryPassword}`,
    '',
    `Consola Admin: ${loginAdminUrl}`,
    `Workspace Operativo: ${workspaceUrl}`,
    '',
    'Por seguridad, te recomendamos actualizar tu contraseña después del primer ingreso.',
  ].join('\n');

  const html = [
    '<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">',
    '<h2 style="margin: 0 0 12px; font-size: 18px;">Acceso Super Admin habilitado — TariffOS</h2>',
    `<p style="font-size: 14px; line-height: 1.5;">Hola <strong>${escapeHtml(input.recipientName)}</strong>, tu cuenta interna (<code>${escapeHtml(input.role)}</code>) está activa con el plan exclusivo <strong>${escapeHtml(INTERNAL_TARIFFOS_PLAN_DISPLAY_NAME)}</strong>.</p>`,
    '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 14px;">',
    `<div style="margin-bottom: 8px;"><strong>Usuario:</strong> <code>${escapeHtml(input.recipientEmail)}</code></div>`,
    `<div><strong>Clave temporal:</strong> <code style="font-size: 15px; font-weight: 700;">${escapeHtml(input.temporaryPassword)}</code></div>`,
    '</div>',
    `<p style="margin: 18px 0;"><a href="${escapeHtml(loginAdminUrl)}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;">Entrar a Consola Admin</a> &nbsp; <a href="${escapeHtml(workspaceUrl)}" style="font-size: 13px; color: #2563eb;">Ir al Workspace</a></p>`,
    '<p style="font-size: 12px; color: #64748b;">Por seguridad, cambia esta contraseña temporal tras tu primer inicio de sesión.</p>',
    '</div>',
  ].join('');

  return { subject, text, html };
}

export async function sendSuperAdminCredentialsEmail(
  input: SuperAdminCredentialsEmailInput,
  options?: {
    env?: Record<string, string | undefined>;
    fetchImpl?: typeof fetch;
  },
): Promise<SuperAdminEmailDeliveryResult> {
  const env = options?.env ?? process.env;
  const fetchFn = options?.fetchImpl ?? fetch;
  const appBaseUrl =
    input.appBaseUrl ??
    env.NEXT_PUBLIC_SITE_URL ??
    env.NEXT_PUBLIC_APP_URL ??
    'https://tariffos.app';
  const rendered = buildSuperAdminCredentialsEmail({ ...input, appBaseUrl });

  const resendApiKey = env.RESEND_API_KEY?.trim();
  const fromEmail = (
    env.EMAIL_FROM ??
    env.RESEND_FROM_EMAIL ??
    'TariffOS <no-reply@tariffos.app>'
  ).trim();

  if (resendApiKey) {
    const res = await fetchFn('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [input.recipientEmail],
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      return {
        delivered: false,
        provider: 'resend',
        includedTemporaryPassword: false,
        error: `Resend respondió ${res.status}: ${errBody}`,
      };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    return {
      delivered: true,
      provider: 'resend',
      includedTemporaryPassword: true,
      messageId: json.id,
    };
  }

  const cfAccountId = env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const cfApiToken = env.CLOUDFLARE_API_TOKEN?.trim();
  const cfFromAddress = env.EMAIL_FROM_ADDRESS?.trim() ?? env.EMAIL_FROM?.trim();

  if (cfAccountId && cfApiToken && cfFromAddress) {
    const res = await fetchFn(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/email/sending/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: input.recipientEmail,
          from: { address: cfFromAddress, name: 'TariffOS' },
          subject: rendered.subject,
          text: rendered.text,
          html: rendered.html,
        }),
      },
    );
    if (!res.ok) {
      const errBody = await res.text();
      return {
        delivered: false,
        provider: 'cloudflare',
        includedTemporaryPassword: false,
        error: `Cloudflare Email Sending respondió ${res.status}: ${errBody}`,
      };
    }
    return {
      delivered: true,
      provider: 'cloudflare',
      includedTemporaryPassword: true,
    };
  }

  return {
    delivered: false,
    provider: 'none',
    includedTemporaryPassword: false,
    error:
      'No hay proveedor de correo transaccional configurado (RESEND_API_KEY o CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID + EMAIL_FROM_ADDRESS). Supabase Auth nativo no permite enviar claves temporales en texto plano.',
  };
}
