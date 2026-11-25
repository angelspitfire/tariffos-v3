import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from apps/web/.env
dotenv.config({ path: path.join(process.cwd(), '../../apps/web/.env') });

let prisma: any;

interface PortableTariff {
  country: string;
  code: string;
  baseDuty: {
    type: string;
    rate?: number;
    code?: string;
    exceptions?: Array<{
      type: string;
      rate?: number;
      code: string;
    }>;
  };
  taxes: Array<{
    code: string;
    name: string;
    rate: number;
    base: string;
    exempt: boolean;
  }>;
  regimes: Array<{
    type: string;
    code: string;
    description: string;
    legalRef: string;
  }>;
}

interface PortableProduct {
  hs: {
    chapter: string;
    heading: string;
    subheading: string;
    description: string;
  };
  tariffs: PortableTariff[];
}

function parseRegimenLegal(regimes: any[]): any[] {
  if (!regimes || regimes.length === 0) return [];
  const requirements: any[] = [];
  const uniqueRegimenNumbers = Array.from(new Set(regimes.map(r => parseInt(r.code, 10)).filter(num => !isNaN(num))));

  for (const num of uniqueRegimenNumbers) {
    switch (num) {
      case 1:
        requirements.push({
          regulatoryEntity: 'MIN-COMERCIO',
          permitType: 'Importación Prohibida',
          mandatoryForClearance: true,
          friendlyExplanation: 'Régimen Legal 1: La importación de este rubro se encuentra prohibida en el territorio nacional.'
        });
        break;
      case 2:
        requirements.push({
          regulatoryEntity: 'EJECUTIVO',
          permitType: 'Importación Reservada',
          mandatoryForClearance: true,
          friendlyExplanation: 'Régimen Legal 2: Importación reservada al Ejecutivo Nacional.'
        });
        break;
      case 3:
        requirements.push({
          regulatoryEntity: 'SACS / MPPS',
          permitType: 'Permiso Sanitario / Registro Sanitario',
          mandatoryForClearance: true,
          friendlyExplanation: 'Régimen Legal 3: Requiere Registro o Permiso Sanitario del Ministerio del Poder Popular para la Salud.'
        });
        break;
      case 4:
        requirements.push({
          regulatoryEntity: 'MIN-INDUSTRIAS',
          permitType: 'Licencia / Certificado de No Producción',
          mandatoryForClearance: true,
          friendlyExplanation: 'Régimen Legal 4: Requiere Licencia o Certificado de No Producción Nacional del Ministerio de Industrias.'
        });
        break;
      case 5:
        requirements.push({
          regulatoryEntity: 'DAEX / MPPD',
          permitType: 'Permiso de Importación de Armas y Explosivos',
          mandatoryForClearance: true,
          friendlyExplanation: 'Régimen Legal 5: Requiere Autorización de Importación de la Dirección de Armas y Explosivos (DAEX).'
        });
        break;
      case 6:
        requirements.push({
          regulatoryEntity: 'INSAI / MPPAT',
          permitType: 'Permiso Zoosanitario / Fitofarmacéutico',
          mandatoryForClearance: true,
          friendlyExplanation: 'Régimen Legal 6: Requiere Permiso del Instituto Nacional de Salud Agrícola Integral (INSAI).'
        });
        break;
      case 7:
        requirements.push({
          regulatoryEntity: 'CONATEL',
          permitType: 'Homologación de Telecomunicaciones',
          mandatoryForClearance: true,
          friendlyExplanation: 'Régimen Legal 7: Requiere Homologación o Certificación de la Comisión Nacional de Telecomunicaciones (CONATEL).'
        });
        break;
      case 8:
        requirements.push({
          regulatoryEntity: 'MINEC / OTROS',
          permitType: 'Licencia de Importación Especial',
          mandatoryForClearance: true,
          friendlyExplanation: 'Régimen Legal 8: Requiere Licencia o Permiso Especial de Importación (ej. Ministerio de Ecosocialismo).'
        });
        break;
    }
  }

  return requirements;
}

function formatLegalNotes(tariff: PortableTariff): string {
  const parts: string[] = [];
  if (tariff.baseDuty.exceptions && tariff.baseDuty.exceptions.length > 0) {
    const excStr = tariff.baseDuty.exceptions.map(e => `${e.rate !== undefined ? e.rate : ''}${e.code}`).join(', ');
    parts.push(`Ex.AEC: ${excStr}`);
  }
  if (tariff.regimes && tariff.regimes.length > 0) {
    const regCodes = Array.from(new Set(tariff.regimes.map(r => r.code))).join(',');
    parts.push(`Régimen Legal: ${regCodes}`);
  }
  return parts.join('. ') || '';
}

