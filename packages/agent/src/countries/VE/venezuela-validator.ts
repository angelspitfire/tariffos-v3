/**
 * VenezuelaValidator - NCM format validator for Venezuela.
 * Validates 10-digit code structure: SA(6) + NCM(2) + Nacional(2).
 * 
 * @package apps/agent/src/countries/VE
 * @layer Country Module - Domain Port Implementation
 */

import { ITariffSource, ValidationResult } from '../../domain/ports/tariff-source.port';

export class VenezuelaValidator {
  private static readonly NCM_REGEX = /^\d{4}\.\d{2}\.\d{2}\.\d{2}$/;

  /**
   * Validate full 10-digit NCM code format.
   * Returns detailed validation result with segment breakdown.
   */
  static validate(code: string): ValidationResult & { 
    segments?: { sa: string; ncm: string; nacional: string };
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic format
    if (!this.NCM_REGEX.test(code)) {
      errors.push(`Invalid format: ${code}. Expected xxxx.xx.xx.xx (e.g., 8471.30.00.00)`);
      return { valid: false, errors, warnings: [] };
    }

    const segments = this.parseSegments(code);
    if (!segments) {
      errors.push('Could not parse code segments');
      return { valid: false, errors, warnings: [] };
    }

    // Validate SA part (digits 1-6) - must be valid SA heading
    const saWarnings = this.validateSaPart(segments.sa);
    warnings.push(...saWarnings);

    // Validate NCM part (digits 7-8) - must be valid Mercosur subheading
    const ncmWarnings = this.validateNcmPart(segments.ncm);
    warnings.push(...ncmWarnings);

    // Validate Nacional part (digits 9-10) - Venezuela national subdivision
    const nacionalWarnings = this.validateNacionalPart(segments.nacional);
    warnings.push(...nacionalWarnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      segments
    };
  }

  /**
   * Parse code into segments.
   */
  static parseSegments(code: string): { sa: string; ncm: string; nacional: string } | null {
    const match = code.match(/^(\d{4}\.\d{2})\.(\d{2})\.(\d{2})$/);
    if (!match) return null;
    return {
      sa: match[1],      // e.g., "8471.30"
      ncm: match[2],     // e.g., "00"
      nacional: match[3] // e.g., "00"
    };
  }

  /**
   * Validate SA part (4-digit heading + 2-digit subheading).
   */
  private static validateSaPart(sa: string): string[] {
    const warnings: string[] = [];
    const heading = sa.slice(0, 4);
    const subheading = sa.slice(5, 7);
    
    const headingNum = parseInt(heading, 10);
    const subheadingNum = parseInt(subheading, 10);

    // Valid SA chapters: 01-97
    if (headingNum < 1 || headingNum > 97) {
      warnings.push(`SA heading ${heading} out of range (01-97)`);
    }

    // Subheading 00-99
    if (subheadingNum < 0 || subheadingNum > 99) {
      warnings.push(`SA subheading ${subheading} out of range (00-99)`);
    }

    // Known Venezuelan chapters with special rules
    const specialChapters = ['28', '29', '30', '38', '84', '85', '90', '91'];
    if (specialChapters.includes(heading)) {
      warnings.push(`Chapter ${heading} has Venezuela-specific compliance rules`);
    }

    return warnings;
  }

  /**
   * Validate NCM part (digits 7-8) - Mercosur subheading.
   */
  private static validateNcmPart(ncm: string): string[] {
    const warnings: string[] = [];
    const ncmNum = parseInt(ncm, 10);

    if (ncmNum < 0 || ncmNum > 99) {
      warnings.push(`NCM subheading ${ncm} out of range (00-99)`);
    }

    // NCM 00 = no Mercosur subdivision (common)
    if (ncm === '00') {
      warnings.push('NCM 00: No Mercosur sub-subdivision (common for many headings)');
    }

    return warnings;
  }

  /**
   * Validate Nacional part (digits 9-10) - Venezuela national subdivision.
   */
  private static validateNacionalPart(nacional: string): string[] {
    const warnings: string[] = [];
    const nacionalNum = parseInt(nacional, 10);

    if (nacionalNum < 0 || nacionalNum > 99) {
      warnings.push(`Nacional subdivision ${nacional} out of range (00-99)`);
    }

    // Nacional 00 = no national subdivision (common)
    if (nacional === '00') {
      warnings.push('Nacional 00: No Venezuela-specific subdivision');
    }

    return warnings;
  }

  /**
   * Check if code exists in official tariff (requires tariff source).
   */
  static async verifyAgainstTariff(code: string, tariffSource: ITariffSource): Promise<ValidationResult> {
    return tariffSource.validateCode(code, tariffSource.getCurrentVersion());
  }

  /**
   * Format code for display (ensures proper dot separators).
   */
  static formatForDisplay(code: string): string {
    const digits = code.replace(/[^0-9]/g, '');
    if (digits.length !== 10) return code;
    return `${digits.slice(0,4)}.${digits.slice(4,6)}.${digits.slice(6,8)}.${digits.slice(8,10)}`;
  }

  /**
   * Normalize code for storage/comparison (removes dots).
   */
  static normalize(code: string): string {
    return code.replace(/[^0-9]/g, '').padStart(10, '0').slice(0, 10);
  }

  /**
   * Get segment for database storage/queries.
   */
  static getSegmentsForStorage(code: string): { sa6: string; ncm2: string; nacional2: string } | null {
    const segments = this.parseSegments(code);
    if (!segments) return null;
    return {
      sa6: segments.sa.replace('.', ''),
      ncm2: segments.ncm,
      nacional2: segments.nacional
    };
  }
}