import { describe, expect, it } from 'vitest';
import type { WorkspaceThread } from '../types';
import {
  deriveThreadProcessSnapshot,
  filterThreadsForProcessHub,
  formatRelativeThreadTime,
  groupThreadsForSidebar,
} from '../thread-process-meta';

function makeThread(overrides: Partial<WorkspaceThread> = {}): WorkspaceThread {
  return {
    id: 'thr-1',
    title: 'Bomba centrífuga',
    jurisdictionId: 've-seniat',
    status: 'regular',
    messages: [],
    createdAt: '2026-11-28T10:00:00.000Z',
    updatedAt: '2026-11-28T10:00:00.000Z',
    ...overrides,
  };
}

describe('thread-process-meta (Process Hub & Inbox-Zero sidebar helpers)', () => {
  it('derives processKind, operationalStatus, primaryHsCode, and itemProgress from envelopes and summary fields', () => {
    const summaryOnly = makeThread({
      processKind: 'invoice_batch',
      operationalStatus: 'needs_input',
      primaryHsCode: 'Lote · 12 ítems',
      itemProgress: { total: 12, completed: 9, needsInfo: 3 },
      messagesLoaded: false,
    });
    expect(deriveThreadProcessSnapshot(summaryOnly)).toMatchObject({
      processKind: 'invoice_batch',
      operationalStatus: 'needs_input',
      primaryHsCode: 'Lote · 12 ítems',
      itemProgress: { total: 12, completed: 9, needsInfo: 3 },
    });

    const sealedRuling = makeThread({
      messages: [
        {
          id: 'm1',
          role: 'assistant',
          text: 'Clasificado',
          createdAt: '2026-11-28T10:01:00.000Z',
          jurisdictionId: 've-seniat',
          envelope: {
            assistantMessage: 'Clasificado',
            classificationStatus: 'classified',
            inlineComponents: [
              {
                type: 'verdict',
                id: 'v1',
                hsCode: '8413.70.10.00',
                description: 'Bombas centrífugas',
                adValoremPercent: 5,
                vatPercent: 16,
                customsFeePercent: 1,
                legalRegimeCode: 'Libre',
                legalRegimeSummary: 'Sin restricciones',
                confidenceLabel: 'Alto',
                rgiApplied: ['RGI 1'],
              },
            ],
            canvasComponents: [
              {
                type: 'dossier',
                id: 'd1',
                title: 'Bomba',
                hsCode: '8413.70.10.00',
                officialDescription: 'Bombas centrífugas',
                jurisdictionName: 'Venezuela',
                reviewStatus: 'approved',
                technicalSpecs: [],
                rgiSteps: [],
                legalNotes: [],
                permits: [],
                flags: [],
              },
            ],
          },
        },
      ],
    });
    expect(deriveThreadProcessSnapshot(sealedRuling)).toMatchObject({
      processKind: 'single_ruling',
      operationalStatus: 'approved',
      primaryHsCode: '8413.70.10.00',
    });
  });

  it('splits sidebar into Hoy/Ayer/Anteriores active processes and 48h quick_lookup drawer, clearing approved processes', () => {
    const nowMs = new Date('2026-11-28T18:00:00.000Z').getTime();
    const todayActive = makeThread({ id: 'today', updatedAt: '2026-11-28T14:00:00.000Z' });
    const yesterdayActive = makeThread({ id: 'yday', updatedAt: '2026-11-27T14:00:00.000Z' });
    const olderActive = makeThread({ id: 'old', updatedAt: '2026-11-20T14:00:00.000Z' });
    const sealed = makeThread({
      id: 'sealed',
      operationalStatus: 'approved',
      updatedAt: '2026-11-28T15:00:00.000Z',
    });
    const recentLookup = makeThread({
      id: 'ql-recent',
      processKind: 'quick_lookup',
      updatedAt: '2026-11-28T12:00:00.000Z',
    });
    const expiredLookup = makeThread({
      id: 'ql-expired',
      processKind: 'quick_lookup',
      updatedAt: '2026-11-25T10:00:00.000Z',
    });

    const grouped = groupThreadsForSidebar(
      [todayActive, yesterdayActive, olderActive, sealed, recentLookup, expiredLookup],
      nowMs,
    );

    expect(grouped.buckets.today.map((t) => t.id)).toEqual(['today']);
    expect(grouped.buckets.yesterday.map((t) => t.id)).toEqual(['yday']);
    expect(grouped.buckets.older.map((t) => t.id)).toEqual(['old']);
    expect(grouped.recentQuickLookups.map((t) => t.id)).toEqual(['ql-recent']);
    expect(grouped.sealedCount).toBe(1);
    expect(grouped.activeCount).toBe(3);
  });

  it('excludes quick_lookup from Process Hub and filters by status, kind, clientRef, and query', () => {
    const threads: WorkspaceThread[] = [
      makeThread({
        id: 'p1',
        title: 'Concentrado bebidas',
        processKind: 'oga_escalation',
        operationalStatus: 'in_review',
        clientRef: 'Polar · BL-88',
        primaryHsCode: '2106.90.29.00',
      }),
      makeThread({
        id: 'p2',
        title: 'Factura repuestos',
        processKind: 'invoice_batch',
        operationalStatus: 'needs_input',
        clientRef: 'AutoPartes VE',
      }),
      makeThread({
        id: 'q1',
        title: '¿Qué es RGI 3b?',
        processKind: 'quick_lookup',
        operationalStatus: 'processing',
      }),
    ];

    expect(filterThreadsForProcessHub(threads, {}).map((t) => t.id)).toEqual(['p1', 'p2']);
    expect(filterThreadsForProcessHub(threads, { status: 'in_review' }).map((t) => t.id)).toEqual(['p1']);
    expect(filterThreadsForProcessHub(threads, { kind: 'invoice_batch' }).map((t) => t.id)).toEqual(['p2']);
    expect(filterThreadsForProcessHub(threads, { query: 'polar' }).map((t) => t.id)).toEqual(['p1']);
    expect(filterThreadsForProcessHub(threads, { clientRef: 'AutoPartes VE' }).map((t) => t.id)).toEqual(['p2']);
  });

  it('formats relative dates cleanly for today, yesterday, and older days', () => {
    const nowMs = new Date('2026-11-28T16:00:00.000Z').getTime();
    expect(formatRelativeThreadTime('2026-11-28T14:30:00.000Z', nowMs)).toMatch(/^\d{1,2}:\d{2}/);
    expect(formatRelativeThreadTime('2026-11-27T14:30:00.000Z', nowMs)).toBe('Ayer');
    expect(formatRelativeThreadTime('2026-11-20T14:30:00.000Z', nowMs)).toContain('20');
  });
});
