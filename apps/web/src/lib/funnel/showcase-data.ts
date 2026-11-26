import type { ComponentType } from 'react';
import {
  Calculator,
  FileSpreadsheet,
  FileText,
  Globe,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export interface ShowcaseCardData {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly metricLabel: string;
  readonly metricValue: string;
  readonly metricDelta: string;
  readonly bars: readonly number[];
  readonly icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

export const SHOWCASE_CARDS: readonly ShowcaseCardData[] = [
  {
    id: 'hitl',
    title: 'Ficha Merceológica HITL',
    description:
      'Detecta atributos críticos faltantes antes de emitir la partida y documenta el origen técnico de cada dato para auditoría.',
    tags: ['Factura PDF', 'Ficha técnica', 'RGI 1 a 6'],
    metricLabel: 'ATRIBUTOS VALIDADOS',
    metricValue: '7 / 7',
    metricDelta: '100% trazable',
    bars: [42, 65, 58, 78, 86, 95, 100],
    icon: ShieldCheck,
  },
  {
    id: 'lotes',
    title: 'Procesamiento por Lotes y Triage',
    description:
      'Sube manifiestos completos en Excel o CSV. TariffOS clasifica cada línea y prioriza automáticamente los ítems que requieren revisión humana.',
    tags: ['Excel XLSX', 'Manifiesto CSV', 'Triage IA'],
    metricLabel: 'CLASIFICACIÓN AUTOMÁTICA',
    metricValue: '94%',
    metricDelta: 'Alta confianza',
    bars: [35, 52, 64, 72, 81, 89, 94],
    icon: FileSpreadsheet,
  },
  {
    id: 'tributos',
    title: 'Cálculo Tributario y Decretos Oficiales',
    description:
      'Ad Valorem, IVA, tasas aduaneras y regímenes legales (permisos y restricciones) alineados al arancel nacional vigente.',
    tags: ['Decreto 4.944', 'Ad Valorem', 'Regímenes'],
    metricLabel: 'BASE IMPONIBLE CIF',
    metricValue: '12% · 16%',
    metricDelta: '+1% Tasa',
    bars: [60, 48, 80, 32, 72, 66, 88],
    icon: Calculator,
  },
  {
    id: 'dictamen',
    title: 'Dictamen PDF con Firma Digital',
    description:
      'Genera informes técnicos listos para entregar a clientes o autoridades, sellados con tu nombre, agencia, patente y firma gráfica.',
    tags: ['PDF Técnico', 'Patente', 'Firma gráfica'],
    metricLabel: 'DICTAMEN AUDITABLE',
    metricValue: '2.4 s',
    metricDelta: 'Listo para entregar',
    bars: [50, 70, 62, 85, 76, 92, 98],
    icon: FileText,
  },
  {
    id: 'sku',
    title: 'Catálogo SKU y Precedentes',
    description:
      'Reutiliza clasificaciones aprobadas en futuras importaciones para mantener consistencia técnica entre todos tus analistas.',
    tags: ['Catálogo SKU', 'Histórico', 'Equipo'],
    metricLabel: 'CONSISTENCIA INTERNA',
    metricValue: '0',
    metricDelta: 'Criterios duplicados',
    bars: [88, 82, 76, 90, 92, 95, 97],
    icon: Layers,
  },
  {
    id: 'jurisdiccion',
    title: 'Adaptador Multi-jurisdicción',
    description:
      'Configura decretos, alícuotas y regímenes legales por país desde el mismo espacio de trabajo.',
    tags: ['VE-SENIAT', 'Arancel Nacional', 'Notas Legales'],
    metricLabel: 'COBERTURA NORMATIVA',
    metricValue: '100%',
    metricDelta: 'Arancel vigente',
    bars: [55, 68, 74, 82, 86, 91, 96],
    icon: Globe,
  },
] as const;
