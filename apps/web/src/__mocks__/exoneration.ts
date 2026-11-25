import { ExonerationSimulatorPayload } from '@/types/exoneration';

export const INITIAL_EXONERATION_DATA: ExonerationSimulatorPayload = {
  filingId: 'TR-2024-8849-VE',
  cifUsd: 99850,
  baseAdValoremRate: 146 / 100, // 1.46% ad-valorem ponderado
  vatRate: 15,
  fodinfaRate: 1 / 2, // 0.5% FODINFA
  activeRegimeId: 'tlc-ue',
  regimes: [
    {
      id: 'general',
      name: 'Régimen General (Consumo Pleno)',
      code: 'REG-10-GENERAL',
      description: 'Sin preferencia arancelaria. Aplica arancel pleno de Nación Más Favorecida (NMF).',
      adValoremReliefRate: 0,
      fodinfaExempt: false,
      requiresOriginCert: false,
    },
    {
      id: 'tlc-ue',
      name: 'Acuerdo Comercial Multipartes Venezuela - UE (Acuerdo PARCIAL ALADI)',
      code: 'TLC-UE-PROT',
      description: 'Desgravamen del 100% en arancel Ad-Valorem para bienes informáticos y electrónicos.',
      adValoremReliefRate: 1, // 100% desgravamen
      fodinfaExempt: false,
      requiresOriginCert: true,
    },
    {
      id: 'can-andina',
      name: 'Comunidad Andina (CAN - Decisión 414)',
      code: 'CAN-DEC-414',
      description: 'Zona de libre comercio andina. Exoneración del 100% Ad-Valorem y libre tránsito.',
      adValoremReliefRate: 1,
      fodinfaExempt: true,
      requiresOriginCert: true,
    },
    {
      id: 'decreto-tec',
      name: 'Decreto Presidencial 049 (Incentivo Tecnológico)',
      code: 'DEC-PRES-049',
      description: 'Reducción arancelaria del 50% para bienes de capital y componentes de telecomunicaciones.',
      adValoremReliefRate: 1 / 2,
      fodinfaExempt: false,
      requiresOriginCert: false,
    },
  ],
  currencies: [
    {
      code: 'USD',
      symbol: '$',
      rateToUsd: 1,
      label: 'Dólar Estadounidense (Moneda de Cuenta)',
    },
    {
      code: 'EUR',
      symbol: '€',
      rateToUsd: 92 / 100,
      label: 'Euro (Tasa Oficial SENIAT / EUR)',
    },
    {
      code: 'CNY',
      symbol: '¥',
      rateToUsd: 724 / 100,
      label: 'Yuan Renminbi (Tasa Oficial SENIAT / CNY)',
    },
  ],
};
