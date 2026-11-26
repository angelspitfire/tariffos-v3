import {
  formatHsCode,
  type A2UICalculatorComponent,
  type A2UIComparisonCandidate,
  A2UIDossierComponent,
  A2UILegalNoticeComponent,
  A2UIMerceologicalSheet,
  A2UIPermitItem,
  AgentReviewTrigger,
  ApprovalWorkflowMode,
  ClassificationLinePayload,
  GroundingSource,
  IncotermCode,
} from '@tariffos/shared-types';

export const DEFAULT_CUSTOMS_FEE_PERCENT = 1;
export const DEFAULT_EXCHANGE_RATE = 40;

export interface MapPayloadToA2UIOptions {
  jurisdictionName?: string;
  authority?: string;
  currencyCode?: string;
  localCurrencyCode?: string;
  customsFeePercent?: number;
  suggestedExchangeRate?: number;
  legalRegimeCode?: string;
  legalRegimeSummary?: string;
  legalNotes?: string[];
  technicalSpecs?: Array<{ key: string; value: string }>;
  incoterm?: IncotermCode;
  includeCalculator?: boolean;
  approvalWorkflowMode?: ApprovalWorkflowMode;
  agentReviewTrigger?: AgentReviewTrigger;
  merceologicalSheet?: A2UIMerceologicalSheet;
  webSources?: GroundingSource[];
  reasoningDepth?: 'standard' | 'deep';
}

export function extractPermitsFromFlags(payload: ClassificationLinePayload): A2UIPermitItem[] {
  return payload.flags.flatMap((flag) => {
    const match = flag.title.match(/OGA Permit:\s*(.+)/i);
    if (!match?.[1]) return [];
    const code = match[1].trim();
    return [{ code, name: flag.text, organism: code, mandatory: true }];
  });
}

export function buildLegalNoticeComponent(
  payload: ClassificationLinePayload,
  permits: A2UIPermitItem[],
  options: MapPayloadToA2UIOptions,
): A2UILegalNoticeComponent | null {
  const hasBlocking = payload.flags.some((f) => f.type === 'blocking');
  const hasWarn = payload.flags.some((f) => f.type === 'warn');
  const hasLegalRegime = Boolean(options.legalRegimeCode && options.legalRegimeCode !== 'General');
  if (!hasBlocking && !hasWarn && permits.length === 0 && !hasLegalRegime) return null;

  const severity: A2UILegalNoticeComponent['severity'] = hasBlocking
    ? 'restricted'
    : hasWarn || permits.length > 0
      ? 'warning'
      : 'info';
  const primaryFlag = payload.flags[0];
  return {
    type: 'legal_notice',
    id: `legal-${payload.lineId}`,
    severity,
    authority: options.authority ?? 'SENIAT / OGA',
    title: primaryFlag?.title ?? `Régimen Legal (${options.legalRegimeCode ?? 'OGA'})`,
    summary: primaryFlag?.text ?? options.legalRegimeSummary ?? `Verificación regulatoria para ${formatHsCode(payload.hsCode)}.`,
    requiredPermits: permits,
  };
}

export function buildComparisonCandidates(payload: ClassificationLinePayload): A2UIComparisonCandidate[] {
  const primary: A2UIComparisonCandidate = {
    hsCode: formatHsCode(payload.hsCode),
    title: payload.officialDescription,
    adValoremPercent: payload.duties.adValoremRate,
    vatPercent: payload.duties.ivaRate,
    legalRegime: 'Principal',
    rgiRationale: payload.confidenceReason,
    confidenceLabel: `${payload.confidenceLevel} (${payload.confidencePct}%)`,
    confidencePct: payload.confidencePct,
    whyApply: payload.confidenceReason,
    whyNot: '— (Principal)',
    pros: payload.confidenceReason,
    cons: 'Ninguna objeción principal',
    recommended: true,
  };
  return [
    primary,
    ...payload.alternatives.map((alt) => ({
      hsCode: formatHsCode(alt.code),
      title: alt.desc,
      adValoremPercent: payload.duties.adValoremRate,
      vatPercent: payload.duties.ivaRate,
      legalRegime: 'Alternativa',
      rgiRationale: alt.whyApply,
      confidenceLabel: `${alt.confLevel} (${alt.confPct}%)`,
      confidencePct: alt.confPct,
      whyApply: alt.whyApply,
      whyNot: alt.whyNot,
      pros: alt.whyApply,
      cons: alt.whyNot,
      recommended: false,
    })),
  ];
}

