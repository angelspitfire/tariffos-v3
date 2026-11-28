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

function makeCloudStub(overrides: Partial<IPersistence> = {}): IPersistence {
  return {
    loadThreads: vi.fn<IPersistence['loadThreads']>().mockResolvedValue([]),
    saveThread: vi.fn<IPersistence['saveThread']>().mockResolvedValue(undefined),
    deleteThread: vi.fn<IPersistence['deleteThread']>().mockResolvedValue(undefined),
    loadSkuPrecedents: vi.fn<IPersistence['loadSkuPrecedents']>().mockResolvedValue([]),
    saveSkuPrecedent: vi.fn<IPersistence['saveSkuPrecedent']>().mockResolvedValue(undefined),
    deleteSkuPrecedent: vi.fn<IPersistence['deleteSkuPrecedent']>().mockResolvedValue(undefined),
    loadUserProfile: vi.fn<IPersistence['loadUserProfile']>().mockResolvedValue(null),
    saveUserProfile: vi.fn<IPersistence['saveUserProfile']>().mockResolvedValue(undefined),
    clearLocal: vi.fn<IPersistence['clearLocal']>().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('IndexedDBAdapter and DualWritePersistence', () => {
  it('persists, deletes, and clears threads, SKU precedents, and user profile in-memory', async () => {
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

    await adapter.saveThread(SAMPLE_THREAD);
    await adapter.saveSkuPrecedent(SAMPLE_SKU);
    await adapter.clearLocal();
    expect(await adapter.loadThreads()).toEqual([]);
    expect(await adapter.loadSkuPrecedents()).toEqual([]);
    expect(await adapter.loadUserProfile()).toBeNull();
  });

  it('falls back to local cache when cloud throws on load or save', async () => {
    const local = new IndexedDBAdapter({ forceMemoryFallback: true });
    const saveThreadCloud = vi.fn<IPersistence['saveThread']>().mockRejectedValue(new Error('network down'));
    const cloud = makeCloudStub({
      loadThreads: vi.fn<IPersistence['loadThreads']>().mockRejectedValue(new Error('network down')),
      saveThread: saveThreadCloud,
    });

    const dual = new DualWritePersistence(local, cloud);
    await dual.saveThread(SAMPLE_THREAD);

    expect(saveThreadCloud).toHaveBeenCalledWith(SAMPLE_THREAD);
    expect(await dual.loadThreads()).toEqual([SAMPLE_THREAD]);

    await dual.clearLocal();
    expect(await local.loadThreads()).toEqual([]);
  });

  it('treats successful cloud load (even empty array) as authoritative so deleted items do not resurrect', async () => {
    const local = new IndexedDBAdapter({ forceMemoryFallback: true });
    await local.saveThread(SAMPLE_THREAD);
    await local.saveSkuPrecedent(SAMPLE_SKU);

    const cloud = makeCloudStub({
      loadThreads: vi.fn<IPersistence['loadThreads']>().mockResolvedValue([]),
      loadSkuPrecedents: vi.fn<IPersistence['loadSkuPrecedents']>().mockResolvedValue([]),
    });

    const dual = new DualWritePersistence(local, cloud);
    expect(await dual.loadThreads()).toEqual([]);
    expect(await dual.loadSkuPrecedents()).toEqual([]);
  });

  it('loadLocalBootstrap hydrates threads, SKUs, and profile immediately from IndexedDB without waiting for cloud', async () => {
    const local = new IndexedDBAdapter({ forceMemoryFallback: true });
    await local.saveThread(SAMPLE_THREAD);
    await local.saveSkuPrecedent(SAMPLE_SKU);
    await local.saveUserProfile(SAMPLE_PROFILE);

    const cloudLoadThreads = vi.fn<IPersistence['loadThreads']>().mockResolvedValue([]);
    const cloud = makeCloudStub({ loadThreads: cloudLoadThreads });

    const dual = new DualWritePersistence(local, cloud);
    const localState = await dual.loadLocalBootstrap();

    expect(localState.threads).toEqual([SAMPLE_THREAD]);
    expect(localState.skuPrecedents).toEqual([SAMPLE_SKU]);
    expect(localState.profile).toEqual(SAMPLE_PROFILE);
    expect(cloudLoadThreads).not.toHaveBeenCalled();
  });

  it('coalesces rapid consecutive saveThread calls to cloud when cloudSaveDebounceMs is set while writing local immediately', async () => {
    vi.useFakeTimers();
    const local = new IndexedDBAdapter({ forceMemoryFallback: true });
    const saveThreadCloud = vi.fn<IPersistence['saveThread']>().mockResolvedValue(undefined);
    const cloud = makeCloudStub({ saveThread: saveThreadCloud });

    const dual = new DualWritePersistence(local, cloud, { cloudSaveDebounceMs: 400 });
    await dual.saveThread({ ...SAMPLE_THREAD, title: 'v1' });
    await dual.saveThread({ ...SAMPLE_THREAD, title: 'v2' });
    await dual.saveThread({ ...SAMPLE_THREAD, title: 'v3' });

    // Local storage reflects latest immediately; cloud hasn't been hammered yet.
    expect((await local.loadThreads())[0]?.title).toBe('v3');
    expect(saveThreadCloud).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(450);
    expect(saveThreadCloud).toHaveBeenCalledTimes(1);
    expect(saveThreadCloud).toHaveBeenCalledWith(expect.objectContaining({ title: 'v3' }));
    vi.useRealTimers();
  });

  it('writes cloud-loaded threads, SKUs, and profile back into local IndexedDB so subsequent loadLocalBootstrap hydrates immediately', async () => {
    const local = new IndexedDBAdapter({ forceMemoryFallback: true });
    const cloud = makeCloudStub({
      loadThreads: vi.fn<IPersistence['loadThreads']>().mockResolvedValue([SAMPLE_THREAD]),
      loadSkuPrecedents: vi.fn<IPersistence['loadSkuPrecedents']>().mockResolvedValue([SAMPLE_SKU]),
      loadUserProfile: vi.fn<IPersistence['loadUserProfile']>().mockResolvedValue(SAMPLE_PROFILE),
    });

    const dual = new DualWritePersistence(local, cloud);
    await dual.loadThreads();
    await dual.loadSkuPrecedents();
    await dual.loadUserProfile();

    const cached = await dual.loadLocalBootstrap();
    expect(cached.threads).toEqual([SAMPLE_THREAD]);
    expect(cached.skuPrecedents).toEqual([SAMPLE_SKU]);
    expect(cached.profile).toEqual(SAMPLE_PROFILE);
  });

  it('preserves locally cached messages when remote loadThreads returns summary headers (messagesLoaded: false) with equal or older updatedAt', async () => {
    const local = new IndexedDBAdapter({ forceMemoryFallback: true });
    const fullLocalThread: WorkspaceThread = {
      ...SAMPLE_THREAD,
      messagesLoaded: true,
      messages: [
        {
          id: 'm1',
          role: 'user',
          text: 'Ecógrafo portátil Doppler',
          createdAt: '2026-11-25T10:00:00.000Z',
          jurisdictionId: 've-seniat',
        },
      ],
    };
    await local.saveThread(fullLocalThread);

    const remoteSummary: WorkspaceThread = {
      ...SAMPLE_THREAD,
      clientRef: 'Clinica Avila · OC-12',
      messagesLoaded: false,
      messages: [],
    };
    const cloud = makeCloudStub({
      loadThreads: vi.fn<IPersistence['loadThreads']>().mockResolvedValue([remoteSummary]),
    });

    const dual = new DualWritePersistence(local, cloud);
    const merged = await dual.loadThreads();

    expect(merged).toHaveLength(1);
    expect(merged[0]?.clientRef).toBe('Clinica Avila · OC-12');
    expect(merged[0]?.messagesLoaded).toBe(true);
    expect(merged[0]?.messages).toHaveLength(1);
    expect(merged[0]?.messages[0]?.text).toBe('Ecógrafo portátil Doppler');
  });
});
