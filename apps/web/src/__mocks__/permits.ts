import { PermitsMatrixPayload } from '@/types/permits';

export const INITIAL_PERMITS_DATA: PermitsMatrixPayload = {
  filingId: 'TR-2024-8849-VE',
  filingStatus: 'blocking',
  totalPermits: 5,
  approvedCount: 2,
  pendingCount: 2,
  blockingCount: 1,
  lines: [
    {
      lineItemId: 'item-1',
      itemNumber: 1,
      hsCode: '8471.30.00.00',
      productDescription: 'Computadoras portátiles de peso inferior o igual a 10 kg',
      overallStatus: 'approved',
      permits: [
        {
          id: 'p-1',
          agency: 'SENCAMER',
          code: 'RTE-SENCAMER-001',
          name: 'Certificado de Conformidad - Equipos de Computación',
          status: 'approved',
          notes: 'Certificado acreditado y validado en VUCE.',
          requiredDoc: 'Certificado de Inspección de Origen (SGS/TÜV)',
        },
        {
          id: 'p-2',
          agency: 'MIPRO',
          code: 'REG-MIPRO-2024',
          name: 'Registro de Importador de Bienes Tecnológicos',
          status: 'approved',
          notes: 'Vigencia activa hasta diciembre de 2025.',
          requiredDoc: 'RUC Activo y Ficha Catastral MIPRO',
        },
      ],
    },
    {
      lineItemId: 'item-2',
      itemNumber: 2,
      hsCode: '8528.52.00.00',
      productDescription: 'Monitores capaces de conectarse directamente a máquinas automáticas',
      overallStatus: 'pending',
      permits: [
        {
          id: 'p-3',
          agency: 'SENCAMER',
          code: 'RTE-SENCAMER-028',
          name: 'Reglamento Técnico de Eficiencia Energética (Etiquetado)',
          status: 'pending',
          notes: 'En revisión técnica por técnico de aforo SENIAT.',
          requiredDoc: 'Reporte de laboratorio de eficiencia energética clase A/B',
        },
      ],
    },
    {
      lineItemId: 'item-3',
      itemNumber: 3,
      hsCode: '8504.40.90.00',
      productDescription: 'Adaptadores y convertidores estáticos de corriente alterna/continua',
      overallStatus: 'blocking',
      permits: [
        {
          id: 'p-4',
          agency: 'CONATEL',
          code: 'HOMOL-ARC-889',
          name: 'Homologación de Equipos de Radiocomunicación y Conmutación',
          status: 'blocking',
          notes: 'Falta informe de compatibilidad electromagnética (EMC) del fabricante.',
          requiredDoc: 'Test report laboratorio acreditado ISO/IEC 17025',
        },
        {
          id: 'p-5',
          agency: 'SENCAMER',
          code: 'RTE-SENCAMER-014',
          name: 'Seguridad en Aparatos Electrónicos de Baja Tensión',
          status: 'pending',
          notes: 'Pendiente de adjuntar factura consularizada.',
          requiredDoc: 'Declaración juramentada de conformidad del importador',
        },
      ],
    },
  ],
};
