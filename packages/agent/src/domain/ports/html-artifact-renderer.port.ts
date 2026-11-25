/**
 * IHtmlArtifactRenderer - Port for rendering interactive HTML classification artifacts.
 * Shared engine across all countries; country-specific data passed at render time.
 * 
 * @package apps/agent/src/infrastructure/rendering
 * @layer Infrastructure Port
 */
export interface ClassificationResult {
  product: string;
  code: string;
  description: string;
  rate: string;
  unit: string;
  origin: string;
  date: string;
  confidenceLevel: string;       // Localized: 'Alto'/'Medio'/'Bajo' or 'High'/'Medium'/'Low'
  confidencePct: string;
  confidenceReason: string;
  conclusion: string;            // HTML-safe string
  rgiSteps: RgiStep[];
  alternatives: Alternative[];
  rejected: RejectedAlternative[];
  flags: Flag[];
  unresolved: UnresolvedItem[];
  verification: string[];
  verifyTitle: string;
}

export interface RgiStep {
  rule: string;                  // e.g., 'RGI 1', 'RGI 3b', 'RGI 6'
  note: string;                  // Legal note cited
  items: string[];               // Evidence items
  conclusion: string;
}

export interface Alternative {
  code: string;
  desc: string;
  confLevel: 'alto' | 'medio' | 'bajo' | 'high' | 'medium' | 'low';
  confLabel: string;
  whyApply: string;
  whyNot: string;
}

export interface RejectedAlternative {
  code: string;
  reason: string;
  rule: string;
}

export interface Flag {
  type: 'warn' | 'info' | 'error';
  title: string;
  text: string;
}

export interface UnresolvedItem {
  item: string;
  source: string;
  resolved: boolean;
}

export interface CountryTemplateData {
  countryCode: string;
  countryName: string;
  codeFormat: string;                    // 'xxxx.xx.xx.xx'
  tariffSystemLabel: string;             // 'NCM (Mercosur)', 'HTS (US)', etc.
  officialSourceName: string;            // 'Decreto 4.944'
  permitAgencyLabels: Record<string, string>;
  confidenceLabels: Record<string, string>;
  rgiStepLabels: string[];
  locale: string;                        // 'es-VE', 'en-US', etc.
  theme: 'light' | 'dark' | 'auto';
}

export interface IHtmlArtifactRenderer {
  /** 
   * Render classification result to self-contained interactive HTML.
   * Output includes: RGI Canvas diagram, multi-product tabs, theme switch, print-only toolbar.
   * Validated by: contrast.mjs, audit.mjs, html_preview (728px dark+light), consoleMessages: []
   */
  render(input: ClassificationResult, templateData: CountryTemplateData): Promise<string>;

  /** Render batch classification (multiple products → tabbed artifact) */
  renderBatch(inputs: ClassificationResult[], templateData: CountryTemplateData): Promise<string>;

  /** Get the static fallback template (used when primary generation fails) */
  getFallbackTemplate(): string;
}