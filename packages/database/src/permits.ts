/**
 * Módulo de permisología para expedientes aduaneros.
 * 
 * Proporciona funciones para validar permisos obligatorios en los expedientes,
 * basándose en los códigos HS y el catálogo de tipos de permiso.
 */

import { z } from 'zod';

/**
 * Schema for PermitType - catálogo maestro de tipos de permiso
 * Ejemplos: SENIAT-01 (Registro SENIAT), CONATEL (Certificado de Homologación), etc.
 */
export const PermitTypeSchema = z.object({
  id: z.string(),
  code: z.string().min(1),
  name: z.string().min(1),
  agency: z.string().min(1),
  countryCode: z.string().default('VE'),
  validityMonths: z.number().int().nonnegative().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PermitType = z.infer<typeof PermitTypeSchema> | {
  id: string;
  code: string;
  name: string;
  agency: string;
  countryCode: string;
  validityMonths?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Schema for HsPermitRequirement - requisitos por código HS
 * Mapea cada código arancelario de 10 dígitos a los permisos que exige.
 */
export const HsPermitRequirementSchema = z.object({
  id: z.string(),
  hsCode: z.string().regex(/^\d{2,4}(\.\d{2,4}){2,3}$/, 'Código HS de 10 dígitos'),
  permitTypeId: z.string(),
  isRequired: z.boolean().default(true),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type HsPermitRequirement = z.infer<typeof HsPermitRequirementSchema> | {
  id: string;
  hsCode: string;
  permitTypeId: string;
  isRequired: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * PermitFlag - mantiene compatibilidad con el esquema existente
 * Este es el formato que ya usa FilingLine.permits (JSON)
 */
export const PermitFlagSchema = z.object({
  agency: z.string().min(1),
  status: z.enum(['verified', 'pending', 'blocked', 'na']),
  prob: z.number().min(0).max(1).optional(),
});
export type PermitFlag = z.infer<typeof PermitFlagSchema>;

/**
 * Agrupa los flags de permiso por agencia, retornando el peor estado por agencia
 */
export interface AgencyPermits {
  agency: string;
  status: 'verified' | 'pending' | 'blocked';
  lines: Array<{ lineNumber: number; lineId: string; description: string }>;
  count: number;
}

/**
 * Obtiene todos los tipos de permiso del catálogo.
 * En una implementación completa, esta función consultaría la tabla PermitType
 * de la base de datos. Por ahora, retorna tipos de permiso iniciales.
 */
export function getPermitTypes(): PermitType[] {
  return [
    {
      id: 'SENIAT-01',
      code: 'SENIAT-01',
      name: 'Registro SENIAT',
      agency: 'SENIAT',
      countryCode: 'VE',
      validityMonths: 12,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'CONATEL-01',
      code: 'CONATEL-01',
      name: 'Licencia CONATEL',
      agency: 'CONATEL',
      countryCode: 'VE',
      validityMonths: 24,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'INSAI-01',
      code: 'INSAI-01',
      name: 'Fitozoosanitario INSAI',
      agency: 'INSAI',
      countryCode: 'VE',
      validityMonths: 36,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'MPPS-01',
      code: 'MPPS-01',
      name: 'Permiso Sanitario MPPS',
      agency: 'MPPS',
      countryCode: 'VE',
      validityMonths: 12,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Obtiene los requisitos de permiso para un código HS específico.
 * En una implementación completa, esta función consultaría la tabla HsPermitRequirement
 * de la base de datos. Por ahora, retorna requisitos iniciales para códigos comunes.
 * 
 * @param hsCode Código arancelario de 10 dígitos (ej. '8504.40.10.00')
 * @returns Array de requisitos de permiso
 */
export function getRequirementsForHsCode(hsCode: string): HsPermitRequirement[] {
  const requirementsMap: Record<string, HsPermitRequirement> = {
    '8504.40.10.00': {
      id: 'req-SENIAT-001',
      hsCode: '8504.40.10.00',
      permitTypeId: 'SENIAT-01',
      isRequired: true,
      notes: 'Registro SENIAT requerido para equipos electrónicos',
    },
    '8703.23.00.00': {
      id: 'req-CONATEL-001',
      hsCode: '8703.23.00.00',
      permitTypeId: 'CONATEL-01',
      isRequired: true,
      notes: 'Licencia CONATEL requerida para vehículos',
    },
    '3301.13.00.00': {
      id: 'req-INSAI-001',
      hsCode: '3301.13.00.00',
      permitTypeId: 'INSAI-01',
      isRequired: false,
      notes: 'Fitozoosanitario INSAI opcional para aceites esenciales',
    },
    '8517.62.91.00': {
      id: 'req-SENIAT-002',
      hsCode: '8517.62.91.00',
      permitTypeId: 'SENIAT-01',
      isRequired: true,
      notes: 'Registro SENIAT requerido para equipos de potencia',
    },
  };

  const baseRequirement = requirementsMap[hsCode];
  if (!baseRequirement) return [];

  return [baseRequirement];
}

/**
 * Verifica si un expediente tiene todos los permisos obligatorios aprobados.
 * 
 * Esta función revisa cada línea del expediente según su código HS y verifica
 * que existan permisos `verified` para cada requisito obligatorio.
 * 
 * @param filingId ID del expediente a validar
 * @param linePermits Array de flags de permiso de cada línea (formato JSON: {agency, status})
 * @param lines Array de líneas del expediente (para obtener los códigos HS)
 * @returns Objeto con `valid` (booleano) y `missing` (lista de permisos faltantes)
 */
export function validatePermitsForFiling(
  filingId: string,
  linePermits: Array<{ lineNumber: number; permits: any[] }>,
  lines: Array<{ hsCode?: string; lineNumber: number }>
): { valid: boolean; missing: Array<{ lineNumber: number; agency: string; permissionCode: string }> } {
  const missing: Array<{ lineNumber: number; agency: string; permissionCode: string }> = [];

  // Para cada línea, verificar los permisos requeridos según el HS code
  for (const line of lines) {
    if (!line.hsCode) continue;

    const requirements = getRequirementsForHsCode(line.hsCode);

    for (const req of requirements) {
      if (!req.isRequired) continue;

      // Buscar el permiso correspondiente en la línea
      const linePermit = linePermits.find(
        (l) => l.lineNumber === line.lineNumber
      );

      const hasPermit = linePermit?.permits?.some(
        (p: { agency: string; status: string }) => p.agency === req.permitTypeId && p.status === 'verified'
      );

      if (!hasPermit) {
        missing.push({
          lineNumber: line.lineNumber,
          agency: req.permitTypeId,
          permissionCode: req.hsCode,
        });
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

export default {
  getPermitTypes,
  getRequirementsForHsCode,
  validatePermitsForFiling,
};