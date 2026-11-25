/**
 * Country Module Registry
 * Maps countryCode → ICountryModule (composed of domain port implementations).
 * 
 * @package apps/agent/src/countries
 * @layer Country Module Registry
 */

import { ITariffSource } from '../domain/ports/tariff-source.port';
import { IRgiTraversal } from '../domain/ports/rgi-traversal.port';
import { IPermitsRegistry } from '../domain/ports/permits.port';
import { IConfidenceMethodology } from '../domain/ports/confidence.port';
import { ITradeAgreements } from '../domain/ports/trade-agreements.port';

export interface ICountryModule {
  countryCode: string;
  countryName: string;
  tariffSystem: 'NCM' | 'HS' | 'HTS' | 'ARANCEL' | 'NANDINA';
  codeFormat: string;
  
  // Domain ports
  tariffSource: ITariffSource;
  rgiTraversal: IRgiTraversal;
  permitsRegistry: IPermitsRegistry;
  confidenceMethodology: IConfidenceMethodology;
  tradeAgreements: ITradeAgreements;
}

/** Registry: countryCode → ICountryModule */
const countryModules: Map<string, ICountryModule> = new Map();

/** Register a country module */
export function registerCountryModule(module: ICountryModule): void {
  countryModules.set(module.countryCode, module);
}

/** Get country module by code */
export function getCountryModule(countryCode: string): ICountryModule | undefined {
  return countryModules.get(countryCode);
}

/** Get all registered country codes */
export function getRegisteredCountries(): string[] {
  return Array.from(countryModules.keys());
}

/** Check if a country is supported */
export function isCountrySupported(countryCode: string): boolean {
  return countryModules.has(countryCode);
}

/** 
 * Factory: create country module from individual port implementations.
 * Used by country modules during initialization.
 */
export function createCountryModule(params: {
  countryCode: string;
  countryName: string;
  tariffSystem: ICountryModule['tariffSystem'];
  codeFormat: string;
  tariffSource: ITariffSource;
  rgiTraversal: IRgiTraversal;
  permitsRegistry: IPermitsRegistry;
  confidenceMethodology: IConfidenceMethodology;
  tradeAgreements: ITradeAgreements;
}): ICountryModule {
  const module: ICountryModule = {
    countryCode: params.countryCode,
    countryName: params.countryName,
    tariffSystem: params.tariffSystem,
    codeFormat: params.codeFormat,
    tariffSource: params.tariffSource,
    rgiTraversal: params.rgiTraversal,
    permitsRegistry: params.permitsRegistry,
    confidenceMethodology: params.confidenceMethodology,
    tradeAgreements: params.tradeAgreements,
  };
  
  registerCountryModule(module);
  return module;
}