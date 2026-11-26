import type {
  A2UICalculatorComponent,
  A2UIDocumentSummaryComponent,
  A2UIDossierComponent,
  IncotermCode,
  JurisdictionConfig,
} from '@tariffos/shared-types';
import { detectIncotermFromText, detectOriginCodeFromText } from './trade-preferences.js';

/** Infers origin country code and Incoterm from dossier, calculator, and document context. */
export function inferTradeParamsFromContext(params: {
  calculator?: A2UICalculatorComponent;
  dossier?: A2UIDossierComponent;
  docSummary?: A2UIDocumentSummaryComponent;
  jurisdiction?: JurisdictionConfig;
  defaultIncoterm?: IncotermCode;
}): { originCode: string; incoterm: IncotermCode } {
  const { calculator, dossier, docSummary, jurisdiction: _jurisdiction, defaultIncoterm } = params;
  const specText = (dossier?.technicalSpecs ?? [])
    .filter((s) => /origen|origin|pa[ií]s|proceden|fabric|manufact/i.test(s.key))
    .map((s) => s.value)
    .join(' ');

  const combinedOriginText = [
    calculator?.originCountry ?? '',
    specText,
    docSummary?.routeOrIncoterm ?? '',
    docSummary?.shipper ?? '',
    dossier?.officialDescription ?? '',
  ].join(' ');

  const originCode = detectOriginCodeFromText(combinedOriginText) ?? 'OTHER';
  const incoterm =
    calculator?.incoterm ??
    detectIncotermFromText(docSummary?.routeOrIncoterm ?? '') ??
    defaultIncoterm ??
    'FOB';

  return { originCode, incoterm };
}
