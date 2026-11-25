/**
 * VenezuelaPermits - IPermitsRegistry implementation for Venezuela.
 * Agencies: SENIAT, CONATEL, ARCSA, INEN, MIPRO.
 * 
 * @package apps/agent/src/countries/VE
 * @layer Country Module - Domain Port Implementation
 */

import { IPermitsRegistry, PermitAgency, ComplianceRule, PermitRequirement, ValidationResult } from '../../domain/ports/permits.port';

export class VenezuelaPermits implements IPermitsRegistry {
  permitAgencies: PermitAgency[] = [
    {
      code: 'SENIAT',
      name: 'Servicio Nacional Integrado de Administración Aduanera y Tributaria',
      category: 'customs',
      requiresDocument: true,
      validityMonths: 12,
      blocking: true
    },
    {
      code: 'CONATEL',
      name: 'Comisión Nacional de Telecomunicaciones',
      category: 'telecom',
      requiresDocument: true,
      validityMonths: 24,
      blocking: true
    },
    {
      code: 'ARCSA',
      name: 'Agencia Nacional de Regulación, Control y Vigilancia Sanitaria',
      category: 'health',
      requiresDocument: true,
      validityMonths: 60,
      blocking: true
    },
    {
      code: 'INEN',
      name: 'Instituto Ecuatoriano de Normalización (referenciado en normas venezolanas)',
      category: 'quality',
      requiresDocument: true,
      validityMonths: 12,
      blocking: false
    },
    {
      code: 'MIPRO',
      name: 'Ministerio del Poder Popular para el Ecosocialismo',
      category: 'environment',
      requiresDocument: true,
      validityMonths: 24,
      blocking: true
    }
  ];

  complianceRules: ComplianceRule[] = [
    {
      id: 'VE-CAP28-HAZMAT',
      hsChapter: '28',
      ruleText: 'Productos químicos inorgánicos requieren licencia ambiental MIPRO y ficha de seguridad',
      severity: 'blocking',
      agencies: ['MIPRO', 'SENIAT']
    },
    {
      id: 'VE-CAP29-HAZMAT',
      hsChapter: '29',
      ruleText: 'Productos químicos orgánicos requieren ficha de seguridad y registro MIPRO',
      severity: 'blocking',
      agencies: ['MIPRO', 'SENIAT']
    },
    {
      id: 'VE-CAP30-PHARMA',
      hsChapter: '30',
      ruleText: 'Medicamentos y productos farmacéuticos requieren registro sanitario ARCSA',
      severity: 'blocking',
      agencies: ['ARCSA', 'SENIAT']
    },
    {
      id: 'VE-CAP85-TELECOM',
      hsChapter: '85',
      ruleText: 'Equipos de telecomunicaciones/radio requieren homologación CONATEL',
      severity: 'blocking',
      agencies: ['CONATEL', 'SENIAT']
    },
    {
      id: 'VE-CAP84-IT',
      hsChapter: '84',
      ruleText: 'Equipos de procesamiento de datos (laptops, servidores) requieren homologación CONATEL si tienen radio',
      severity: 'warning',
      agencies: ['CONATEL']
    }
  ];

  getRequiredPermits(hsCode: string): PermitRequirement[] {
    const requirements: PermitRequirement[] = [];
    const chapter = hsCode.slice(0, 2);
    const heading = hsCode.slice(0, 4);

    // SENIAT always required
    requirements.push({
      permitAgencyCode: 'SENIAT',
      mandatory: true,
      notes: 'Registro de importador obligatorio para todo trámite',
      estimatedCostUsd: 0,
      processingTimeDays: 5
    });

    // Chapter-specific permits
    switch (chapter) {
      case '28':
      case '29':
      case '38':
        requirements.push(
          { permitAgencyCode: 'MIPRO', mandatory: true, notes: 'Licencia ambiental para sustancias químicas', estimatedCostUsd: 500, processingTimeDays: 30 },
          { permitAgencyCode: 'SENIAT', mandatory: true, notes: 'Control de precursores químicos', estimatedCostUsd: 0, processingTimeDays: 10 }
        );
        break;
      case '30':
        requirements.push(
          { permitAgencyCode: 'ARCSA', mandatory: true, notes: 'Registro sanitario obligatorio', estimatedCostUsd: 200, processingTimeDays: 60 }
        );
        break;
      case '85':
        requirements.push(
          { permitAgencyCode: 'CONATEL', mandatory: true, notes: 'Homologación de equipos de telecomunicaciones', estimatedCostUsd: 300, processingTimeDays: 45 }
        );
        break;
      case '84':
        // Check if heading 8471 (computers) - may need CONATEL for radio
        if (heading === '8471') {
          requirements.push(
            { permitAgencyCode: 'CONATEL', mandatory: false, notes: 'Homologación si equipo tiene radio (Wi-Fi/Bluetooth)', estimatedCostUsd: 300, processingTimeDays: 45 }
          );
        }
        break;
      case '90':
        // Medical devices, instruments
        requirements.push(
          { permitAgencyCode: 'ARCSA', mandatory: true, notes: 'Registro sanitario para dispositivos médicos', estimatedCostUsd: 200, processingTimeDays: 60 }
        );
        break;
      case '33':
        // Cosmetics, perfumes
        requirements.push(
          { permitAgencyCode: 'ARCSA', mandatory: true, notes: 'Registro sanitario para cosméticos', estimatedCostUsd: 150, processingTimeDays: 45 }
        );
        break;
    }

    return requirements;
  }

  isBlocking(permitAgencyCode: string, _hsCode: string): boolean {
    const agency = this.permitAgencies.find(a => a.code === permitAgencyCode);
    return agency?.blocking ?? false;
  }

  getAgencyLabel(permitAgencyCode: string): string {
    const agency = this.permitAgencies.find(a => a.code === permitAgencyCode);
    return agency?.name ?? permitAgencyCode;
  }

  validatePermitDocument(permitAgencyCode: string, document: File): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic file validation
    if (document.size > 10 * 1024 * 1024) {
      errors.push('Document exceeds 10MB limit');
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(document.type)) {
      errors.push('Invalid file type. Allowed: PDF, JPEG, PNG');
    }

    // Agency-specific validation
    switch (permitAgencyCode) {
      case 'CONATEL':
        if (!document.name.includes('homologacion') && !document.name.includes('certificado')) {
          warnings.push('Document name should reference "homologación" or "certificado"');
        }
        break;
      case 'ARCSA':
        if (!document.name.includes('registro') && !document.name.includes('sanitario')) {
          warnings.push('Document name should reference "registro sanitario"');
        }
        break;
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}