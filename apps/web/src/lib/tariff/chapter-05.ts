/**
 * Chapter 05 - Products of animal origin, not elsewhere specified or included.
 * SENIAT Official Tariff mock data.
 */

import type { TariffChapter } from '@/types/tariff-reference';

export const CHAPTER_05: TariffChapter = {
  code: '05',
  title: 'Productos de origen animal no expresados ni comprendidos en otra parte',
  descriptionEs: 'Productos de origen animal no expresados ni comprendidos en otra parte',
  headings: [
    {
      code: '0501',
      description: 'Human hair, unworked; waste of human hair',
      descriptionEs: 'Cabello humano sin trabajar; desperdicios de cabello',
      subheadings: [
      {
        code: '0501.00',
        description: 'Human hair, unworked',
        descriptionEs: 'Cabello humano sin trabajar',
        items: [
          {
            code: '0501.00.00.00',
            description: 'Human hair, unworked, waste',
            descriptionEs: 'Cabello humano sin trabajar, desperdicios',
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
      code: '0504',
      description: 'Guts, bladders and stomachs of animals',
      descriptionEs: 'Tripas, vejigas y estómagos de animales',
      subheadings: [
      {
        code: '0504.00',
        description: 'Guts, bladders and stomachs',
        descriptionEs: 'Tripas, vejigas y estómagos',
        items: [
          {
            code: '0504.00.00.00',
            description: 'Guts and edible offal',
            descriptionEs: 'Tripas y despojos comestibles',
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
  ]
};