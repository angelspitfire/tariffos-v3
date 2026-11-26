const WORKFLOW_PANELS = [
  {
    step: '01',
    category: 'Entrada documental',
    title: 'Describe o adjunta el expediente',
    detail:
      'Escribe la mercancía o sube factura comercial, packing list, ficha técnica, foto o lote Excel/CSV.',
    items: ['Factura comercial', 'Packing list', 'Ficha técnica', 'Fotografía', 'Excel / CSV'],
  },
  {
    step: '02',
    category: 'Validación merceológica',
    title: 'Valida criterios merceológicos',
    detail:
      'Confirma composición, uso o especificaciones clave en la ficha pericial asistida con trazabilidad RGI 1 a 6.',
    items: ['Validación pericial', 'RGI 1 a 6', 'Notas Legales', 'Decreto vigente', 'Regímenes legales'],
  },
  {
    step: '03',
    category: 'Entregables auditables',
    title: 'Emite dictamen y guarda en tu catálogo',
    detail:
      'Exporta el dictamen técnico PDF firmado, revisa impuestos y reutiliza el precedente en tu catálogo SKU.',
    items: ['Dictamen PDF firmado', 'Cálculo CIF e impuestos', 'Patente y firma', 'Catálogo SKU', 'Manifiesto Excel'],
  },
] as const;

export function LandingWorkflowSection() {
  return (
    <section id="como-funciona" className="py-20 sm:py-28">
      <div className="max-w-[1040px] mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-[clamp(2rem,3vw+0.8rem,3.25rem)] font-medium tracking-[-0.03em] text-ink-primary leading-[1.08] [text-wrap:balance] mx-auto">
            De la factura al dictamen firmado en 3 pasos
          </h2>
          <p className="font-mono text-xs sm:text-sm text-ink-secondary">
            Un solo espacio de trabajo conectado a toda tu operación aduanera
          </p>
        </div>

        <ol className="space-y-4">
          {WORKFLOW_PANELS.map((panel) => (
            <li
              key={panel.step}
              className="rounded-[24px] border border-border-subtle bg-surface-panel p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 text-xs font-medium text-accent-ink">
                  <span className="font-mono tabular-nums">{panel.step}</span>
                  <span aria-hidden="true">/</span>
                  <span>{panel.category}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink-primary">
                  {panel.title}
                </h3>
                <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
                  {panel.detail}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                {panel.items.map((item) => (
                  <span
                    key={item}
                    className="px-3.5 py-2 rounded-full text-xs font-medium bg-surface-muted border border-border-subtle text-ink-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
