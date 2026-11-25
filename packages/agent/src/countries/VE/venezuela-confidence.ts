/**
 * VenezuelaConfidence - IConfidenceMethodology implementation for Venezuela.
 * Maps internal confidence (margin-over-uniform) to Alto/Medio/Bajo.
 * 
 * @package apps/agent/src/countries/VE
 * @layer Country Module - Domain Port Implementation
 */

import { IConfidenceMethodology, ConfidenceLabel } from '../../domain/ports/confidence.port';

export class VenezuelaConfidence implements IConfidenceMethodology {
  private readonly levels: ConfidenceLabel[] = [
    { label: 'Alto', level: 'high', threshold: 0.85, color: 'success' },
    { label: 'Medio', level: 'medium', threshold: 0.60, color: 'warning' },
    { label: 'Bajo', level: 'low', threshold: 0.00, color: 'danger' }
  ];

  toLabel(confidence: number): ConfidenceLabel {
    // Confidence is margin-over-uniform (0-1)
    // Find the highest level where confidence >= threshold
    for (const level of this.levels) {
      if (confidence >= level.threshold) {
        return level;
      }
    }
    return this.levels[this.levels.length - 1]; // Bajo
  }

  calibrate(rawScore: number, ballotSize: number): number {
    // Margin-over-uniform formula: (n * pmax - 1) / (n - 1)
    // Where n = ballot size, pmax = top probability (rawScore)
    if (ballotSize <= 1) return 1.0;
    return Math.max(0, (ballotSize * rawScore - 1) / (ballotSize - 1));
  }

  getAllLevels(): ConfidenceLabel[] {
    return [...this.levels];
  }

  getAutoApprovalThreshold(): number {
    return 0.85; // Alto threshold
  }

  getReviewThreshold(): number {
    return 0.60; // Medio threshold
  }

  getCountryName(): string {
    return 'Venezuela';
  }

  // Venezuela-specific confidence reasoning helpers

  getConfidenceReason(level: 'high' | 'medium' | 'low', context: {
    rgiStep: number;
    ballotSize: number;
    hasAlternatives: boolean;
    officialVerified: boolean;
  }): string {
    const reasons: Record<string, string> = {
      high: [
        'Partida única clara en RGI 1/3a',
        'Texto de subpartida coincide exactamente',
        'Notas de capítulo respaldan',
        'Verificación en arancel oficial confirmada'
      ].filter((_, i) => {
        if (i === 0) return context.rgiStep <= 1;
        if (i === 1) return true;
        if (i === 2) return true;
        if (i === 3) return context.officialVerified;
        return false;
      }).join('; '),
      medium: [
        'Múltiples candidatas en RGI 1',
        'RGI 3b esencial para decidir',
        'Ambigüedad en carácter esencial'
      ].filter((_, i) => {
        if (i === 0) return context.ballotSize > 1;
        if (i === 1) return context.rgiStep >= 3;
        if (i === 2) return context.hasAlternatives;
        return false;
      }).join('; '),
      low: [
        'RGI 4 necesario',
        'Notas contradictorias',
        'Bien atípico sin jurisprudencia',
        '≥3 alternativas viables',
        'Información crítica faltante'
      ].filter((_, i) => {
        if (i === 0) return context.rgiStep === 4;
        if (i === 1) return true;
        if (i === 2) return true;
        if (i === 3) return context.ballotSize >= 3;
        if (i === 4) return !context.officialVerified;
        return false;
      }).join('; ')
    };

    return reasons[level] || 'Sin razón específica';
  }
}