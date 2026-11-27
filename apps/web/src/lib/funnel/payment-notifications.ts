import type { ManualPaymentRecord } from '@tariffos/shared-types';
import { SUPPORT_EMAIL } from './payment-methods';

function parseAdminEmails(): string[] {
  const raw = process.env.PLATFORM_ADMIN_EMAILS ?? '';
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.includes('@'));
}

export async function notifyPaymentSubmitted(payment: ManualPaymentRecord): Promise<void> {
  const webhookUrl = process.env.BILLING_WEBHOOK_URL || process.env.LEADS_WEBHOOK_URL;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tariffos.app').replace(/\/$/, '');
  const reviewUrl = `${siteUrl}/admin/billing`;

  const tasks: Promise<unknown>[] = [];

  if (webhookUrl) {
    tasks.push(
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'payment.submitted',
          reviewUrl,
          payment,
        }),
      }),
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  const recipients = parseAdminEmails();
  if (resendKey && recipients.length > 0) {
    const from = process.env.EMAIL_FROM || `TariffOS Billing <${SUPPORT_EMAIL}>`;
    const subject = `[Pago manual] ${payment.planName} · $${payment.amount} ${payment.currency} · Ref ${payment.referenceCode}`;
    const text = [
      'Nuevo comprobante de pago reportado en TariffOS:',
      `Plan: ${payment.planName} (${payment.billingCycle})`,
      `Monto: $${payment.amount} ${payment.currency}`,
      `Método: ${payment.method}`,
      `Referencia: ${payment.referenceCode}`,
      `Empresa / Usuario: ${payment.companyName || payment.userEmail} (${payment.userEmail})`,
      payment.notes ? `Notas: ${payment.notes}` : null,
      '',
      `Revisar y activar en: ${reviewUrl}`,
    ]
      .filter(Boolean)
      .join('\n');

    tasks.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from,
          to: recipients,
          subject,
          text,
        }),
      }),
    );
  }

  if (tasks.length === 0) return;

  try {
    await Promise.allSettled(tasks);
  } catch {
    // Notifications are best-effort and must never fail payment creation.
  }
}
