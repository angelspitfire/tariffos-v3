import type {
  A2UICalculatorComponent,
  A2UICanvasComponent,
  JurisdictionConfig,
  UserProfileSettings,
} from '@tariffos/shared-types';
import type { WorkspaceMessage } from './types';

/**
 * Returns the explicit `A2UICalculatorComponent` when emitted by the agent,
 * or synthesizes an interactive calculator from the active `dossier` + matching
 * `verdict` tariff rates so 1-click "Calcular CIF" always mounts `DutyCalculatorView`.
 */
export function resolveEffectiveCalculatorComponent(params: {
  components: readonly A2UICanvasComponent[];
  jurisdiction: JurisdictionConfig;
  profile: UserProfileSettings;
  messages?: readonly WorkspaceMessage[];
  activeArtifactId?: string | null;
}): A2UICalculatorComponent | undefined {
  const { components, jurisdiction, profile, messages = [], activeArtifactId = null } = params;
  const explicit = components.find((c) => c.type === 'calculator');
  if (explicit) return explicit;

  const dossier = components.find((c) => c.type === 'dossier');
  if (!dossier) return undefined;

  const matchingMsg = activeArtifactId
    ? messages.find((m) => m.id === activeArtifactId)
    : [...messages]
        .reverse()
        .find((m) => m.envelope?.canvasComponents.some((c) => c.id === dossier.id));

  const verdict = matchingMsg?.envelope?.inlineComponents.find((c) => c.type === 'verdict');

  return {
    type: 'calculator',
    id: `calc-fallback-${dossier.id}`,
    title: `Liquidación CIF · ${dossier.hsCode}`,
    hsCode: dossier.hsCode,
    adValoremPercent: verdict?.adValoremPercent ?? 0,
    vatPercent: verdict?.vatPercent ?? jurisdiction.defaultVatPercent,
    customsServiceFeePercent: verdict?.customsFeePercent ?? jurisdiction.customsFeePercent,
    currencyCode: profile.preferredCurrency || jurisdiction.currencyCode,
    localCurrencyCode: jurisdiction.localCurrencyCode,
    suggestedExchangeRate: jurisdiction.defaultExchangeRate,
    exemptionAvailable: false,
    incoterm: profile.defaultIncoterm,
  };
}
