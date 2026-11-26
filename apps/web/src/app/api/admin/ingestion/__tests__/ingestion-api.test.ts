import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminPermission } from '@tariffos/shared-types';
import { getOfflineIngestionState, resetOfflineIngestionState } from '@/lib/admin/ingestion-offline-store';
import { getOfflineAdminState, resetOfflineAdminState } from '@/lib/admin/offline-store';
import { hasAdminPermission } from '@/lib/admin/permissions';

const mocks = vi.hoisted(() => ({
  role: 'super_admin' as 'user' | 'support' | 'ops_billing' | 'super_admin',
  authenticated: true,
}));

vi.mock('@/lib/runtime-config', () => ({
  isCloudModeEnabled: () => false,
}));

vi.mock('@/lib/admin/admin-session', () => ({
  resolvePlatformAdminContext: async (perm: AdminPermission) => {
    if (!mocks.authenticated) {
      return { ok: false, status: 401, error: 'Authentication required' };
    }
    if (!hasAdminPermission(mocks.role, perm)) {
      return { ok: false, status: 403, error: `Insufficient permissions for ${perm}` };
    }
    return {
      ok: true,
      context: {
        userId: 'admin-1',
        userEmail: 'admin@tariffos.app',
        role: mocks.role,
      },
    };
  },
}));

import { GET as getCountries, POST as postCountry } from '../countries/route';
import { GET as getDocuments, POST as postDocument } from '../documents/route';
import { DELETE as deleteDocument } from '../documents/[id]/route';
import { GET as getDiff } from '../documents/[id]/diff/route';
import { POST as postPublish } from '../documents/[id]/publish/route';
import { POST as postUploadUrl } from '../upload-url/route';

describe('admin ingestion API routes (RBAC + offline lifecycle)', () => {
  beforeEach(() => {
    mocks.role = 'super_admin';
    mocks.authenticated = true;
    resetOfflineIngestionState();
    resetOfflineAdminState();
  });

  it('enforces 401/403 RBAC and restricts mutations for support role', async () => {
    mocks.authenticated = false;
    const unauth = await getCountries();
    expect(unauth.status).toBe(401);

    mocks.authenticated = true;
    mocks.role = 'support';
    const readOk = await getCountries();
    expect(readOk.status).toBe(200);

    const writeDenied = await postCountry(
      new Request('http://localhost/api/admin/ingestion/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'CO',
          name: 'Colombia',
          legislation: 'Decreto 1881',
          nomenclatureDigits: 10,
          codeGrouping: '4.2.2.2',
        }),
      }),
    );
    expect(writeDenied.status).toBe(403);
  });

  it('creates a new country, stages DRAFT, previews diff, publishes + derogates prior PUBLISHED, and records audit logs', async () => {
    const countryRes = await postCountry(
      new Request('http://localhost/api/admin/ingestion/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'CO',
          name: 'Colombia',
          legislation: 'Decreto 1881',
          nomenclatureDigits: 10,
          codeGrouping: '4.2.2.2',
        }),
      }),
    );
    expect(countryRes.status).toBe(201);

    const uploadUrlRes = await postUploadUrl(
      new Request('http://localhost/api/admin/ingestion/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: 'VE',
          fileName: 'loa-reforma.md',
          contentType: 'text/markdown',
          fileSizeBytes: 2048,
        }),
      }),
    );
    expect(uploadUrlRes.status).toBe(200);

    const stageRes = await postDocument(
      new Request('http://localhost/api/admin/ingestion/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: 'VE',
          legalType: 'LEGAL_NOTE',
          hierarchyPath: 'loa',
          title: 'LOA Reforma 2026',
          sourceFormat: 'markdown',
          decreeNumber: 'Decreto Reforma 2026',
          validFromDate: '2026-06-01',
          content: 'Artículo 1. Nueva regla para la partida 8504.40 y subpartida 8517.62.',
        }),
      }),
    );
    expect(stageRes.status).toBe(201);
    const stagedJson = (await stageRes.json()) as { document: { id: string } };
    const draftId = stagedJson.document.id;

    const diffRes = await getDiff(new Request('http://localhost'), {
      params: Promise.resolve({ id: draftId }),
    });
    expect(diffRes.status).toBe(200);
    const diffJson = (await diffRes.json()) as {
      diff: { overlappingPublished: Array<{ id: string }>; affectedHsCodes: string[] };
    };
    expect(diffJson.diff.overlappingPublished.map((d) => d.id)).toContain('ve-loa-published');
    expect(diffJson.diff.affectedHsCodes).toContain('8517.62');

    const pubRes = await postPublish(new Request('http://localhost', { method: 'POST' }), {
      params: Promise.resolve({ id: draftId }),
    });
    expect(pubRes.status).toBe(200);
    const pubJson = (await pubRes.json()) as { result: { derogatedIds: string[] } };
    expect(pubJson.result.derogatedIds).toContain('ve-loa-published');

    const state = getOfflineIngestionState();
    expect(state.documents.find((d) => d.id === 've-loa-published')?.status).toBe('DEROGATED');

    const delPublished = await deleteDocument(new Request('http://localhost', { method: 'DELETE' }), {
      params: Promise.resolve({ id: draftId }),
    });
    expect(delPublished.status).toBe(409);

    const listDrafts = await getDocuments(
      new Request('http://localhost/api/admin/ingestion/documents?countryCode=VE&status=PUBLISHED'),
    );
    expect(listDrafts.status).toBe(200);

    const audits = getOfflineAdminState().auditLogs;
    expect(audits.some((a) => a.action === 'ingestion.country_upserted')).toBe(true);
    expect(audits.some((a) => a.action === 'ingestion.draft_staged')).toBe(true);
    expect(audits.some((a) => a.action === 'ingestion.draft_published')).toBe(true);
  });
});
