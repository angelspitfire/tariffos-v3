/**
 * Unit tests for the adapter contracts (IFilingRepository, IChatRepository, ITariffRepository).
 *
 * These tests verify the interface contracts are correctly implemented
 * by the MockFilingRepository and InsForgeFilingRepository.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  IFilingRepository,
  IChatRepository,
  ITariffRepository,
} from '@/adapters/filing-repository';
import type { TariffFilters } from '@/types/tariff-reference';
import { MockFilingRepository, InsForgeFilingRepository, createFilingRepository } from '@/adapters';
import type { FilingRecord } from '@/lib/filings-catalog';
import type { ChatMessage } from '@/domain/repositories';


// ------------- Test constants -------------

const TEST_FILING_ID = 'TR-2024-TEST-001';
const TEST_FILING: FilingRecord = {
  id: TEST_FILING_ID,
  code: TEST_FILING_ID,
  title: 'Test Filing',
  route: 'Test Route',
  channel: 'green' as const,
  reasons: [],
  documents: [],
  manifestArtifact: {
    id: 'art-test',
    type: 'batch-manifest',
    title: 'Test Manifest',
    subtitle: 'Test',
    badge: 'Single',
    version: 1,
    timestamp: '00:00',
    data: {
      filingId: TEST_FILING_ID,
      mode: 'single',
      items: [],
      totalCif: 0,
      totalDuties: 0,
    },
  },
};

const TEST_MESSAGE: ChatMessage = {
  id: 'msg-001',
  filingId: TEST_FILING_ID,
  role: 'user',
  content: 'Test message',
  timestamp: new Date(),
};

const TEST_TARIFF_FILTERS: TariffFilters = {
  chapter: [],
  dutyRange: [0, 30],
  status: [],
  unit: [],
  query: 'test',
};

const TEST_CHAPTER_CODE = '9401';

// ------------- MockFilingRepository Tests -------------

describe('MockFilingRepository', () => {
  let repo: IFilingRepository & IChatRepository & ITariffRepository;

  beforeEach(() => {
    // Clean localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tariffos_active_filing');
      localStorage.removeItem('tariffos_open_tabs');
      localStorage.removeItem('tariffos_all_filings');
      const msgKeyPrefix = 'tariffos_messages_';
      // Remove any stored messages
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(msgKeyPrefix)) {
          localStorage.removeItem(key);
        }
      }
    }
    repo = new MockFilingRepository();
  });

  describe('IFilingRepository', () => {
    it('getAllFilings returns all mock filings', async () => {
      const filings = await repo.getAllFilings();
      expect(filings.length).toBe(3);
      expect(filings).toContainEqual(expect.objectContaining({
        id: 'TR-2024-8849-VE',
      }));
    });

    it('getFilingById returns correct filing', async () => {
      const filing = await repo.getFilingById('TR-2024-8849-VE');
      expect(filing).not.toBeNull();
      expect(filing?.id).toBe('TR-2024-8849-VE');
      expect(filing?.title).toBe('Electrónica · Shanghai → La Guaira');
    });

    it('getFilingById returns null for non-existent id', async () => {
      const filing = await repo.getFilingById('non-existent');
      expect(filing).toBeNull();
    });

    it('createFiling stores and returns the filing', async () => {
      const created = await repo.createFiling(TEST_FILING);
      expect(created.id).toBe(TEST_FILING_ID);
      const allFilings = await repo.getAllFilings();
      expect(allFilings).toContainEqual(TEST_FILING);
    });

    it('updateFiling merges patch with existing', async () => {
      // First create
      await repo.createFiling(TEST_FILING);
      // Then update
      const patch = { title: 'Updated Title' };
      const updated = await repo.updateFiling(TEST_FILING_ID, patch);
      expect(updated.title).toBe('Updated Title');
      // Verify original reasons preserved
      expect(updated.reasons).toEqual(TEST_FILING.reasons);
    });

    it('deleteFiling removes the filing', async () => {
      await repo.createFiling(TEST_FILING);
      await repo.deleteFiling(TEST_FILING_ID);
      const filings = await repo.getAllFilings();
      expect(filings).not.toContainEqual(TEST_FILING);
    });

    it('deleteFiling clears active filing if it was the active one', async () => {
      await repo.createFiling(TEST_FILING);
      await repo.setActiveFilingId(TEST_FILING_ID);
      expect(await repo.getActiveFilingId()).toBe(TEST_FILING_ID);
      await repo.deleteFiling(TEST_FILING_ID);
      expect(await repo.getActiveFilingId()).toBeNull();
    });

    it('getActiveFilingId returns null when none set', async () => {
      const active = await repo.getActiveFilingId();
      expect(active).toBeNull();
    });

    it('setActiveFilingId stores and retrieves the ID', async () => {
      await repo.setActiveFilingId(TEST_FILING_ID);
      const active = await repo.getActiveFilingId();
      expect(active).toBe(TEST_FILING_ID);
    });
  });

  describe('IChatRepository', () => {
    beforeEach(async () => {
      await repo.createFiling(TEST_FILING);
    });

    it('getMessages returns empty array for new filing', async () => {
      const messages = await repo.getMessages(TEST_FILING_ID);
      expect(messages).toEqual([]);
    });

    it('addMessage stores a message', async () => {
      await repo.addMessage(TEST_FILING_ID, TEST_MESSAGE);
      const messages = await repo.getMessages(TEST_FILING_ID);
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Test message');
    });

    it('addMessage appends to existing messages', async () => {
      await repo.addMessage(TEST_FILING_ID, TEST_MESSAGE);
      await repo.addMessage(TEST_FILING_ID, TEST_MESSAGE);
      const messages = await repo.getMessages(TEST_FILING_ID);
      expect(messages).toHaveLength(2);
    });

    it('clearMessages removes all messages for a filing', async () => {
      await repo.addMessage(TEST_FILING_ID, TEST_MESSAGE);
      await repo.clearMessages(TEST_FILING_ID);
      const messages = await repo.getMessages(TEST_FILING_ID);
      expect(messages).toEqual([]);
    });
  });

  describe('ITariffRepository', () => {
    it('searchTariff returns empty array (mock fallback)', async () => {
      const results = await repo.searchTariff('test query', TEST_TARIFF_FILTERS);
      expect(results).toEqual([]);
    });

    it('getTarItem returns null (mock fallback)', async () => {
      const item = await repo.getTarItem(TEST_CHAPTER_CODE);
      expect(item).toBeNull();
    });

    it('getChapters returns empty array (mock fallback)', async () => {
      const chapters = await repo.getChapters();
      expect(chapters).toEqual([]);
    });
  });
});

// ------------- InsForgeFilingRepository Tests -------------

describe('InsForgeFilingRepository', () => {
  let repo: IFilingRepository & IChatRepository & ITariffRepository;

  beforeEach(() => {
    repo = new InsForgeFilingRepository();
  });

  describe('IFilingRepository', () => {
    it('getAllFilings throws "Not implemented"', async () => {
      await expect(repo.getAllFilings()).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });

    it('getFilingById throws "Not implemented"', async () => {
      await expect(repo.getFilingById('any-id')).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });

    it('createFiling throws "Not implemented"', async () => {
      await expect(repo.createFiling(TEST_FILING)).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });

    it('updateFiling throws "Not implemented"', async () => {
      await expect(repo.updateFiling('id', {})).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });

    it('deleteFiling throws "Not implemented"', async () => {
      await expect(repo.deleteFiling('id')).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });

    it('getActiveFilingId throws "Not implemented"', async () => {
      await expect(repo.getActiveFilingId()).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });

    it('setActiveFilingId throws "Not implemented"', async () => {
      await expect(repo.setActiveFilingId('id')).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });
  });

  describe('IChatRepository', () => {
    it('getMessages throws "Not implemented"', async () => {
      await expect(repo.getMessages('any-filing')).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });

    it('addMessage throws "Not implemented"', async () => {
      await expect(repo.addMessage('any-filing', TEST_MESSAGE)).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });

    it('clearMessages throws "Not implemented"', async () => {
      await expect(repo.clearMessages('any-filing')).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });
  });

  describe('ITariffRepository', () => {
    it('searchTariff throws "Not implemented"', async () => {
      await expect(repo.searchTariff('query', TEST_TARIFF_FILTERS)).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });

    it('getTarItem throws "Not implemented"', async () => {
      await expect(repo.getTarItem(TEST_CHAPTER_CODE)).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });

    it('getChapters throws "Not implemented"', async () => {
      await expect(repo.getChapters()).rejects.toThrow(
        'Not implemented - requires InsForge backend integration'
      );
    });
  });
});

// ------------- createFilingRepository factory Tests -------------

describe('createFilingRepository', () => {
  it('defaults to MockFilingRepository when USE_INSFORGE is not set', () => {
    const repo = createFilingRepository();
    expect(repo).toBeInstanceOf(MockFilingRepository);
  });

  it('returns InsForgeFilingRepository when NEXT_PUBLIC_USE_INSFORGE=true', () => {
    // This test verifies the logic; the actual env var is set at runtime
    const originalEnv = process.env.NEXT_PUBLIC_USE_INSFORGE;
    process.env.NEXT_PUBLIC_USE_INSFORGE = 'true';
    try {
      const repo = createFilingRepository();
      expect(repo).toBeInstanceOf(InsForgeFilingRepository);
    } finally {
      if (originalEnv === undefined) {
        delete process.env.NEXT_PUBLIC_USE_INSFORGE;
      } else {
        process.env.NEXT_PUBLIC_USE_INSFORGE = originalEnv;
      }
    }
  });

  it('can explicitly request mock type', () => {
    const repo = createFilingRepository('mock');
    expect(repo).toBeInstanceOf(MockFilingRepository);
  });

  it('can explicitly request insforge type', () => {
    const repo = createFilingRepository('insforge');
    expect(repo).toBeInstanceOf(InsForgeFilingRepository);
  });
});