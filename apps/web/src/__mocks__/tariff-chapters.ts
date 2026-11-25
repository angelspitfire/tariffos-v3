import { TariffChapter } from '@/types/tariff-reference';
import { MAX_TARIFF_SEARCH_RESULTS } from './constants';

export const MOCK_TARIFF_CHAPTERS: TariffChapter[] = [
  {
    code: '01',
    title: 'Animales vivos; productos del reino animal',
    headings: [
      {
        code: '0101',
        description: 'Caballos, asnos, mulos y burdeos, vivos',
        subheadings: [
          {
            code: '010121',
            description: 'Caballos de raza pura para reproducción',
            items: [
              {
                code: '0101210000',
                description: 'Caballos de raza pura para reproducción',
                dutyAdValorem: 0,
                vat: 16,
                fodinfa: 0.5,
                unit: 'UN',
                status: 'active',
                notes: 'Exento de arancel según Decreto Presidencial'
              },
              {
                code: '0101290000',
                description: 'Los demás caballos',
                dutyAdValorem: 10,
                vat: 16,
                fodinfa: 0.5,
                unit: 'UN',
                status: 'active'
              }
            ]
          }
        ]
      },
      {
        code: '0102',
        description: 'Animales de la especie bovina, vivos',
        subheadings: [
          {
            code: '010221',
            description: 'De raza pura para reproducción',
            items: [
              {
                code: '0102210000',
                description: 'Bovinos de raza pura para reproducción',
                dutyAdValorem: 0,
                vat: 16,
                fodinfa: 0.5,
                unit: 'UN',
                status: 'active'
              }
            ]
          },
          {
            code: '010229',
            description: 'Los demás',
            items: [
              {
                code: '0102290000',
                description: 'Bovinos vivos, excepto de raza pura para reproducción',
                dutyAdValorem: 5,
                vat: 16,
                fodinfa: 0.5,
                unit: 'UN',
                status: 'active'
              }
            ]
          }
        ]
      },
      {
        code: '0103',
        description: 'Animales de la especie porcina, vivos',
        subheadings: [
          {
            code: '010310',
            description: 'De raza pura para reproducción',
            items: [
              {
                code: '0103100000',
                description: 'Porcinos de raza pura para reproducción',
                dutyAdValorem: 0,
                vat: 16,
                fodinfa: 0.5,
                unit: 'UN',
                status: 'active'
              }
            ]
          },
          {
            code: '010391',
            description: 'Los demás, de peso inferior a 50 kg',
            items: [
              {
                code: '0103910000',
                description: 'Porcinos vivos, peso < 50 kg',
                dutyAdValorem: 10,
                vat: 16,
                fodinfa: 0.5,
                unit: 'UN',
                status: 'active'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    code: '02',
    title: 'Carnes y despojos comestibles',
    headings: [
      {
        code: '0201',
        description: 'Carnes de animales de la especie bovina, frescas, refrigeradas o congeladas',
        subheadings: [
          {
            code: '020110',
            description: 'En canales o medias canales',
            items: [
              {
                code: '0201100000',
                description: 'Carne bovina en canales o medias canales',
                dutyAdValorem: 15,
                vat: 16,
                fodinfa: 0.5,
                unit: 'KG',
                status: 'active'
              }
            ]
          },
          {
            code: '020120',
            description: 'Los demás cortes (sin deshuesar)',
            items: [
              {
                code: '0201200000',
                description: 'Cortes de carne bovina sin deshuesar',
                dutyAdValorem: 15,
                vat: 16,
                fodinfa: 0.5,
                unit: 'KG',
                status: 'active'
              }
            ]
          }
        ]
      },
      {
        code: '0202',
        description: 'Carnes de animales de la especie bovina, congeladas',
        subheadings: [
          {
            code: '020210',
            description: 'En canales o medias canales',
            items: [
              {
                code: '0202100000',
                description: 'Carne bovina congelada en canales',
                dutyAdValorem: 15,
                vat: 16,
                fodinfa: 0.5,
                unit: 'KG',
                status: 'active'
              }
            ]
          }
        ]
      },
      {
        code: '0203',
        description: 'Carnes de animales de la especie porcina, frescas, refrigeradas o congeladas',
        subheadings: [
          {
            code: '020311',
            description: 'En canales o medias canales',
            items: [
              {
                code: '0203110000',
                description: 'Carne porcina en canales o medias canales',
                dutyAdValorem: 15,
                vat: 16,
                fodinfa: 0.5,
                unit: 'KG',
                status: 'active'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    code: '03',
    title: 'Pescados y crustáceos, moluscos y demás invertebrados acuáticos',
    headings: [
      {
        code: '0301',
        description: 'Peces vivos',
        subheadings: [
          {
            code: '030111',
            description: 'Peces de agua dulce (trucha, salmón, etc.)',
            items: [
              {
                code: '0301110000',
                description: 'Truchas vivas',
                dutyAdValorem: 5,
                vat: 16,
                fodinfa: 0.5,
                unit: 'KG',
                status: 'active'
              }
            ]
          },
          {
            code: '030119',
            description: 'Los demás peces vivos',
            items: [
              {
                code: '0301190000',
                description: 'Otros peces vivos',
                dutyAdValorem: 5,
                vat: 16,
                fodinfa: 0.5,
                unit: 'KG',
                status: 'active'
              }
            ]
          }
        ]
      },
      {
        code: '0302',
        description: 'Pescados frescos o refrigerados (excepto filetes)',
        subheadings: [
          {
            code: '030211',
            description: 'Truchas',
            items: [
              {
                code: '0302110000',
                description: 'Truchas frescas o refrigeradas',
                dutyAdValorem: 10,
                vat: 16,
                fodinfa: 0.5,
                unit: 'KG',
                status: 'active'
              }
            ]
          },
          {
            code: '030214',
            description: 'Salmones',
            items: [
              {
                code: '0302140000',
                description: 'Salmones frescos o refrigerados',
                dutyAdValorem: 10,
                vat: 16,
                fodinfa: 0.5,
                unit: 'KG',
                status: 'active'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    code: '04',
    title: 'Productos lácteos; huevos de ave; miel natural; productos comestibles de origen animal',
    headings: [
      {
        code: '0401',
        description: 'Leche y nata (crema), sin concentrar ni adicionar azúcar',
        subheadings: [
          {
            code: '040110',
            description: 'De contenido en materias grasas ≤ 1%',
            items: [
              {
                code: '0401100000',
                description: 'Leche descremada (≤1% grasa)',
                dutyAdValorem: 5,
                vat: 16,
                fodinfa: 0.5,
                unit: 'L',
                status: 'active'
              }
            ]
          },
          {
            code: '040120',
            description: 'De contenido en materias grasas > 1% pero ≤ 6%',
            items: [
              {
                code: '0401200000',
                description: 'Leche semidescremada (1-6% grasa)',
                dutyAdValorem: 5,
                vat: 16,
                fodinfa: 0.5,
                unit: 'L',
                status: 'active'
              }
            ]
          }
        ]
      },
      {
        code: '0402',
        description: 'Leche y nata concentradas o con azúcar',
        subheadings: [
          {
            code: '040210',
            description: 'En polvo, gránulos u otras formas sólidas, sin azúcar',
            items: [
              {
                code: '0402100000',
                description: 'Leche en polvo descremada',
                dutyAdValorem: 10,
                vat: 16,
                fodinfa: 0.5,
                unit: 'KG',
                status: 'active'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    code: '05',
    title: 'Productos de origen animal no expresados ni comprendidos en otra parte',
    headings: [
      {
        code: '0501',
        description: 'Cabello humano sin trabajar; desperdicios de cabello',
        subheadings: [
          {
            code: '050100',
            description: 'Cabello humano sin trabajar',
            items: [
              {
                code: '0501000000',
                description: 'Cabello humano sin trabajar, desperdicios',
                dutyAdValorem: 5,
                vat: 16,
                fodinfa: 0.5,
                unit: 'KG',
                status: 'active'
              }
            ]
          }
        ]
      },
      {
        code: '0504',
        description: 'Tripas, vejigas y estómagos de animales',
        subheadings: [
          {
            code: '050400',
            description: 'Tripas, vejigas y estómagos',
            items: [
              {
                code: '0504000000',
                description: 'Tripas y despojos comestibles',
                dutyAdValorem: 5,
                vat: 16,
                fodinfa: 0.5,
                unit: 'KG',
                status: 'active'
              }
            ]
          }
        ]
      }
    ]
  }
] as const;

export { MAX_TARIFF_SEARCH_RESULTS };
