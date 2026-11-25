/**
 * IConfidenceMethodology - Port for country-specific confidence calculation and labeling.
 * Maps internal confidence (0-1 margin-over-uniform) to country labels and thresholds.
 * 
 * @package apps/agent/src/domain/ports
 * @layer Domain Port
 */
export interface ConfidenceLabel {
  label: string;           // e.g., 'Alto', 'Medio', 'Bajo' or 'High', 'Medium', 'Low'
  level: 'high' | 'medium' | 'low';
  threshold: number;       // Minimum confidence for this level (0-1)
  color: string;           // UI color token (e.g., 'success', 'warning', 'danger')
}

export interface IConfidenceMethodology {
  /** 
   * Map internal confidence (0-1 margin-over-uniform) to country label + threshold.
   * Called by pipeline to produce broker-facing confidence.
   */
  toLabel(confidence: number): ConfidenceLabel;

  /** 
   * Calibrate raw model output (probability) to internal confidence scale.
   * Margin-over-uniform: (n * pmax - 1) / (n - 1)
   * Where n = ballot size, pmax = top probability.
   */
  calibrate(rawScore: number, ballotSize: number): number;

  /** Get all confidence levels for this country (for UI dropdowns, etc.) */
  getAllLevels(): ConfidenceLabel[];

  /** Get the minimum confidence for auto-approval (no human review) */
  getAutoApprovalThreshold(): number;

  /** Get the minimum confidence for "review required" flag */
  getReviewThreshold(): number;

  /** Country-specific confidence label for display */
  getCountryName(): string;
}