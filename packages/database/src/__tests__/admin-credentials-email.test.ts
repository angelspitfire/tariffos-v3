import { describe, expect, it, vi } from 'vitest';
import {
  buildSuperAdminCredentialsEmail,
  sendSuperAdminCredentialsEmail,
} from '../admin-credentials-email';

describe('admin-credentials-email', () => {
  it('renders recipient email, temporary password, internal unlimited plan name, and login links', () => {
    const msg = buildSuperAdminCredentialsEmail({
      recipientEmail: 'erickampg25@gmail.com',
      recipientName: 'Ericka',
      temporaryPassword: 'TfOS!Temp#2026',
      role: 'super_admin',
      appBaseUrl: 'https://tariffos.app',
    });

    expect(msg.subject).toMatch(/Super Admin/i);
    expect(msg.text).toContain('erickampg25@gmail.com');
    expect(msg.text).toContain('TfOS!Temp#2026');
    expect(msg.text).toContain('TariffOS Interno (Ilimitado)');
    expect(msg.html).toContain('https://tariffos.app/login?next=%2Fadmin');
  });

  it('delivers email with temporary credentials via Resend when RESEND_API_KEY is configured', async () => {
    const fetchMock = vi.fn<() => Promise<unknown>>().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 're_msg_123' }),
    });

    const res = await sendSuperAdminCredentialsEmail(
      {
        recipientEmail: 'erickampg25@gmail.com',
        recipientName: 'Ericka',
        temporaryPassword: 'TfOS!Temp#2026',
        role: 'super_admin',
      },
      {
        env: {
          RESEND_API_KEY: 're_test_secret',
          EMAIL_FROM: 'TariffOS <acceso@tariffos.app>',
          NEXT_PUBLIC_SITE_URL: 'https://tariffos.app',
        },
        fetchImpl: fetchMock as unknown as typeof fetch,
      },
    );

    expect(res).toEqual({
      delivered: true,
      provider: 'resend',
      includedTemporaryPassword: true,
      messageId: 're_msg_123',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('reports provider=none cleanly when no transactional email provider is configured', async () => {
    const res = await sendSuperAdminCredentialsEmail(
      {
        recipientEmail: 'erickampg25@gmail.com',
        recipientName: 'Ericka',
        temporaryPassword: 'TfOS!Temp#2026',
        role: 'super_admin',
      },
      { env: {} },
    );

    expect(res.delivered).toBe(false);
    expect(res.provider).toBe('none');
    expect(res.includedTemporaryPassword).toBe(false);
    expect(res.error).toMatch(/RESEND_API_KEY/i);
  });
});
