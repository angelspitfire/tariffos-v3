/**
 * IPermitsRegistry - Port for country-specific permits and compliance.
 * 
 * @package apps/agent/src/domain/ports
 * @layer Domain Port
 */
export interface PermitAgency {
  code: string;                    // e.g., 'CONATEL', 'FDA', 'INVIMA'
  name: string;                    // Full agency name
  category: 'customs' | 'health' | 'telecom' | 'environment' | 'quality' | 'other';
  requiresDocument: boolean;       // Whether document upload is required
  validityMonths?: number;         // Permit validity period
  blocking: boolean;               // If expired/missing, blocks clearance
}

export interface ComplianceRule {
  id: string;
  hsChapter?: string;              // e.g., '28', '29', '30' (optional = all chapters)
  hsCodePrefix?: string;           // e.g., '8517' (optional = all codes)
  ruleText: string;                // Human-readable rule
  severity: 'warning' | 'error' | 'blocking';
  agencies: string[];              // Agency codes involved
}

export interface PermitRequirement {
  permitAgencyCode: string;
  mandatory: boolean;
  notes?: string;
  estimatedCostUsd?: number;
  processingTimeDays?: number;
}

export interface IPermitsRegistry {
  /** All permit agencies for this country */
  permitAgencies: PermitAgency[];

  /** Compliance rules (chapter/code specific) */
  complianceRules: ComplianceRule[];

  /** Get required permits for a specific HS code */
  getRequiredPermits(hsCode: string): PermitRequirement[];

  /** Check if a permit is blocking for a given code */
  isBlocking(permitAgencyCode: string, hsCode: string): boolean;

  /** Get agency display name for UI (localized) */
  getAgencyLabel(permitAgencyCode: string): string;

  /** Validate permit document (basic checks) */
  validatePermitDocument(permitAgencyCode: string, document: File): ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}