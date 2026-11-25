/**
 * Chapter 01 - Live animals.
 * SENIAT Official Tariff mock data.
 */

import type { TariffChapter } from '@/types/tariff-reference';

export const CHAPTER_01: TariffChapter = {
  code: '01',
  title: 'Animales vivos; productos del reino animal',
  descriptionEs: 'Animales vivos',
  headings: [
    {
      code: '0101',
      description: 'Live horses, asses, mules and hinnies',
      descriptionEs: 'Caballos, asnos, mulos y burros vivos',
      subheadings: [
      {
        code: '0101.21',
        description: 'Horses, purebred breeding animals',
        descriptionEs: 'Caballos, animales de cría de pura sangre',
        items: [
          {
            code: '0101.21.00.00',
            description: 'Purebred breeding horses',
            descriptionEs: 'Caballos de cría de pura sangre',
            dutyAdValorem: 0,
            vat: 16,
            fodinfa: 0.5,
            unit: 'UN',
            status: 'active',
            requiresPermit: true,
            permitAgencies: ["SENCAMER", "MINEC"],
          },
          {
            code: '0101.21.00.90',
            description: 'Other purebred breeding horses',
            descriptionEs: 'Otros caballos de cría de pura sangre',
            dutyAdValorem: 5,
            vat: 16,
            fodinfa: 0.5,
            unit: 'UN',
            status: 'active',
            requiresPermit: true,
            permitAgencies: ["SENCAMER"],
          },
        ]
      },
      {
        code: '0101.29',
        description: 'Other horses',
        descriptionEs: 'Otros caballos',
        items: [
          {
            code: '0101.29.00.00',
            description: 'Other live horses',
            descriptionEs: 'Otros caballos vivos',
            dutyAdValorem: 15,
            vat: 16,
            fodinfa: 0.5,
            unit: 'UN',
            status: 'active',
            requiresPermit: false,
            permitAgencies: [],
          },
        ]
      },
    ]
    },
    {
      code: '0102',
      description: 'Live bovine animals',
      descriptionEs: 'Animales bovinos vivos',
      subheadings: [
      {
        code: '0102.29',
        description: 'Other bovine animals',
        descriptionEs: 'Otros animales bovinos',
        items: [
          {
            code: '0102.29.00.00',
            description: 'Other live bovine animals',
            descriptionEs: 'Otros bovinos vivos',
            dutyAdValorem: 10,
            vat: 16,
            fodinfa: 0.5,
            unit: 'UN',
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