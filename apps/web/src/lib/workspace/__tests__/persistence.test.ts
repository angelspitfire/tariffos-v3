import { describe, expect, it, vi } from 'vitest';
import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import { IndexedDBAdapter } from '../indexeddb-adapter';
import { DualWritePersistence, type IPersistence, normalizeSkuKey } from '../persistence';
import type { WorkspaceThread } from '../types';

const SAMPLE_THREAD: WorkspaceThread = {
  id: 'thread-1',
  title: 'Ecógrafo portátil Doppler',
  jurisdictionId: 've-seniat',
  status: 'regular',
  messages: [],
  createdAt: '2026-11-25T10:00:00.000Z',
  updatedAt: '2026-11-25T10:00:00.000Z',
};

const SAMPLE_SKU: SkuPrecedent = {
  id: 'sku-1',
  sku: 'SG-INV5K',
  normalizedSku: normalizeSkuKey('SG-INV5K'),
  title: 'Inversor solar híbrido 5 kW',
  description: 'Inversor onda sinusoidal pura 48V DC',
  hsCode: '8504.40.90.00',
  jurisdictionId: 've-seniat',
  adValoremPercent: 10,
  vatPercent: 16,
  legalRegime: 'Libre',
  reviewStatus: 'approved',
  usageCount: 2,
  createdAt: '2026-11-25T10:00:00.000Z',
  updatedAt: '2026-11-25T10:00:00.000Z',
};

const SAMPLE_PROFILE: UserProfileSettings = {
  fullName: 'María Gómez',
  email: 'maria@aduana.ve',
  role: 'Agente Aduanal',
  companyName: 'Aduanas del Norte C.A.',
  brokerLicense: 'SENIAT-4012',
  themePreference: 'light',
  defaultJurisdictionId: 've-seniat',
  defaultIncoterm: 'FOB',
  preferredCurrency: 'USD',
  detailLevel: 'standard',
  approvalWorkflowMode: 'agent_decides',
  autoOpenCanvas: true,
  updatedAt: '2026-11-25T10:00:00.000Z',
};

describe('IndexedDBAdapter and DualWritePersistence', () => {
  it('persists threads, SKU precedents, and user profile in-memory when indexedDB is unavailable', async () => {
    const adapter = new IndexedDBAdapter({ forceMemoryFallback: true });

    await adapter.saveThread(SAMPLE_THREAD);
    expect(await adapter.loadThreads()).toHaveLength(1);

    await adapter.saveSkuPrecedent(SAMPLE_SKU);
    expect((await adapter.loadSkuPrecedents())[0]?.sku).toBe('SG-INV5K');

    await adapter.saveUserProfile(SAMPLE_PROFILE);
    expect((await adapter.loadUserProfile())?.brokerLicense).toBe('SENIAT-4012');

    await adapter.deleteSkuPrecedent('sku-1');
    expect(await adapter.loadSkuPrecedents()).toHaveLength(0);

    await adapter.deleteThread('thread-1');
    expect(await adapter.loadThreads()).toHaveLength(0);
  });

  it('writes to local adapter and mirrors to cloud adapter without failing on cloud error', async () => {
    const local = new IndexedDBAdapter({ forceMemoryFallback: true });
    const saveThreadCloud = vi.fn<IPersistence['saveThread']>().mockRejectedValue(new Error('network down'));
    const cloud: IPersistence = {
      loadThreads: vi.fn<IPersistence['loadThreads']>().mockResolvedValue([]),
      saveThread: saveThreadCloud,
      deleteThread: vi.fn<IPersistence['deleteThread']>().mockResolvedValue(undefined),
      loadSkuPrecedents: vi.fn<IPersistence['loadSkuPrecedents']>().mockResolvedValue([]),
      saveSkuPrecedent: vi.fn<IPersistence['saveSkuPrecedent']>().mockResolvedValue(undefined),
      deleteSkuPrecedent: vi.fn<IPersistence['deleteSkuPrecedent']>().mockResolvedValue(undefined),
      loadUserProfile: vi.fn<IPersistence['loadUserProfile']>().mockResolvedValue(null),
      saveUserProfile: vi.fn<IPersistence['saveUserProfile']>().mockResolvedValue(undefined),
    };

    const dual = new DualWritePersistence(local, cloud);
    await dual.saveThread(SAMPLE_THREAD);

    expect(saveThreadCloud).toHaveBeenCalledWith(SAMPLE_THREAD);
    expect(await dual.loadThreads()).toEqual([SAMPLE_THREAD]);
  });
});
