import { formatHsCode, type ComplianceFlag } from '@tariffos/shared-types';
import type { TariffAuditResult } from './tariff-validator.js';
import { evaluateTradeRemedies } from './trade-remedies.js';
import type { TariffCandidateRecord } from './types.js';

export function mergeTariffFlags(
  baseFlags: ComplianceFlag[],
  verified: TariffCandidateRecord,
  audit?: TariffAuditResult,
  tradeContext?: { countryCode?: string; originCountry?: string },
): ComplianceFlag[] {
  const formattedCode = formatHsCode(verified.hsCode);
  const flags = [...baseFlags];

  if (verified.prohibited) {
    flags.unshift({
      type: 'blocking',
      title: 'Prohibited Tariff Code',
      text: `Official tariff marks ${formattedCode} as prohibited/restricted.`,
    });
  }
  for (const permit of verified.permits ?? []) {
    flags.push({
      type: 'warn',
      title: `OGA Permit: ${permit}`,
      text: `Required regulatory clearance (${permit}) for ${formattedCode}.`,
    });
  }
  if (verified.isBK) {
    flags.push({
      type: 'info',
      title: 'Bien de Capital (BK)',
      text: 'Subpartida marcada como Bien de Capital (BK) en el Arancel de Aduanas (posible beneficio arancelario según normativa vigente).',
    });
  }
  if (verified.isBIT) {
    flags.push({
      type: 'info',
      title: 'Bien de Informática y Telecomunicaciones (BIT)',
      text: 'Subpartida marcada como BIT en el Arancel de Aduanas.',
    });
  }

  const ex = verified.activeExemption;
  if (ex) {
    const permitNotice = ex.requiredPermitCode
      ? ` Requiere tramitar obligatoriamente ${ex.requiredPermitCode} para aplicar el beneficio.`
      : '';
    flags.push({
      type: ex.requiredPermitCode ? 'warn' : 'info',
      title: `Beneficio / Exoneración (${ex.decreeRef})`,
      text: `${ex.title} bajo ${ex.decreeRef}.${permitNotice}`,
    });

    if (ex.expiringSoon && ex.validToDate) {
      flags.push({
        type: 'warn',
        title: `Alerta de Vigencia Normativa (${ex.validToDate})`,
        text: `Beneficio de ${ex.decreeRef} vigente hasta ${ex.validToDate} según fecha de registro de la declaración de aduanas (DUA).`,
      });
    }
  }

  if (tradeContext?.originCountry) {
    const jurisdictionId =
      tradeContext.countryCode === 'VE' || !tradeContext.countryCode
        ? 've-seniat'
        : tradeContext.countryCode.toLowerCase();
    for (const remedy of evaluateTradeRemedies({
      jurisdictionId,
      originCode: tradeContext.originCountry,
      hsCode: formattedCode,
    })) {
      flags.push({ type: 'warn', title: remedy.title, text: remedy.description });
    }
  }
  if (audit && !audit.matched) {
    flags.push({ type: 'warn', title: 'Auditoría Arancel Oficial', text: audit.summary });
  }
  return flags;
}
