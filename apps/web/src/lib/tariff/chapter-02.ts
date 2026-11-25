/**
 * Chapter 02 - Meat and edible meat offal.
 * SENIAT Official Tariff mock data.
 */

import type { TariffChapter } from '@/types/tariff-reference';

export const CHAPTER_02: TariffChapter = {
  code: '02',
  title: 'Carnes y despojos comestibles',
  descriptionEs: 'Carnes y despojos comestibles',
  headings: [
    {
      code: '0201',
      description: 'Meat of bovine animals, fresh or chilled',
      descriptionEs: 'Carnes de animales bovinos, frescas o refrigeradas',
      subheadings: [
      {
        code: '0201.10',
        description: 'Carcasses and half-carcasses',
        descriptionEs: 'Canales y medias canales',
        items: [
          {
            code: '0201.10.00.00',
            description: 'Bovine carcasses, fresh or chilled',
            descriptionEs: 'Canales bovinos, frescos o refrigerados',
            dutyAdValorem: 20,
            vat: 16,
            fodinfa: 0.5,
            unit: 'KG',
            status: 'active',
            requiresPermit: true,
            permitAgencies: ["SENCAMER", "MINSALUD"],
          },
        ]
      },
      {
        code: '0201.20',
        description: 'Other cuts (boneless)',
        descriptionEs: 'Los demás cortes (sin deshuesar)',
        items: [
          {
            code: '0201.20.00.00',
            description: 'Boneless bovine meat cuts',
            descriptionEs: 'Cortes de carne bovina sin deshuesar',
            dutyAdValorem: 20,
            vat: 16,
            fodinfa: 0.5,
            unit: 'KG',
            status: 'active',
            requiresPermit: true,
            permitAgencies: ["SENCAMER", "MINSALUD"],
          },
        ]
      },
    ]
    },
    {
      code: '0202',
      description: 'Meat of bovine animals, frozen',
      descriptionEs: 'Carnes de animales bovinos, congeladas',
      subheadings: [
      {
        code: '0202.10',
        description: 'Carcasses and half-carcasses',
        descriptionEs: 'Canales y medias canales',
        items: [
          {
            code: '0202.10.00.00',
            description: 'Frozen bovine carcasses',
            descriptionEs: 'Canales bovinos congelados',
            dutyAdValorem: 20,
            vat: 16,
            fodinfa: 0.5,
            unit: 'KG',
            status: 'active',
            requiresPermit: true,
            permitAgencies: ["SENCAMER", "MINSALUD"],
          },
        ]
      },
    ]
    },
    {
      code: '0203',
      description: 'Meat of swine, fresh, chilled or frozen',
      descriptionEs: 'Carnes de la especie porcina, frescas, refrigeradas o congeladas',
      subheadings: [
      {
        code: '0203.11',
        description: 'Carcasses and half-carcasses',
        descriptionEs: 'Canales y medias canales',
        items: [
          {
            code: '0203.11.00.00',
            description: 'Swine carcasses and half-carcasses',
            descriptionEs: 'Canales y medias canales porcinas',
            dutyAdValorem: 15,
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