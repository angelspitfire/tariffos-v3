import { PrismaClient } from '../generated/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from apps/web/.env
dotenv.config({ path: path.join(process.cwd(), '../../apps/web/.env') });

const prisma = new PrismaClient();

interface TariffRequirement {
  regulatoryEntity: string;
  permitType: string;
  mandatoryForClearance: boolean;
  friendlyExplanation: string;
}

function parseRegimenLegal(regimenStr: string | null | undefined): TariffRequirement[] {
  if (!regimenStr) return [];
  const requirements: TariffRequirement[] = [];
  
  // Clean and find all numbers in the string
  const matches = regimenStr.match(/\d+/g);
  if (!matches) return [];

  const uniqueRegimenNumbers = Array.from(new Set(matches.map(Number)));

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

async function main() {
  const jsonPath = path.join(process.cwd(), '../../.data/extracted_tariffs_full.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`Archivo JSON no encontrado en ${jsonPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Leídos ${data.length} códigos desde el JSON.`);

  // Load existing tariff codes for VE to optimize database operations
  const existingTariffs = await prisma.nationalTariff.findMany({
    where: { countryCode: 'VE' },
    select: { hsCode: true }
  });
  const existingCodes = new Set(existingTariffs.map(t => t.hsCode));
  console.log(`Encontrados ${existingCodes.size} códigos existentes en la base de datos.`);

  const toCreate: any[] = [];
  const toUpdate: any[] = [];

  for (const item of data) {
    if (!item.hsCode) continue;
    const cleanHsCode = item.hsCode.replace(/[\.\s]/g, '');
    const parsedRequirements = parseRegimenLegal(item.regimenLegal);
    
    const record = {
      countryCode: 'VE',
      hsCode: cleanHsCode,
      description: item.description,
      adValorem: item.adValorem,
      iva: item.iva,
      customsFee: item.customsFee || 1.0,
      legalNotes: item.legalNotes || null,
      requirements: parsedRequirements.length > 0 ? (parsedRequirements as any) : null,
      isBK: item.isBK === true,
      isBIT: item.isBIT === true,
      isActive: true,
      isDerogated: false
    };

    if (existingCodes.has(cleanHsCode)) {
      toUpdate.push(record);
    } else {
      toCreate.push(record);
    }
  }

  console.log(`Preparando para crear ${toCreate.length} registros y actualizar ${toUpdate.length} registros.`);

  let insertedCount = 0;
  let updatedCount = 0;

  // Bulk create in chunks of 500 for efficiency
  const chunkSize = 500;
  for (let i = 0; i < toCreate.length; i += chunkSize) {
    const chunk = toCreate.slice(i, i + chunkSize);
    try {
      await prisma.nationalTariff.createMany({
        data: chunk,
        skipDuplicates: true
      });
      insertedCount += chunk.length;
      console.log(`Insertados ${insertedCount}/${toCreate.length} nuevos registros...`);
    } catch (e: any) {
      console.error(`Error en bloque de creación: ${e.message}`);
    }
  }

  // Update existing one-by-one or in transaction chunks
  for (const item of toUpdate) {
    try {
      await prisma.nationalTariff.update({
        where: {
          countryCode_hsCode: {
            countryCode: 'VE',
            hsCode: item.hsCode
          }
        },
        data: {
          description: item.description,
          adValorem: item.adValorem,
          iva: item.iva,
          customsFee: item.customsFee,
          legalNotes: item.legalNotes,
          requirements: item.requirements,
          isBK: item.isBK === true,
          isBIT: item.isBIT === true
        }
      });
      updatedCount++;
    } catch (e: any) {
      console.warn(`Error actualizando ${item.hsCode}: ${e.message}`);
    }
  }

  console.log(`Carga finalizada. ${insertedCount} creados, ${updatedCount} actualizados.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
