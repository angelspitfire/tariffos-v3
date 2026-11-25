import { IVA_RATE_PERCENT, FODINFA_RATE_PERCENT, DUTY_RATE_LOW_BAND, DUTY_RATE_MEDIUM_BAND } from '@/__mocks__';
import { TariffItem } from '@/types/tariff-reference';
import { cn } from '@/lib/utils';

interface TariffDutySectionProps {
  item: TariffItem;
}

function dutyRateColor(rate: number | undefined): string {
  if (rate == null) {
    return 'var(--text-muted)';
  }
  if (rate <= DUTY_RATE_LOW_BAND) {
    return 'var(--success-text)';
  }
  if (rate <= DUTY_RATE_MEDIUM_BAND) {
    return 'var(--warning-text)';
  }
  return 'var(--danger-text)';
}

export function TariffDutySection({ item }: TariffDutySectionProps) {
  const dutyRate = item.dutyAdValorem ?? 0;
  const vatRate = item.vat ?? IVA_RATE_PERCENT;
  const fodinfaRate = item.fodinfa ?? FODINFA_RATE_PERCENT;
  const totalEffectiveRate = dutyRate + vatRate + fodinfaRate;

  return (
    <section className="space-y-3">
      <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
        <span className="w-0.5 h-3 rounded-full bg-[var(--brand)]" />
        Derechos e impuestos
      </h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-3 rounded-lg border border-[var(--border-card)] bg-[var(--surface-elevated)]">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Ad-Valorem
          </p>
          <p className={cn('text-lg font-bold font-mono-numbers', dutyRateColor(item.dutyAdValorem))}>
            {item.dutyAdValorem == null ? '-' : `${dutyRate.toFixed(2)}%`}
          </p>
        </div>
        {item.specificDuty != null && item.specificDuty > 0 && (
          <div className="p-3 rounded-lg border border-[var(--border-card)] bg-[var(--surface-elevated)]">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Especifico
            </p>
            <p className="text-lg font-bold font-mono-numbers text-[var(--text-hi)]">
              ${item.specificDuty.toFixed(2)}/KG
            </p>
          </div>
        )}
        <div className="p-3 rounded-lg border border-[var(--border-card)] bg-[var(--surface-elevated)]">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            IVA
          </p>
          <p className="text-lg font-bold font-mono-numbers text-[var(--text-hi)]">{vatRate.toFixed(2)}%</p>
        </div>
        <div className="p-3 rounded-lg border border-[var(--border-card)] bg-[var(--surface-elevated)]">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            FODINFA
          </p>
          <p className="text-lg font-bold font-mono-numbers text-[var(--text-hi)]">{fodinfaRate.toFixed(2)}%</p>
        </div>
      </div>
      <div className="pt-3 border-t border-[var(--border-divider)] flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--text-hi)]">Tasa efectiva total</span>
        <span className="text-sm font-bold font-mono-numbers text-[var(--text-hi)]">
          {totalEffectiveRate.toFixed(2)}%
        </span>
      </div>
      <div className="mt-3 p-3 rounded-lg border border-[var(--border-card)] bg-[var(--surface-elevated)]">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
          Unidad de medida
        </p>
        <p className="text-sm font-mono-numbers text-[var(--text-hi)]">
          {item.unit ?? '-'}
        </p>
      </div>
    </section>
  );
}
