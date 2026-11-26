import { Calculator, FileSpreadsheet, FileText, ShieldCheck } from 'lucide-react';
import { FunnelBadge } from '../atoms/FunnelBadge';
import { FunnelCard } from '../atoms/FunnelCard';

const CAPABILITIES = [
  {
    icon: ShieldCheck,
    title: 'Ficha Merceológica HITL',
    description:
      'Detecta atributos críticos faltantes antes de emitir la partida y documenta el origen técnico de cada dato para auditoría.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Procesamiento por Lotes y Triage',
    description:
      'Sube manifiestos completos en Excel o CSV. TariffOS clasifica cada línea y prioriza automáticamente los ítems que requieren revisión humana.',
  },
  {
    icon: Calculator,
    title: 'Cálculo Tributario y Decretos Oficiales',
    description:
      'Ad Valorem, IVA, tasas aduaneras y regímenes legales (permisos y restricciones) alineados al arancel nacional vigente.',
  },
  {
    icon: FileText,
    title: 'Dictamen PDF con Firma Digital',
    description:
      'Genera informes técnicos listos para entregar a clientes o autoridades, sellados con tu nombre, agencia, patente y firma gráfica.',
  },
] as const;

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Describe o adjunta el expediente',
    detail:
      'Escribe la mercancía o sube factura comercial, packing list, ficha técnica, foto o lote Excel/CSV.',
  },
  {
    step: '02',
    title: 'Valida criterios merceológicos',
    detail:
      'Confirma composición, uso o especificaciones clave en la ficha HITL con trazabilidad RGI 1 a 6.',
  },
  {
    step: '03',
    title: 'Emite dictamen y guarda en tu catálogo',
    detail:
      'Exporta el dictamen técnico PDF firmado, revisa impuestos y reutiliza el precedente en tu catálogo SKU.',
  },
] as const;

const FAQ_ITEMS = [
  {
    q: '¿En qué se diferencia TariffOS de un chat genérico con IA?',
    a: 'TariffOS ejecuta un flujo estructurado de clasificación aduanera: valida atributos merceológicos (HITL), aplica las Reglas Generales de Interpretación (RGI), cruza decretos oficiales y entrega cálculo tributario más dictamen técnico firmable.',
  },
  {
    q: '¿Cómo funciona la facturación manual?',
    a: 'Empiezas con el Trial gratuito al instante. Al elegir un plan comercial, realizas el pago por Zelle, transferencia, Binance Pay o Pago Móvil, reportas la referencia y activamos tu cuenta en menos de 24 horas hábiles.',
  },
  {
    q: '¿Puedo trabajar con lotes grandes de productos?',
    a: 'Sí. Desde el plan Pro puedes cargar archivos Excel/CSV con múltiples mercancías, obtener triage de confianza automático y exportar el manifiesto clasificado.',
  },
  {
    q: '¿Sirve para varias jurisdicciones o solo un país?',
    a: 'TariffOS cuenta con adaptador multi-legislación para operar decretos, alícuotas y regímenes legales por país según la jurisdicción configurada en tu espacio de trabajo.',
  },
] as const;

export function LandingCapabilities() {
  return (
    <>
      <section
        id="capacidades"
        className="py-16 border-t border-border-subtle bg-surface-muted/45"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="max-w-2xl space-y-2">
            <FunnelBadge variant="neutral">Construido para operaciones reales</FunnelBadge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-primary">
              Más rigor técnico que cualquier clasificador genérico
            </h2>
            <p className="text-sm text-ink-muted">
              Cada etapa deja rastro documental para defender tu criterio ante fiscalizaciones
              y acelerar los despachos de tu equipo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <FunnelCard key={cap.title} padding="p-4" className="space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent-ink flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-ink-primary">{cap.title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{cap.description}</p>
                </FunnelCard>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-16 border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="max-w-xl space-y-2">
            <FunnelBadge variant="neutral">Flujo operativo</FunnelBadge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-primary">
              De la factura al dictamen firmado en 3 pasos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WORKFLOW_STEPS.map((item) => (
              <FunnelCard key={item.step} padding="p-6" className="space-y-2.5">
                <span className="font-mono text-xs font-bold text-accent-ink">
                  PASO {item.step}
                </span>
                <h3 className="text-sm font-bold text-ink-primary">{item.title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{item.detail}</p>
              </FunnelCard>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function LandingFaqSection() {
  return (
    <section id="faq" className="py-16 border-t border-border-subtle bg-surface-muted/45">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <FunnelBadge variant="neutral">Preguntas frecuentes</FunnelBadge>
          <h2 className="text-2xl font-bold tracking-tight text-ink-primary">
            Todo lo que necesitas saber antes de activar
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQ_ITEMS.map((item) => (
            <FunnelCard key={item.q} padding="p-4" className="space-y-1.5">
              <h3 className="text-xs font-bold text-ink-primary">{item.q}</h3>
              <p className="text-xs text-ink-muted leading-relaxed">{item.a}</p>
            </FunnelCard>
          ))}
        </div>
      </div>
    </section>
  );
}
