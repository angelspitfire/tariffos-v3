/**
 * Venezuela Module Composition
 * Composes all domain port implementations for Venezuela NCM/Mercosur.
 * Registers with country module registry on import.
 * 
 * @package apps/agent/src/countries/VE
 * @layer Country Module - Composition Root
 */

import { 
  createCountryModule, 
  ICountryModule 
} from '../index';
import { VenezuelaTariffSource } from './venezuela-tariff-source';
import { VenezuelaRgiTraversal } from './venezuela-rgi-traversal';
import { VenezuelaPermits } from './venezuela-permits';
import { VenezuelaConfidence } from './venezuela-confidence';
import { VenezuelaTradeAgreements } from './venezuela-trade-agreements';
import { ITariffSource } from '../../domain/ports/tariff-source.port';

// Lazy initialization to avoid circular dependencies
let venezuelaModule: ICountryModule | null = null;

/** Get or create Venezuela module (singleton) */
export function getVenezuelaModule(pdfPath?: string): ICountryModule {
  if (!venezuelaModule) {
    const tariffSource = new VenezuelaTariffSource(pdfPath);
    
    venezuelaModule = createCountryModule({
      countryCode: 'VE',
      countryName: 'Venezuela',
      tariffSystem: 'NCM',
      codeFormat: 'xxxx.xx.xx.xx',
      tariffSource,
      rgiTraversal: new VenezuelaRgiTraversal(),
      permitsRegistry: new VenezuelaPermits(),
      confidenceMethodology: new VenezuelaConfidence(),
      tradeAgreements: new VenezuelaTradeAgreements()
    });
  }
  return venezuelaModule;
}

/** Initialize Venezuela module with custom PDF path (for testing/admin) */
export function initializeVenezuelaModule(pdfPath: string): ICountryModule {
  venezuelaModule = null; // Force re-initialization
  return getVenezuelaModule(pdfPath);
}

/** 
 * Export tariff source separately for admin portal PDF upload.
 * Allows parsing without full module initialization.
 */
export function createVenezuelaTariffSource(pdfPath: string): ITariffSource {
  return new VenezuelaTariffSource(pdfPath);
}

// Auto-register on import (for production use)
if (typeof globalThis === 'object' && typeof (globalThis as { window?: unknown }).window === 'undefined') {
  // Only auto-register in Node.js environment (not tests)
  getVenezuelaModule();
}

export { VenezuelaTariffSource } from './venezuela-tariff-source';
export { VenezuelaRgiTraversal } from './venezuela-rgi-traversal';
export { VenezuelaPermits } from './venezuela-permits';
export { VenezuelaConfidence } from './venezuela-confidence';
export { VenezuelaTradeAgreements } from './venezuela-trade-agreements';
export { VenezuelaValidator } from './venezuela-validator';