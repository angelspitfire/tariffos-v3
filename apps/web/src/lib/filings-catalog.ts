import type { A2UIArtifact, ManifestLineItem } from '@/types/domain';
import type { CustomsChannel } from '@/lib/customs-channel';
import type { ConversationFile } from '@/types/files';
import { INITIAL_MANIFEST } from '@/__mocks__';

export interface FilingRecord {
  id: string;
  code: string;
  title: string;
  route: string;
  channel: CustomsChannel;
  reasons: string[];
  documents: ConversationFile[];
  manifestArtifact: A2UIArtifact;
}

const AUTOMOTIVE_ITEMS: ManifestLineItem[] = [
  {
    id: 'co-item-1',
    itemNumber: 1,
    hsCode: '8708.80.00.00',
    description: 'Amortiguadores de suspensión para vehículos',
    quantity: 400,
    unit: 'U',
    fobValue: 24000,
    cifValue: 26800,
    dutyRate: 10,
    vatRate: 16,
    confidence: 0.94,
    permits: ['INCONTEC-AUT-44'],
  },
  {
    id: 'co-item-2',
    itemNumber: 2,
    hsCode: '8708.30.00.00',
    description: 'Frenos y servofrenos de disco y sus partes',
    quantity: 250,
    unit: 'JGO',
    fobValue: 18500,
    cifValue: 20600,
    dutyRate: 10,
    vatRate: 16,
    confidence: 0.91,
    permits: ['INCONTEC-AUT-12'],
  },
  {
    id: 'co-item-3',
    itemNumber: 3,
    hsCode: '8511.10.00.00',
    description: 'Bujías de encendido de alto rendimiento',
    quantity: 1200,
    unit: 'U',
    fobValue: 7200,
    cifValue: 8100,
    dutyRate: 5,
    vatRate: 16,
    confidence: 0.96,
    permits: [],
  },
];

const MEDICAL_ITEMS: ManifestLineItem[] = [
  {
    id: 'us-item-1',
    itemNumber: 1,
    hsCode: '9018.19.00.00',
    description: 'Monitores multiparamétricos de signos vitales hospitalarios',
    quantity: 6,
    unit: 'U',
    fobValue: 16800,
    cifValue: 18400,
    dutyRate: 0,
    vatRate: 0,
    confidence: 0.98,
    permits: ['MPPS-REG-MED-2024'],
  },
];

export const MOCK_FILINGS: Record<string, FilingRecord> = {
  'TR-2024-8849-VE': {
    id: 'TR-2024-8849-VE',
    code: 'TR-2024-8849-VE',
    title: 'Electrónica · Shanghai → La Guaira',
    route: 'Shanghai (CNSHA) → La Guaira (VELAG)',
    channel: 'red',
    reasons: [
      '1 requisito regulatorio bloqueante (CONATEL en Línea 3)',
      'Conflicto arancelario pendiente en Adaptadores (Línea 3)',
    ],
    documents: [
      { id: 'doc-8849-1', name: 'Factura_Comercial_INV-2024-9981.pdf', type: 'invoice', typeLabel: 'Factura Comercial', size: '245 KB', uploadedAt: '10:15 AM' },
      { id: 'doc-8849-2', name: 'Packing_List_Shenzhen_Logistics.xlsx', type: 'packing_list', typeLabel: 'Lista de Empaque', size: '112 KB', uploadedAt: '10:15 AM' },
      { id: 'doc-8849-3', name: 'Bill_of_Lading_MSK-9812-EC.pdf', type: 'bol', typeLabel: 'Conocimiento BoL', size: '380 KB', uploadedAt: '10:16 AM' },
    ],
    manifestArtifact: {
      id: 'art-batch-8849',
      type: 'batch-manifest',
      title: 'Manifiesto de Carga (Lote)',
      subtitle: '3 partidas clasificadas · TR-2024-8849-VE',
      badge: 'Lote (3)',
      version: 1,
      timestamp: '12:00',
      data: {
        filingId: 'TR-2024-8849-VE',
        mode: 'batch',
        items: INITIAL_MANIFEST,
        totalCif: 99850,
        totalDuties: 1455,
      },
    },
  },
  'TR-2024-8712-CO': {
    id: 'TR-2024-8712-CO',
    code: 'TR-2024-8712-CO',
    title: 'Repuestos Automotrices · Buenaventura → Cartagena',
    route: 'Buenaventura (COBUN) → Cartagena (COCTG)',
    channel: 'green',
    reasons: [],
    documents: [
      { id: 'doc-8712-1', name: 'Factura_AutoPartes_BUN-2024.pdf', type: 'invoice', typeLabel: 'Factura Comercial', size: '198 KB', uploadedAt: '09:20 AM' },
      { id: 'doc-8712-2', name: 'Certificado_Origen_CO-4412.pdf', type: 'certificate', typeLabel: 'Certificado de Origen', size: '85 KB', uploadedAt: '09:22 AM' },
    ],
    manifestArtifact: {
      id: 'art-batch-8712',
      type: 'batch-manifest',
      title: 'Manifiesto de Carga Automotriz',
      subtitle: '3 partidas automotrices · TR-2024-8712-CO',
      badge: 'Lote (3)',
      version: 1,
      timestamp: '09:30',
      data: {
        filingId: 'TR-2024-8712-CO',
        mode: 'batch',
        items: AUTOMOTIVE_ITEMS,
        totalCif: 55500,
        totalDuties: 5145,
      },
    },
  },
  'TR-2024-8501-US': {
    id: 'TR-2024-8501-US',
    code: 'TR-2024-8501-US',
    title: 'Insumos Médicos · Miami → Maiquetía',
    route: 'Miami (USMIA) → Maiquetía (VEMIQ)',
    channel: 'yellow',
    reasons: ['Revisión documental de registro sanitario MPPS'],
    documents: [
      { id: 'doc-8501-1', name: 'Commercial_Invoice_MIA-8501.pdf', type: 'invoice', typeLabel: 'Factura Comercial', size: '310 KB', uploadedAt: '15:10 PM' },
      { id: 'doc-8501-2', name: 'Registro_Sanitario_MPPS_2024.pdf', type: 'certificate', typeLabel: 'Registro Sanitario', size: '1.2 MB', uploadedAt: '15:12 PM' },
    ],
    manifestArtifact: {
      id: 'art-batch-8501',
      type: 'batch-manifest',
      title: 'Manifiesto de Insumos Médicos',
      subtitle: '1 partida hospitalaria exonerada · TR-2024-8501-US',
      badge: 'Lote (1)',
      version: 1,
      timestamp: '15:15',
      data: {
        filingId: 'TR-2024-8501-US',
        mode: 'batch',
        items: MEDICAL_ITEMS,
        totalCif: 18400,
        totalDuties: 0,
      },
    },
  },
};
