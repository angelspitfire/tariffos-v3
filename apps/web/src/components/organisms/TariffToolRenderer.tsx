'use client';

import {
  type OrganismPayload,
  type ManifestLineItem,
  type ManifestGridPayload,
  type TaxSummary,
  type DiscrepancyReport,
  type DisambiguationPayload,
} from '@/types/domain';
import { type PermitsMatrixPayload } from '@/types/permits';
import { type ExonerationSimulatorPayload } from '@/types/exoneration';
import { type CustomsDossierPayload } from '@/types/dossier';
import {
  AI_GLOW,
  AI_GLOW_RGBA_12,
  AI_GLOW_RGBA_30,
  AI_GLOW_RGBA_60,
  CONFIDENCE_PERCENT_MULTIPLIER,
  DELTA_USD_DECIMALS,
  DISAMBIGUATION_DELTA_PERCENT,
  DUTY_RELIEF_PERCENT,
  FAVORABLE_DUTY_RATE_PERCENT,
  GENERIC_DUTY_RATE_PERCENT,
  ICON_SIZE_SM,
  ICON_SIZE_MD,
} from '@/__mocks__';
import { GenerativeUIRenderer } from './GenerativeUIRenderer';
import {
  Layers,
  Landmark,
  AlertTriangle,
  FileSearch,
  ArrowRight,
  Sparkles,
  Scale,
  ShieldCheck,
  Coins,
  FileText,
} from 'lucide-react';
import { renderGenerativeUI } from '@assistant-ui/react-generative-ui';
import { library } from '@/lib/generative-ui-library';

export interface TariffGenerativeRendererProps {
  display: unknown;
}

export function TariffGenerativeRenderer({ display }: TariffGenerativeRendererProps) {
  return renderGenerativeUI(display, library, { status: 'done' });
}

export interface TariffOrganismProps {
  organism: OrganismPayload & { display?: unknown };
  onOpenInCanvas?: () => void;
}

export function TariffOrganismRenderer({
  organism,
  onOpenInCanvas,
}: TariffOrganismProps) {
  // If organism has a display tree (from present tool), render generative UI
  if (organism && typeof organism === 'object' && 'display' in organism) {
    return <GenerativeUIRenderer display={organism.display} />;
  }

  let title = '';
  let subtitle = '';
  let highlight = '';
  let Icon = Sparkles;

  if (organism.kind === 'single-item') {
    const item = organism.data as ManifestLineItem;
    title = `Tariff Heading ${item.hsCode}`;
    subtitle = item.description;
    highlight = `${(item.confidence * CONFIDENCE_PERCENT_MULTIPLIER).toFixed(0)}% Certainty · Duty ${item.dutyRate}%`;
    Icon = FileSearch;
  } else if (organism.kind === 'manifest-grid') {
    const grid = organism.data as ManifestGridPayload;
    title = 'Cargo Manifest (Batch)';
    subtitle = `${grid.items.length} items processed · CIF $${grid.totalCif.toLocaleString()}`;
    highlight = '2 approved automatically · 1 requires review';
    Icon = Layers;
  } else if (organism.kind === 'tax-summary') {
    const tax = organism.data as TaxSummary;
    title = 'Cascade Tariff Tax Breakdown';
    subtitle = `Total to settle: $${tax.totalAmount.toLocaleString()} USD`;
    highlight = 'Ad-Valorem + FODINFA + Customs VAT';
    Icon = Landmark;
  } else if (organism.kind === 'discrepancy-report') {
    const disc = organism.data as DiscrepancyReport;
    title = 'BoL vs Invoice Audit';
    subtitle = `${disc.discrepancies.length} inconsistencies detected`;
    highlight = `Critical alert on gross weight (+${DISAMBIGUATION_DELTA_PERCENT}%)`;
    Icon = AlertTriangle;
  } else if (organism.kind === 'disambiguation') {
    const disam = organism.data as DisambiguationPayload;
    title = `Tariff Arbitration: Line #${disam.itemNumber}`;
    subtitle = `Subheading conflict on adapters · CIF $${disam.cifValue.toLocaleString()} USD`;
    highlight = `Estimated fiscal differential: Δ $${disam.deltaUsd.toFixed(DELTA_USD_DECIMALS)} USD (${FAVORABLE_DUTY_RATE_PERCENT}% vs ${GENERIC_DUTY_RATE_PERCENT}%)`;
    Icon = Scale;
  } else if (organism.kind === 'permits-matrix') {
    const permits = organism.data as PermitsMatrixPayload;
    title = 'Non-Tariff Compliance Permits Matrix';
    subtitle = `${permits.totalPermits} approvals · ${permits.lines.length} line items evaluated`;
    highlight = `Status: ${permits.blockingCount} blocking requirement (Red Channel Preventive)`;
    Icon = ShieldCheck;
  } else if (organism.kind === 'exoneration-simulator') {
    const exon = organism.data as ExonerationSimulatorPayload;
    title = 'Trade Agreement & Exoneration Simulator';
    subtitle = `Fiscal projection under trade treaties · CIF $${exon.cifUsd.toLocaleString()}`;
    highlight = `Ad-Valorem duty relief up to ${DUTY_RELIEF_PERCENT}% (EU FTA / CAN)`;
    Icon = Coins;
  } else if (organism.kind === 'customs-dossier') {
    const dossier = organism.data as CustomsDossierPayload;
    title = 'Official Classification Dossier';
    subtitle = `${dossier.dossierNumber} · Binding SENIAT ruling`;
    highlight = `${dossier.items.length} line items ruled · Ready for VUCE`;
    Icon = FileText;
  }

  return (
    <div
      className={`p-3.5 rounded-xl border border-solid border-[${AI_GLOW_RGBA_30}] transition-all hover:border-[${AI_GLOW_RGBA_60}] hover:-translate-y-2 cursor-pointer group`}
      style={{ background: 'var(--surface-raised)' }}
      onClick={onOpenInCanvas}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{
              background: AI_GLOW_RGBA_12,
              color: AI_GLOW,
            }}
          >
            <Icon size={ICON_SIZE_MD} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--purple-text)] font-semibold">
                Customs Document
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success-text)] animate-pulse" />
            </div>
            <h4 className="text-xs font-bold text-zinc-100 truncate">{title}</h4>
            <p className="text-[11px] text-[var(--text-lo)] truncate mt-0.5">{subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenInCanvas?.();
          }}
          className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-md shrink-0 font-medium transition-all group-hover:bg-indigo-600 group-hover:text-white"
          style={{
            background: 'var(--surface-active)',
            color: 'var(--text-hi)',
            border: '1px solid var(--border)',
          }}
        >
          <span>Open</span>
          <ArrowRight size={ICON_SIZE_SM} />
        </button>
      </div>

      <div
        className="mt-2.5 pt-2 flex items-center justify-between text-[11px]"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <span className="text-[var(--text-lo)] truncate">{highlight}</span>
        <span className="text-[10px] font-mono text-[var(--purple-text)] font-medium">Work Desk</span>
      </div>
    </div>
  );
}
