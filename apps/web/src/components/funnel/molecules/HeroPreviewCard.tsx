import { CheckCircle2, FileCheck2, Scale, ShieldCheck, Sparkles } from 'lucide-react';
import { FunnelBadge } from '../atoms/FunnelBadge';

const RGI_STEPS = [
  { rule: 'RGI 1', note: 'Partida 84.13 comprende bombas para líquidos.' },
  { rule: 'RGI 6', note: 'Subpartida 8413.70.10.00 — Electrobombas sumergibles.' },
] as const;

export function HeroPreviewCard() {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-panel shadow-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border-subtle bg-surface-muted flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="text-[11px] font-mono text-ink-muted truncate">
          TariffOS · Expediente #EXP-2026-0842 · VE-SENIAT
        </span>
        <FunnelBadge variant="success">Confianza 96%</FunnelBadge>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="p-3 rounded-xl bg-surface-muted border border-border-hairline text-xs text-ink-secondary">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-1">
            Mercancía declarada (Factura + Ficha Técnica)
          </div>
          <p className="text-ink-primary font-medium leading-snug">
            Bomba centrífuga sumergible trifásica 2 HP, cuerpo de acero inoxidable AISI 304,
            caudal 120 L/min, para pozo profundo.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-accent-border bg-accent-soft/45 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-accent-ink">
                <Scale className="w-3 h-3" />
                Partida arancelaria VE NCM (10 dígitos)
              </div>
              <div className="font-mono text-xl font-bold text-ink-primary tabular-nums mt-0.5">
                8413.70.10.00
              </div>
              <p className="text-[11px] text-ink-secondary mt-0.5">
                Las demás bombas centrífugas — Electrobombas sumergibles.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <FunnelBadge variant="accent">RGI 1</FunnelBadge>
              <FunnelBadge variant="accent">RGI 6</FunnelBadge>
              <FunnelBadge variant="neutral">Decreto 4.944</FunnelBadge>
            </div>
          </div>

          <ul className="space-y-1 pt-2 border-t border-accent-border/60 text-[11px] text-ink-secondary">
            {RGI_STEPS.map((step) => (
              <li key={step.rule} className="flex items-start gap-2">
                <span className="font-mono font-bold text-accent-ink shrink-0">
                  {step.rule}
                </span>
                <span>{step.note}</span>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-accent-border/60 font-mono tabular-nums">
            <div className="p-2 rounded-lg bg-surface-panel border border-border-hairline">
              <div className="text-[10px] text-ink-muted font-sans">Ad Valorem</div>
              <div className="text-sm font-bold text-ink-primary">12%</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-panel border border-border-hairline">
              <div className="text-[10px] text-ink-muted font-sans">IVA</div>
              <div className="text-sm font-bold text-ink-primary">16%</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-panel border border-border-hairline">
              <div className="text-[10px] text-ink-muted font-sans">Tasa Aduanal</div>
              <div className="text-sm font-bold text-ink-primary">1%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
          <div className="p-3 rounded-xl border border-border-subtle bg-surface-panel flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-ink-primary">
                Ficha Merceológica HITL validada
              </div>
              <p className="text-ink-muted mt-0.5">
                7/7 atributos técnicos verificados sin brechas críticas.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-border-subtle bg-surface-panel flex items-start gap-2">
            <FileCheck2 className="w-4 h-4 text-accent-ink shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-ink-primary">
                Dictamen PDF firmado listo
              </div>
              <p className="text-ink-muted mt-0.5">
                Incluye base legal, cálculo CIF y patente del agente.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Trazabilidad completa lista para auditoría aduanera
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-accent-ink">
            <Sparkles className="w-3 h-3" />
            2.4s de análisis
          </span>
        </div>
      </div>
    </div>
  );
}