export function buildDossierComponent(
  payload: ClassificationLinePayload,
  permits: A2UIPermitItem[],
  options: MapPayloadToA2UIOptions,
  isBlocked: boolean,
): A2UIDossierComponent {
  const dossierFlags = payload.flags.map((f) => ({
    type: (f.type === 'info' ? 'info' : 'warn') as 'warn' | 'info',
    title: f.title,
    text: f.text,
  }));

  return {
    type: 'dossier',
    id: `dossier-${payload.lineId}`,
    title: `Dictamen · ${payload.product}`,
    hsCode: formatHsCode(payload.hsCode),
    officialDescription: payload.officialDescription,
    jurisdictionName: options.jurisdictionName ?? 'Venezuela (SENIAT · Decreto 4.944)',
    confidenceLevel: payload.confidenceLevel,
    confidencePct: payload.confidencePct,
    confidenceReason: payload.confidenceReason,
    rgiSteps: payload.rgiSteps.map((s) => ({
      rule: s.rule,
      note: s.note,
      items: s.items,
      application: s.items.join(' · ') || s.note,
      conclusion: s.conclusion,
    })),
    legalNotes: options.legalNotes ?? payload.rgiSteps.map((s) => s.note).filter(Boolean),
    technicalSpecs: options.technicalSpecs ?? [],
    permits: permits.map((p) => ({ code: p.code, name: p.name, organism: p.organism })),
    ...(payload.rejected.length > 0
      ? { rejectedAlternatives: payload.rejected.map((r) => ({ hsCode: formatHsCode(r.code), reason: r.reason, rule: r.rule })) }
      : {}),
    ...(dossierFlags.length > 0 ? { flags: dossierFlags } : {}),
    ...(payload.unresolved.length > 0 ? { unresolved: payload.unresolved.map((u) => u.item) } : {}),
    ...(options.webSources?.length ? { webSources: options.webSources } : {}),
    ...(options.merceologicalSheet ? { merceologicalSheet: options.merceologicalSheet } : {}),
    ...(options.agentReviewTrigger ? { agentReviewTrigger: options.agentReviewTrigger } : {}),
    ...(isBlocked ? { reviewStatus: 'in_review' as const } : {}),
    verifiedAgainstOfficial: payload.verifiedAgainstDb,
  };
}

export function buildCalculatorComponent(
  payload: ClassificationLinePayload,
  options: MapPayloadToA2UIOptions,
): A2UICalculatorComponent {
  const formattedHsCode = formatHsCode(payload.hsCode);
  return {
    type: 'calculator',
    id: `calc-${payload.lineId}`,
    title: `Tributos CIF · ${formattedHsCode}`,
    hsCode: formattedHsCode,
    adValoremPercent: payload.duties.adValoremRate,
    vatPercent: payload.duties.ivaRate,
    customsServiceFeePercent: options.customsFeePercent ?? DEFAULT_CUSTOMS_FEE_PERCENT,
    currencyCode: options.currencyCode ?? 'USD',
    localCurrencyCode: options.localCurrencyCode ?? 'VES',
    suggestedExchangeRate: options.suggestedExchangeRate ?? DEFAULT_EXCHANGE_RATE,
    exemptionAvailable: false,
    originCountry: payload.originCountry,
    ...(options.incoterm ? { incoterm: options.incoterm } : {}),
  };
}
