import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  discardLegalDraft,
  DraftDateCollisionError,
  populateChunkSearchVectors,
  publishLegalDraft,
  stageLegalDocumentDraft,
} from '../ingestion/lifecycle-service';
import { sunsetOverlappingRecords } from '../derogation';

type MockFn = (...args: unknown[]) => Promise<unknown>;

function createMockDb() {
  const tx = {
    legalKnowledgeParent: {
      findUnique: vi.fn<MockFn>(),
      findFirst: vi.fn<MockFn>(),
      findMany: vi.fn<MockFn>(),
      create: vi.fn<MockFn>(),
      update: vi.fn<MockFn>(),
      updateMany: vi.fn<MockFn>(),
      delete: vi.fn<MockFn>(),
    },
    legalKnowledgeChunk: {
      deleteMany: vi.fn<MockFn>(),
      createMany: vi.fn<MockFn>(),
      findMany: vi.fn<MockFn>(),
    },
    nationalTariff: {
      findMany: vi.fn<MockFn>(),
      upsert: vi.fn<MockFn>(),
      updateMany: vi.fn<MockFn>(),
    },
    country: {
      findUnique: vi.fn<MockFn>(),
      update: vi.fn<MockFn>(),
    },
    $executeRaw: vi.fn<MockFn>(),
  };

  const db = {
    ...tx,
    $transaction: vi.fn<(fn: (client: typeof tx) => Promise<unknown>) => Promise<unknown>>(
      async (fn) => fn(tx),
    ),
  };
  return { db, tx };
}

describe('derogation & lifecycle-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sunsetOverlappingRecords requires non-empty hierarchyPath and filters by exact (countryCode, legalType, hierarchyPath)', async () => {
    const { tx } = createMockDb();
    await expect(
      sunsetOverlappingRecords(tx as never, {
        draftId: 'd1',
        countryCode: 'VE',
        legalType: 'LEGAL_NOTE',
        hierarchyPath: '  ',
        validFromDate: new Date('2024-04-25T00:00:00.000Z'),
      }),
    ).rejects.toThrow(/hierarchyPath/i);

    tx.legalKnowledgeParent.findMany.mockResolvedValue([{ id: 'old-1' }]);
    const result = await sunsetOverlappingRecords(tx as never, {
      draftId: 'd1',
      countryCode: 'VE',
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
      validFromDate: new Date('2024-04-25T00:00:00.000Z'),
    });

    expect(tx.legalKnowledgeParent.findMany).toHaveBeenCalledWith({
      where: {
        id: { not: 'd1' },
        countryCode: 'VE',
        legalType: 'LEGAL_NOTE',
        hierarchyPath: 'loa',
        isDerogated: false,
        status: 'PUBLISHED',
        validFromDate: { lte: new Date('2024-04-25T00:00:00.000Z') },
      },
      select: { id: true },
    });
    expect(tx.legalKnowledgeParent.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['old-1'] } },
      data: {
        isDerogated: true,
        status: 'DEROGATED',
        validToDate: new Date(new Date('2024-04-25T00:00:00.000Z').getTime() - 1),
      },
    });
    expect(result).toEqual(['old-1']);
  });

  it('stageLegalDocumentDraft updates existing DRAFT in-place and handles same-date PUBLISHED collision', async () => {
    const { db, tx } = createMockDb();
    tx.legalKnowledgeParent.findFirst.mockResolvedValue({
      id: 'draft-existing',
      status: 'DRAFT',
      validFromDate: new Date('2024-04-25T00:00:00.000Z'),
    });
    tx.legalKnowledgeParent.update.mockResolvedValue({
      id: 'draft-existing',
      countryCode: 'VE',
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
      status: 'DRAFT',
      validFromDate: new Date('2024-04-25T00:00:00.000Z'),
    });

    const updated = await stageLegalDocumentDraft(db as never, {
      countryCode: 'VE',
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
      title: 'LOA',
      content: 'Artículo 1. Nuevo texto.',
      validFromDate: new Date('2024-04-25T00:00:00.000Z'),
      chunks: [{ heading: 'LOA', ruleNumber: '1', content: 'Artículo 1. Nuevo texto.', scope: [], chunkIndex: 0 }],
    });
    expect(updated.parentId).toBe('draft-existing');
    expect(tx.legalKnowledgeChunk.deleteMany).toHaveBeenCalledWith({ where: { parentId: 'draft-existing' } });

    tx.legalKnowledgeParent.findFirst.mockResolvedValueOnce({
      id: 'pub-existing',
      status: 'PUBLISHED',
      validFromDate: new Date('2024-04-25T00:00:00.000Z'),
    });
    await expect(
      stageLegalDocumentDraft(db as never, {
        countryCode: 'VE',
        legalType: 'LEGAL_NOTE',
        hierarchyPath: 'loa',
        title: 'LOA',
        content: 'Texto',
        validFromDate: new Date('2024-04-25T00:00:00.000Z'),
        replaceSameDate: false,
        chunks: [],
      }),
    ).rejects.toBeInstanceOf(DraftDateCollisionError);

    tx.legalKnowledgeParent.findFirst
      .mockResolvedValueOnce({ id: 'pub-existing', status: 'PUBLISHED', validFromDate: new Date('2024-04-25T00:00:00.000Z') })
      .mockResolvedValueOnce(null);
    tx.legalKnowledgeParent.create.mockResolvedValue({
      id: 'draft-bumped',
      countryCode: 'VE',
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
      status: 'DRAFT',
      validFromDate: new Date('2024-04-25T00:00:01.000Z'),
    });

    const bumped = await stageLegalDocumentDraft(db as never, {
      countryCode: 'VE',
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
      title: 'LOA',
      content: 'Texto',
      validFromDate: new Date('2024-04-25T00:00:00.000Z'),
      replaceSameDate: true,
      chunks: [{ heading: 'LOA', ruleNumber: '1', content: 'Texto', scope: [], chunkIndex: 0 }],
    });
    expect(bumped.validFromDate.toISOString()).toBe('2024-04-25T00:00:01.000Z');
  });

  it('publishLegalDraft rejects non-DRAFT, derogates prior PUBLISHED, and discards only DRAFT', async () => {
    const { db, tx } = createMockDb();
    tx.legalKnowledgeParent.findUnique.mockResolvedValue({
      id: 'pub-1',
      status: 'PUBLISHED',
      countryCode: 'VE',
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
      validFromDate: new Date('2024-04-25T00:00:00.000Z'),
    });
    await expect(publishLegalDraft(db as never, 'pub-1')).rejects.toThrow(/DRAFT/i);
    await expect(discardLegalDraft(db as never, 'pub-1')).rejects.toThrow(/DRAFT/i);

    tx.legalKnowledgeParent.findUnique.mockResolvedValue({
      id: 'draft-1',
      status: 'DRAFT',
      countryCode: 'VE',
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
      validFromDate: new Date('2024-04-25T00:00:00.000Z'),
      content: '',
      decreeNumber: 'Decreto 4.944',
    });
    tx.legalKnowledgeParent.findMany.mockResolvedValue([{ id: 'old-pub' }]);
    tx.legalKnowledgeParent.update.mockResolvedValue({
      id: 'draft-1',
      status: 'PUBLISHED',
      countryCode: 'VE',
      legalType: 'LEGAL_NOTE',
      hierarchyPath: 'loa',
    });

    const published = await publishLegalDraft(db as never, 'draft-1');
    expect(published.derogatedIds).toEqual(['old-pub']);
    expect(published.status).toBe('PUBLISHED');

    await populateChunkSearchVectors(db as never, 'draft-1');
    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
  });
});
