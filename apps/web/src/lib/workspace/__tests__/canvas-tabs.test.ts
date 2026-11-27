import { describe, expect, it } from 'vitest';
import type { A2UICanvasComponent } from '@tariffos/shared-types';
import {
  resolveConsolidatedTabs,
  resolveDefaultCanvasTab,
  resolveEffectiveCanvasTab,
  shouldShowArtifactStrip,
  shouldShowVersionHistory,
} from '../canvas-tabs';

const DOSSIER_COMP: A2UICanvasComponent = {
  type: 'dossier',
  id: 'dos-1',
  title: 'Dictamen Técnico',
  hsCode: '9018.12.10.00',
  officialDescription: 'Aparatos de diagnóstico por exploración ultrasónica',
  jurisdictionName: 'Venezuela (SENIAT)',
  rgiSteps: [],
  legalNotes: [],
  technicalSpecs: [],
  permits: [],
};

const CALCULATOR_COMP: A2UICanvasComponent = {
  type: 'calculator',
  id: 'calc-1',
  title: 'Cálculo Tributario',
  hsCode: '9018.12.10.00',
  adValoremPercent: 0,
  vatPercent: 16,
  customsServiceFeePercent: 1,
  currencyCode: 'USD',
  localCurrencyCode: 'VES',
  suggestedExchangeRate: 46.5,
  exemptionAvailable: false,
};

const BATCH_COMP: A2UICanvasComponent = {
  type: 'batch_manifest',
  id: 'batch-1',
  title: 'Lote Solar',
  currencyCode: 'USD',
  items: [],
};

describe('canvas-tabs dynamic A2UI contract', () => {
  it('opens directly on dossier for individual classifications and batch_manifest for batches', () => {
    expect(resolveDefaultCanvasTab([CALCULATOR_COMP, DOSSIER_COMP])).toBe('dossier');
    expect(resolveDefaultCanvasTab([DOSSIER_COMP, BATCH_COMP])).toBe('batch_manifest');
  });

  it('hides contextual tabs until emitted by agent or explicitly activated', () => {
    const baseTabs = resolveConsolidatedTabs({
      components: [DOSSIER_COMP],
      activeTab: 'dossier',
      unreadAlertsCount: 0,
    });

    expect(baseTabs.tabs.map((t) => t.id)).toEqual(['dossier']);
    expect(baseTabs.showCompareShortcut).toBe(true);
    expect(baseTabs.showRegulatoryShortcut).toBe(true);

    const withCalculator = resolveConsolidatedTabs({
      components: [DOSSIER_COMP, CALCULATOR_COMP],
      activeTab: 'dossier',
      unreadAlertsCount: 0,
    });
    expect(withCalculator.tabs.map((t) => t.id)).toEqual(['dossier', 'calculator']);

    const afterClickingCompare = resolveConsolidatedTabs({
      components: [DOSSIER_COMP],
      activeTab: 'rgi_comparator',
      unreadAlertsCount: 0,
    });
    expect(afterClickingCompare.tabs.map((t) => t.id)).toEqual(['dossier', 'rgi_comparator']);
    expect(afterClickingCompare.showCompareShortcut).toBe(false);

    const afterClickingRegulatory = resolveConsolidatedTabs({
      components: [DOSSIER_COMP],
      activeTab: 'regulatory_diff',
      unreadAlertsCount: 0,
    });
    expect(afterClickingRegulatory.tabs.map((t) => t.id)).toEqual(['dossier', 'regulatory_diff']);
    expect(afterClickingRegulatory.showRegulatoryShortcut).toBe(false);

    const afterClickingCalculateCif = resolveConsolidatedTabs({
      components: [DOSSIER_COMP],
      activeTab: 'calculator',
      unreadAlertsCount: 0,
    });
    expect(afterClickingCalculateCif.tabs.map((t) => t.id)).toEqual(['dossier', 'calculator']);
    expect(resolveEffectiveCanvasTab([DOSSIER_COMP], 'calculator')).toBe('calculator');
  });

  it('hides artifact strip when <= 1 artifact and version history when < 2 versions', () => {
    expect(shouldShowArtifactStrip(0)).toBe(false);
    expect(shouldShowArtifactStrip(1)).toBe(false);
    expect(shouldShowArtifactStrip(2)).toBe(true);

    expect(shouldShowVersionHistory(0)).toBe(false);
    expect(shouldShowVersionHistory(1)).toBe(false);
    expect(shouldShowVersionHistory(2)).toBe(true);
  });
});
