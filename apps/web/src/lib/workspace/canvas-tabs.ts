import type { A2UICanvasComponent, CanvasTabType } from '@tariffos/shared-types';

export type ConsolidatedTabId =
  | 'batch_manifest'
  | 'dossier'
  | 'calculator'
  | 'rgi_comparator'
  | 'regulatory_diff';

export interface ConsolidatedCanvasTabDef {
  id: ConsolidatedTabId;
  label: string;
  targetTab: CanvasTabType;
  matchesTabs: readonly CanvasTabType[];
  badgeCount?: number;
}

export interface ResolveConsolidatedTabsInput {
  components: readonly A2UICanvasComponent[];
  activeTab: CanvasTabType;
  unreadAlertsCount: number;
}

export interface ResolvedConsolidatedTabs {
  tabs: ConsolidatedCanvasTabDef[];
  showCalculatorShortcut?: boolean;
  showCompareShortcut: boolean;
  showRegulatoryShortcut: boolean;
}

export function resolveDefaultCanvasTab(
  components: readonly A2UICanvasComponent[]
): CanvasTabType {
  if (components.some((c) => c.type === 'batch_manifest')) {
    return 'batch_manifest';
  }
  if (components.some((c) => c.type === 'dossier')) {
    return 'dossier';
  }
  if (components.some((c) => c.type === 'calculator')) {
    return 'calculator';
  }
  if (components.some((c) => c.type === 'hierarchy')) {
    return 'hierarchy';
  }
  return 'dossier';
}

export function resolveConsolidatedTabs(
  input: ResolveConsolidatedTabsInput
): ResolvedConsolidatedTabs {
  const { components, activeTab, unreadAlertsCount } = input;
  if (components.length === 0) {
    return { tabs: [], showCompareShortcut: false, showRegulatoryShortcut: false };
  }

  const hasBatch = components.some((c) => c.type === 'batch_manifest');
  const dossier = components.find((c) => c.type === 'dossier');
  const hasCalculator = components.some((c) => c.type === 'calculator');
  const hasHierarchy = components.some((c) => c.type === 'hierarchy');
  const hasComparison = components.some((c) => c.type === 'comparison');

  const hasRgiOrCompareContext =
    hasHierarchy ||
    hasComparison ||
    Boolean(
      dossier &&
        dossier.type === 'dossier' &&
        (dossier.rgiSteps.length > 0 || (dossier.rejectedAlternatives?.length ?? 0) > 0)
    ) ||
    activeTab === 'rgi_comparator' ||
    activeTab === 'comparison' ||
    activeTab === 'hierarchy';

  const hasRegulatoryContext = unreadAlertsCount > 0 || activeTab === 'regulatory_diff';
  const hasCalculatorContext = hasCalculator || Boolean(dossier && activeTab === 'calculator');

  const tabs: ConsolidatedCanvasTabDef[] = [];

  if (hasBatch) {
    tabs.push({
      id: 'batch_manifest',
      label: 'Lote',
      targetTab: 'batch_manifest',
      matchesTabs: ['batch_manifest'],
    });
  }

  if (dossier || !hasBatch) {
    tabs.push({
      id: 'dossier',
      label: 'Dictamen',
      targetTab: 'dossier',
      matchesTabs: ['dossier'],
    });
  }

  if (hasCalculatorContext) {
    tabs.push({
      id: 'calculator',
      label: 'Tributos CIF',
      targetTab: 'calculator',
      matchesTabs: ['calculator'],
    });
  }

  if (hasRgiOrCompareContext) {
    tabs.push({
      id: 'rgi_comparator',
      label: 'RGI y Comparador',
      targetTab: 'rgi_comparator',
      matchesTabs: ['rgi_comparator', 'comparison', 'hierarchy'],
    });
  }

  if (hasRegulatoryContext) {
    tabs.push({
      id: 'regulatory_diff',
      label: 'Normativa',
      targetTab: 'regulatory_diff',
      matchesTabs: ['regulatory_diff'],
    });
  }

  return {
    tabs,
    showCalculatorShortcut: Boolean(dossier) && !hasCalculatorContext,
    showCompareShortcut: !hasRgiOrCompareContext,
    showRegulatoryShortcut: !hasRegulatoryContext,
  };
}

export function shouldShowArtifactStrip(openArtifactsCount: number): boolean {
  return openArtifactsCount > 1;
}

export function shouldShowVersionHistory(versionCount: number): boolean {
  return versionCount >= 2;
}

/** Resolves a valid active canvas tab, falling back to priority component tabs. */
export function resolveEffectiveCanvasTab(
  components: readonly A2UICanvasComponent[],
  activeTab: CanvasTabType,
): CanvasTabType {
  const has = (type: A2UICanvasComponent['type']) => components.some((c) => c.type === type);
  const dossier = has('dossier');
  const calculator = has('calculator');
  const hierarchy = has('hierarchy');
  const comparison = has('comparison');
  const batch = has('batch_manifest');

  if (
    (activeTab === 'batch_manifest' && batch) ||
    (activeTab === 'dossier' && dossier) ||
    (activeTab === 'calculator' && (calculator || dossier)) ||
    (activeTab === 'hierarchy' && hierarchy) ||
    (activeTab === 'comparison' && comparison) ||
    (activeTab === 'rgi_comparator' && (dossier || comparison || hierarchy)) ||
    (activeTab === 'regulatory_diff' && dossier)
  ) {
    return activeTab;
  }

  if (batch) return 'batch_manifest';
  if (dossier) return 'dossier';
  if (calculator) return 'calculator';
  if (hierarchy) return 'hierarchy';
  if (comparison) return 'comparison';
  return activeTab;
}
