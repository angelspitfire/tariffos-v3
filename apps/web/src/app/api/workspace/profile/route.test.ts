import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  resolveCloudTenantContext: vi.fn(),
  findUnique: vi.fn(),
  upsert: vi.fn(),
  uploadBrokerSignature: vi.fn(),
  downloadBrokerSignatureAsDataUrl: vi.fn(),
}));

vi.mock('@/lib/agent/cloud-session', () => ({
  resolveCloudTenantContext: mocks.resolveCloudTenantContext,
}));

vi.mock('@/lib/workspace/signature-storage', () => ({
  uploadBrokerSignature: mocks.uploadBrokerSignature,
  downloadBrokerSignatureAsDataUrl: mocks.downloadBrokerSignatureAsDataUrl,
}));

vi.mock('@tariffos/database', () => ({
  prisma: {
    userProfile: {
      findUnique: mocks.findUnique,
      upsert: mocks.upsert,
    },
  },
}));

import { GET, PUT } from './route';

describe('/api/workspace/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resolveCloudTenantContext.mockResolvedValue({
      ok: true,
      context: { userId: 'u-1', userEmail: 'erika@tariffos.ve', tenantId: 't-1', role: 'OWNER' },
    });
  });

  it('loads UserProfile with stored broker signature data URL and uploads new signature on PUT', async () => {
    const now = new Date('2026-11-26T10:00:00Z');
    const sigUrl = 'data:image/png;base64,ZmFrZS1zaWc=';
    mocks.findUnique.mockResolvedValue({
      fullName: 'Erika Peña',
      companyName: 'Aduanas Venezuela',
      brokerLicense: 'SENIAT-881',
      approvalWorkflowMode: 'always_review',
      defaultIncoterm: 'CIF',
      preferredCurrency: 'USD',
      detailLevel: 'exhaustive',
      role: 'Agente Titular',
      signatureStorageKey: 'u-1/signature.png',
      updatedAt: now,
    });
    mocks.downloadBrokerSignatureAsDataUrl.mockResolvedValueOnce(sigUrl);
    mocks.uploadBrokerSignature.mockResolvedValueOnce('u-1/signature.png');

    const getRes = await GET();
    expect(getRes.status).toBe(200);
    const json = (await getRes.json()) as {
      profile: { fullName: string; detailLevel: string; brokerSignatureDataUrl?: string };
    };
    expect(json.profile.fullName).toBe('Erika Peña');
    expect(json.profile.detailLevel).toBe('exhaustive');
    expect(json.profile.brokerSignatureDataUrl).toBe(sigUrl);
    expect(mocks.downloadBrokerSignatureAsDataUrl).toHaveBeenCalledWith('u-1/signature.png');

    const putRes = await PUT(
      new Request('http://localhost/api/workspace/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json.profile),
      }),
    );
    expect(putRes.status).toBe(200);
    expect(mocks.uploadBrokerSignature).toHaveBeenCalledWith('u-1', sigUrl);
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ position: 'Agente Titular', signatureStorageKey: 'u-1/signature.png' }),
        create: expect.objectContaining({ id: 'u-1', position: 'Agente Titular', signatureStorageKey: 'u-1/signature.png' }),
      }),
    );
    const firstUpsert = mocks.upsert.mock.calls[0]?.[0] as {
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    };
    expect('role' in firstUpsert.update).toBe(false);
    expect('role' in firstUpsert.create).toBe(false);
  });

  it('preserves profiles.role super_admin on GET and falls back to default job title when position is null', async () => {
    mocks.findUnique.mockResolvedValueOnce({
      fullName: 'Erick',
      companyName: 'TariffOS',
      brokerLicense: null,
      approvalWorkflowMode: 'agent_decides',
      defaultIncoterm: 'FOB',
      preferredCurrency: 'USD',
      detailLevel: 'standard',
      position: null,
      role: 'super_admin',
      signatureStorageKey: null,
      updatedAt: new Date('2026-11-27T10:00:00Z'),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const json = (await res.json()) as { profile: { role: string } };
    expect(json.profile.role).toBe('Agente de Aduanas');
  });

  it('preserves existing signatureStorageKey when brokerSignatureDataUrl is omitted and clears it when empty string', async () => {
    const baseProfile = {
      fullName: 'Erika Peña',
      email: 'erika@tariffos.ve',
      role: 'Agente Titular',
      companyName: 'Aduanas Venezuela',
      brokerLicense: 'SENIAT-881',
      themePreference: 'light',
      defaultJurisdictionId: 've-seniat',
      defaultIncoterm: 'FOB',
      preferredCurrency: 'USD',
      detailLevel: 'standard',
      approvalWorkflowMode: 'agent_decides',
      autoOpenCanvas: true,
      updatedAt: '2026-11-27T10:00:00Z',
    };

    const keepRes = await PUT(
      new Request('http://localhost/api/workspace/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baseProfile),
      }),
    );
    expect(keepRes.status).toBe(200);
    expect(mocks.uploadBrokerSignature).not.toHaveBeenCalled();
    const keepCall = mocks.upsert.mock.calls[0]?.[0] as { update: Record<string, unknown> };
    expect('signatureStorageKey' in keepCall.update).toBe(false);

    const clearRes = await PUT(
      new Request('http://localhost/api/workspace/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseProfile, brokerSignatureDataUrl: '' }),
      }),
    );
    expect(clearRes.status).toBe(200);
    expect(mocks.upsert).toHaveBeenLastCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ signatureStorageKey: null }),
      }),
    );
  });
});
