import { DisambiguationPayload } from '@/types/domain';
import { SkeletonCard, SkeletonText } from '@/components/atoms/Skeleton';
import { ShieldCheck, AlertTriangle, FileText } from 'lucide-react';
import { CONFIDENCE_PERCENT_MULTIPLIER, DELTA_USD_DECIMALS } from '@/__mocks__';

function candidateCardClassName(idx: number) {
  if (idx === 0) {
    return 'p-4 rounded-xl border border-[var(--success-border)] bg-[var(--success-subtle)]';
  }
  return 'p-4 rounded-xl border border-[var(--border-card)] bg-[var(--surface-elevated)]';
}

function statusBadge() {
  return 'px-1.5 py-0.5 rounded bg-[var(--success-subtle)] text-[var(--success-text)] font-bold uppercase';
}

export function DisambiguationResolver({ payload, isLoading = false }: { payload: DisambiguationPayload; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <SkeletonCard>
        <SkeletonText lines={5} />
      </SkeletonCard>
    );
  }

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--purple-subtle)', color: 'var(--purple-text)' }}>
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-hi)]">Arbitraje Arancelario OMA / SENIAT</h4>
            <p className="text-[11px] text-[var(--text-lo)]">Línea #{payload.itemNumber} · {payload.productDescription}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--text-muted)]">Diferencial fiscal</p>
          <p className="text-lg font-bold text-[var(--danger-text)] font-mono-numbers">${payload.deltaUsd.toFixed(DELTA_USD_DECIMALS)} USD</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {payload.candidates.map((cand, idx) => (
          <div key={cand.hsCode} className={candidateCardClassName(idx)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-mono text-[var(--purple-text)]">{cand.hsCode}</p>
                <p className="text-xs text-[var(--text-mid)] mt-0.5">{cand.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--text-muted)]">Arancel</p>
                <p className="text-lg font-bold font-mono-numbers text-[var(--text-hi)]">{cand.dutyRate}%</p>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs">
                <span className={statusBadge()}>
                  Confianza
                </span>
                <span className="font-mono-numbers text-[var(--text-hi)]">{(cand.confidence * CONFIDENCE_PERCENT_MULTIPLIER).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-1.5 py-0.5 rounded bg-[var(--danger-subtle)] text-[var(--danger-text)] font-bold uppercase">Total Duty</span>
                <span className="font-mono-numbers text-[var(--text-hi)]">${cand.totalDutyUsd.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <p className="text-[var(--text-muted)]"><span className="font-medium text-[var(--text-lo)]">Fundamento:</span> {cand.legalBasis}</p>
              <p className="text-[var(--text-muted)]"><span className="font-medium text-[var(--text-lo)]">Razón:</span> {cand.rationale}</p>
            </div>

            <div className="mt-3 grid gap-2">
              <div>
                <p className="text-[10px] font-bold text-[var(--success-text)] uppercase tracking-wider mb-1">Ventajas</p>
                <ul className="space-y-1">
                  {cand.pros.map((pro) => (
                    <li key={pro} className="flex items-center gap-1.5 text-[11px] text-[var(--text-mid)]">
                      <ShieldCheck className="w-3 h-3 text-[var(--success-text)] shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--danger-text)] uppercase tracking-wider mb-1">Riesgos</p>
                <ul className="space-y-1">
                  {cand.cons.map((con) => (
                    <li key={con} className="flex items-center gap-1.5 text-[11px] text-[var(--text-mid)]">
                      <AlertTriangle className="w-3 h-3 text-[var(--danger-text)] shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
