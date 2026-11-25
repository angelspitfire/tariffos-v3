import { getUnscopedSystemPrisma } from '../src/client.js';

const prisma = getUnscopedSystemPrisma();

async function main() {
  console.log('Clearing existing NationalTariff data for VE and CO...');
  await prisma.nationalTariff.deleteMany({
    where: {
      countryCode: {
        in: ['VE', 'CO']
      }
    }
  });

  console.log('Seeding golden eval codes for Venezuela (VE)...');
  const veSeedData = [
    {
      countryCode: 'VE',
      hsCode: '2404120000',
      description: 'Productos que contengan nicotina, destinados a la inhalación sin combustión',
      adValorem: 20.0,
      iva: 16.0,
      customsFee: 1.0,
      legalNotes: 'Nota Legal 24.04: Se incluyen los vapeadores desechables y recargables.',
      requirements: [
        {
          regulatoryEntity: 'MPPS',
          permitType: 'Control Sanitario de Tabaco y Derivados',
          mandatoryForClearance: true,
          friendlyExplanation: 'Debe cumplir con el registro sanitario ante el Ministerio del Poder Popular para la Salud.'
        }
      ]
    },
    {
      countryCode: 'VE',
      hsCode: '8517620000',
      description: 'Aparatos para la recepción, conversión y transmisión o regeneración de voz, imagen u otros datos',
      adValorem: 15.0,
      iva: 16.0,
      customsFee: 1.0,
      legalNotes: 'Incluye los relojes inteligentes con capacidad de conectividad Bluetooth y/o red celular.',
      requirements: [
        {
          regulatoryEntity: 'CONATEL',
          permitType: 'Homologación de Equipos de Telecomunicaciones',
          mandatoryForClearance: true,
          friendlyExplanation: 'Debe estar certificado y homologado por CONATEL para su uso en redes nacionales.'
        }
      ]
    },
    {
      countryCode: 'VE',
      hsCode: '8517130000',
      description: 'Teléfonos inteligentes (Smartphones) y otros teléfonos móviles',
      adValorem: 10.0,
      iva: 16.0,
      customsFee: 1.0,
      legalNotes: 'Nota de subpartida 8517.13: Incluye teléfonos móviles para redes celulares u otras redes inalámbricas.',
      requirements: [
        {
          regulatoryEntity: 'CONATEL',
          permitType: 'Homologación de Equipos de Telecomunicaciones',
          mandatoryForClearance: true,
          friendlyExplanation: 'Debe estar certificado y homologado por CONATEL para su uso en redes nacionales.'
        }
      ]
    },
    {
      countryCode: 'VE',
      hsCode: '2106909000',
      description: 'Preparaciones alimenticias no expresadas ni comprendidas en otra parte',
      adValorem: 20.0,
      iva: 16.0,
      customsFee: 1.0,
      legalNotes: 'Incluye mezclas keto a base de harina de almendra y suplementos nutricionales.',
      requirements: [
        {
          regulatoryEntity: 'SACS',
          permitType: 'Registro Sanitario de Alimentos',
          mandatoryForClearance: true,
          friendlyExplanation: 'Requiere Permiso Sanitario expedido por el SACS.'
        }
      ]
    }
  ];

  console.log('Generating 100 dummy HS6 codes for VE...');
  const dummyVeCodes = [];
  for (let i = 1; i <= 100; i++) {
    const chapter = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
    const heading = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
    const subheading = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
    const hsCode = `${chapter}${heading}${subheading}0000`;
    dummyVeCodes.push({
      countryCode: 'VE',
      hsCode,
      description: `Descripción Genérica para Subpartida ${chapter}.${heading}.${subheading}`,
      adValorem: Math.floor(Math.random() * 5) * 5, // 0, 5, 10, 15, 20
      iva: 16.0,
      customsFee: 1.0,
      legalNotes: 'Nota generada automáticamente para datos de prueba.',
      requirements: []
    });
  }

  const allData = [...veSeedData, ...dummyVeCodes];

  console.log(`Inserting ${allData.length} records...`);
  
  await prisma.nationalTariff.createMany({
    data: allData,
    skipDuplicates: true
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
