/**
 * IRgiTraversal - Port for country-specific RGI traversal strategy.
 * Defines the pipeline steps for RGI 1-6 traversal.
 * 
 * @package apps/agent/src/domain/ports
 * @layer Domain Port
 */
export interface RgiContext {
  tenantId: string;
  countryCode: string;
  productDescription: string;
  merceologicalSheet: MerceologicalSheet;
  headingResult?: HeadingResult;
}

export interface MerceologicalSheet {
  function: string;
  composition: Record<string, number>;  // material -> weight%
  state: string;                         // solid, liquid, gas, powder, etc.
  endUse: string;
  presentation: string;                  // packaging, format at border
  essentialCharacterDriver: string;      // what determines classification
}

export interface HeadingResult {
  headingCode: string;           // 4-digit SA heading
  confidence: number;
  appliedRules: string[];        // RGI rules applied
  alternatives: HeadingAlternative[];
}

export interface HeadingAlternative {
  headingCode: string;
  confidence: number;
  reason: string;
}

export interface PipelineStep {
  name: string;                  // Unique step identifier
  step: string;                  // Function reference (e.g., 'runHeadingArbitration')
  rgi: number;                   // RGI rule number (1-6)
  input: string[];               // Required input keys from context
  output: string[];              // Output keys added to context
  configurable?: boolean;        // Can be disabled per country
}

export interface IRgiTraversal {
  /** 
   * Build the RGI traversal pipeline steps for this country.
   * Each country returns its own step sequence.
   * 
   * Venezuela (NCM):  [headingArbitration(RGI1), ncmDecision(RGI3), nationalRefinement(RGI6)]
   * US (HTS):         [headingArbitration(RGI1), htsSubheading(RGI3), statisticalSuffix(RGI6), chapter98Check]
   * Colombia (NANDINA): [headingArbitration(RGI1), nandinaDecision(RGI3), nationalRefinement(RGI6)]
   */
  buildPipelineSteps(context: RgiContext): PipelineStep[];

  /** Country-specific RGI 3b essential-character rules */
  essentialCharacterRules: string[];

  /** Whether heading gate (RGI 1) is enabled */
  headingGateEnabled: boolean;

  /** Whether national refinement (RGI 6) is enabled */
  nationalRefinementEnabled: boolean;

  /** Get RGI step labels localized for this country */
  getRgiStepLabels(): string[];
}