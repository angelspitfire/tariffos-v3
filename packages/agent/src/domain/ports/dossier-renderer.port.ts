/**
 * IDossierRenderer - Port for rendering official PDF dossiers (court-ready).
 * Shared React PDF engine; country-specific template data passed at render time.
 * 
 * @package apps/agent/src/infrastructure/rendering
 * @layer Infrastructure Port
 */
export interface Filing {
  id: string;
  referenceId: string;
  customsOffice: string;
  status: string;
  client: { name: string; taxId: string; address: string };
  lines: FilingLine[];
  createdAt: string;
  updatedAt: string;
  countryCode: string;
}

export interface FilingLine {
  lineNumber: number;
  description: string;
  hsCode: string;
  omaCode?: string;
  confidence: number;
  status: string;
  cifValue: number;
  quantity: number;
  quantityUnit: string;
  taxBreakdown: TaxBreakdown;
  permits: PermitStatus[];
  rgiSteps: RgiStep[];
  justification: Justification;
  htmlArtifactUrl?: string;
}

export interface TaxBreakdown {
  cifValue: number;
  adValorem: number;
  adValoremAmount: number;
  specificDutyAmount: number;
  ivaBase: number;
  ivaRate: number;
  ivaAmount: number;
  totalDuties: number;
  totalTaxes: number;
}

export interface PermitStatus {
  permitAgencyCode: string;
  status: 'requested' | 'approved' | 'expired' | 'rejected';
  applicationDate?: string;
  expiryDate?: string;
  documentUrl?: string;
}

export interface RgiStep {
  rule: string;
  note: string;
  items: string[];
  conclusion: string;
}

export interface Justification {
  technical: string;      // 2-sentence technical (EN)
  colloquial: string;     // 2-sentence colloquial (ES/PT/FR)
}

export interface CountryTemplateData {
  countryCode: string;
  countryName: string;
  codeFormat: string;
  tariffSystemLabel: string;
  officialSourceName: string;
  permitAgencyLabels: Record<string, string>;
  locale: string;
  logoUrl?: string;
  legalDisclaimer: string;
}

export interface IDossierRenderer {
  /** 
   * Render official PDF dossier for court/legal use.
   * Includes @media print styles, RGI citations, binding expert opinion format.
   */
  render(filing: Filing, templateData: CountryTemplateData): Promise<Buffer>;

  /** Get the static fallback template (used when primary generation fails) */
  getFallbackTemplate(): string;
}