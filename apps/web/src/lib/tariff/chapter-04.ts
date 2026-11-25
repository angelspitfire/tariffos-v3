/**
 * Chapter 04 - Dairy produce; birds' eggs; natural honey; edible products of animal origin.
 * SENIAT Official Tariff mock data.
 */

import type { TariffChapter } from '@/types/tariff-reference';

export const CHAPTER_04: TariffChapter = {
  code: '04',
  title: 'Productos lácteos; huevos de ave; miel natural; productos comestibles de origen animal',
  descriptionEs: 'Productos lácteos; huevos de ave; miel natural; productos comestibles de origen animal',
  headings: [
    {
      code: '0401',
      description: 'Milk and cream, not concentrated nor containing added sugar',
      descriptionEs: 'Leche y nata (crema), sin concentrar ni adicionar azúcar',
      subheadings: [
      {
        code: '0401.10',
        description: 'Of a fat content, by weight, not exceeding 1%',
        descriptionEs: 'De contenido en materias grasas ≤ 1%',
        items: [
          {
            code: '0401.10.00.00',
            description: 'Skimmed milk (≤1% fat)',
            descriptionEs: 'Leche descremada (≤1% grasa)',
            dutyAdValorem: 5,
            vat: 16,
            fodinfa: 0.5,
            unit: 'L',
            status: 'active',
            requiresPermit: false,
            permitAgencies: [],
          },
        ]
      },
      {
        code: '0401.20',
        description: 'Of a fat content, by weight, exceeding 1% but not exceeding 6%',
        descriptionEs: 'De contenido en materias grasas > 1% pero ≤ 6%',
        items: [
          {
            code: '0401.20.00.00',
            description: 'Semi-skimmed milk (1-6% fat)',
            descriptionEs: 'Leche semidescremada (1-6% grasa)',
            dutyAdValorem: 5,
            vat: 16,
            fodinfa: 0.5,
            unit: 'L',
            status: 'active',
            requiresPermit: false,
            permitAgencies: [],
          },
        ]
      },
    ]
    },
    {
      code: '0402',
      description: 'Milk and cream, concentrated or containing added sugar',
      descriptionEs: 'Leche y nata concentradas o con azúcar',
      subheadings: [
      {
        code: '0402.10',
        description: 'In powder, granules or other solid forms, without added sugar',
        descriptionEs: 'En polvo, gránulos u otras formas sólidas, sin azúcar',
        items: [
          {
            code: '0402.10.00.00',
            description: 'Skimmed milk powder',
            descriptionEs: 'Leche en polvo descremada',
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