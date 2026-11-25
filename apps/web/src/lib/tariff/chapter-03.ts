/**
 * Chapter 03 - Fish and crustaceans, molluscs and other aquatic invertebrates.
 * SENIAT Official Tariff mock data.
 */

import type { TariffChapter } from '@/types/tariff-reference';

export const CHAPTER_03: TariffChapter = {
  code: '03',
  title: 'Pescados y crustáceos, moluscos y demás invertebrados acuáticos',
  descriptionEs: 'Pescados, crustáceos, moluscos y otros invertebrados acuáticos',
  headings: [
    {
      code: '0301',
      description: 'Live fish',
      descriptionEs: 'Peces vivos',
      subheadings: [
      {
        code: '0301.11',
        description: 'Freshwater fish (trout, salmon, etc.)',
        descriptionEs: 'Peces de agua dulce (trucha, salmón, etc.)',
        items: [
          {
            code: '0301.11.00.00',
            description: 'Live trout',
            descriptionEs: 'Truchas vivas',
            dutyAdValorem: 5,
            vat: 16,
            fodinfa: 0.5,
            unit: 'KG',
            status: 'active',
            requiresPermit: false,
            permitAgencies: [],
          },
        ]
      },
      {
        code: '0301.19',
        description: 'Other live fish',
        descriptionEs: 'Los demás peces vivos',
        items: [
          {
            code: '0301.19.00.00',
            description: 'Other live fish',
            descriptionEs: 'Otros peces vivos',
            dutyAdValorem: 5,
            vat: 16,
            fodinfa: 0.5,
            unit: 'KG',
            status: 'active',
            requiresPermit: false,
            permitAgencies: [],
          },
        ]
      },
    ]
    },
    {
      code: '0302',
      description: 'Fish, fresh or chilled (except fillets)',
      descriptionEs: 'Pescados frescos o refrigerados (excepto filetes)',
      subheadings: [
      {
        code: '0302.11',
        description: 'Trout',
        descriptionEs: 'Truchas',
        items: [
          {
            code: '0302.11.00.00',
            description: 'Fresh or chilled trout',
            descriptionEs: 'Truchas frescas o refrigeradas',
            dutyAdValorem: 10,
            vat: 16,
            fodinfa: 0.5,
            unit: 'KG',
            status: 'active',
            requiresPermit: false,
            permitAgencies: [],
          },
        ]
      },
      {
        code: '0302.14',
        description: 'Salmon',
        descriptionEs: 'Salmones',
        items: [
          {
            code: '0302.14.00.00',
            description: 'Fresh or chilled salmon',
            descriptionEs: 'Salmones frescos o refrigerados',
            dutyAdValorem: 10,
            vat: 16,
            fodinfa: 0.5,
            unit: 'KG',
            status: 'active',
            requiresPermit: false,
            permitAgencies: [],
          },
        ]
      },
    ]
    },
  ]
};