async function main() {
  const { getUnscopedSystemPrisma } = await import('../client.js');
  prisma = getUnscopedSystemPrisma();

  const portableDir = path.join(process.cwd(), 'seed-data/portable');
  const manifestPath = path.join(portableDir, '_manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest file not found at ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`Processing ${manifest.totalChapters} chapters, total ${manifest.totalRecords} records.`);

  // 1. Clear existing VE records from NationalTariff and related LegalKnowledgeParent overrides
  console.log('Clearing existing VE NationalTariff records...');
  const deletedTariffs = await prisma.nationalTariff.deleteMany({ where: { countryCode: 'VE' } });
  console.log(`Deleted ${deletedTariffs.count} old NationalTariff records.`);

  console.log('Clearing existing VE LegalKnowledgeParent records related to Decreto 4.944...');
  const deletedExemptions = await prisma.legalKnowledgeParent.deleteMany({
    where: {
      countryCode: 'VE',
      decreeNumber: 'Decreto 4.944'
    }
  });
  console.log(`Deleted ${deletedExemptions.count} old LegalKnowledgeParent records.`);

  const tariffsToInsert: any[] = [];
  const exemptionsToInsert: any[] = [];

  for (const chap of manifest.chapters) {
    const chapPath = path.join(portableDir, chap.file);
    const chapData = JSON.parse(fs.readFileSync(chapPath, 'utf8'));

    for (const prod of chapData.products) {
      for (const tariff of prod.tariffs) {
        if (tariff.country !== 'VE') continue;

        const cleanHsCode = tariff.code.replace(/[\.\s]/g, '');
        const isBK = tariff.baseDuty.type === 'bk';
        const isBIT = tariff.baseDuty.type === 'bit';

        // Calculate adValorem
        let adValorem = 0;
        if (tariff.baseDuty.type === 'ad_valorem' || isBK || isBIT) {
          adValorem = tariff.baseDuty.rate !== undefined ? tariff.baseDuty.rate : 0;
        }

        // Calculate iva
        const ivaTax = tariff.taxes.find((t: any) => t.code === 'IVA');
        const iva = ivaTax ? ivaTax.rate : 16.0;

        const requirements = parseRegimenLegal(tariff.regimes);
        const legalNotes = formatLegalNotes(tariff);

        tariffsToInsert.push({
          countryCode: 'VE',
          hsCode: cleanHsCode,
          description: prod.hs.description,
          adValorem,
          iva,
          customsFee: 1.0,
          legalNotes: legalNotes || null,
          requirements: requirements.length > 0 ? requirements : null,
          isBK,
          isBIT,
          isActive: true,
          isDerogated: false,
          validFromDate: new Date('2025-04-24')
        });

        // 2. If BK or BIT, generate a corresponding LegalKnowledgeParent record to trigger the 0% override
        if (isBK || isBIT) {
          exemptionsToInsert.push({
            countryCode: 'VE',
            legalType: 'EXEMPTION',
            hierarchyPath: tariff.code, // Keep formatted format so prefix match works
            content: `De conformidad con el Artículo 8 del Decreto N°4.944, las mercancías clasificadas bajo este código arancelario identificadas como ${isBK ? 'BK (Bien de Capital)' : 'BIT (Bien de Informática y Telecomunicaciones)'} gozarán de una alícuota Ad Valorem de 0% sujeta a la obtención del Certificado de Exoneración correspondiente.`,
            officialDocumentNumber: 'Gaceta 6.804',
            decreeNumber: 'Decreto 4.944',
            validFromDate: new Date('2025-04-24'),
            validToDate: null,
            isDerogated: false,
            status: 'PUBLISHED'
          });
        }
      }
    }
  }

  console.log(`Prepared ${tariffsToInsert.length} NationalTariff records and ${exemptionsToInsert.length} Exoneration records.`);

  // Chunk insert NationalTariff
  const chunkSize = 500;
  for (let i = 0; i < tariffsToInsert.length; i += chunkSize) {
    const chunk = tariffsToInsert.slice(i, i + chunkSize);
    await prisma.nationalTariff.createMany({ data: chunk, skipDuplicates: true });
    console.log(`Inserted NationalTariff chunk ${Math.min(i + chunk.length, tariffsToInsert.length)}/${tariffsToInsert.length}`);
  }

  // Chunk insert LegalKnowledgeParent
  for (let i = 0; i < exemptionsToInsert.length; i += chunkSize) {
    const chunk = exemptionsToInsert.slice(i, i + chunkSize);
    await prisma.legalKnowledgeParent.createMany({ data: chunk, skipDuplicates: true });
    console.log(`Inserted LegalKnowledgeParent chunk ${Math.min(i + chunk.length, exemptionsToInsert.length)}/${exemptionsToInsert.length}`);
  }

  console.log('Seeding completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
