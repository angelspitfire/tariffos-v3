'use client';

import { ArrowRight } from 'lucide-react';
import type { CanvasTabType } from '@tariffos/shared-types';
import type { WorkspaceMessage } from '@/lib/workspace/types';

export interface FollowUpChipsProps {
  message: WorkspaceMessage;
  onSendPrompt: (prompt: string) => void;
  onOpenTab?: (tab: CanvasTabType) => void;
}

interface FollowUpChipItem {
  id: string;
  label: string;
  action: () => void;
}

const TECHNICAL_DOC_RE = /equipo|compresor|motor|máquina|factura|proforma|especificac|modelo|potencia|voltaje/i;
const COMPLEMENTARY_RE = /secador|tanque|filtro|repuesto|complementar|consumible|set\b|accesorio/i;

export function FollowUpChips({
  message,
  onSendPrompt,
  onOpenTab,
}: FollowUpChipsProps) {
  const envelope = message.envelope;
  const dossier = envelope?.canvasComponents.find((c) => c.type === 'dossier');
  const hasCalculator = Boolean(envelope?.canvasComponents.some((c) => c.type === 'calculator'));
  const hasComparison = Boolean(envelope?.canvasComponents.some((c) => c.type === 'comparison'));
  const hasVerdict = Boolean(envelope?.inlineComponents.some((c) => c.type === 'verdict'));

  const chips: FollowUpChipItem[] = [];

  if (dossier) {
    chips.push({
      id: 'cif',
      label: 'Calcular liquidación CIF',
      action: () => {
        if (hasCalculator && onOpenTab) {
          onOpenTab('calculator');
          return;
        }
        onSendPrompt('Calcula la liquidación de tributos CIF para esta partida.');
      },
    });

    if (hasComparison || (dossier.unresolved?.length ?? 0) > 0) {
      chips.push({
        id: 'cap98',
        label: 'Evaluar alternativas / Cap. 98',
        action: () =>
          onSendPrompt(
            'Evalúa las alternativas arancelarias o si aplica algún régimen especial (CAU / Subcapítulo III Cap. 98).',
          ),
      });
    }

    if (COMPLEMENTARY_RE.test(message.text)) {
      chips.push({
        id: 'complementary',
        label: 'Clasificar ítems complementarios',
        action: () =>
          onSendPrompt(
            'Clasifica individualmente los equipos complementarios y repuestos incluidos en la factura.',
          ),
      });
    }
  } else if (!hasVerdict && message.text.trim().length > 100 && TECHNICAL_DOC_RE.test(message.text)) {
    chips.push({
      id: 'classify-main',
      label: 'Clasificar equipo principal',
      action: () =>
        onSendPrompt('Clasifica el equipo principal descrito según RGI 1→6 y el Decreto 4.944.'),
    });
    chips.push({
      id: 'functional-unit',
      label: 'Evaluar Unidad Funcional (Nota 4 Sec. XVI)',
      action: () =>
        onSendPrompt(
          'Evalúa si el conjunto aplica como Unidad Funcional (Nota 4 Sección XVI) o requiere despacho fraccionado.',
        ),
    });
    chips.push({
      id: 'extract-batch',
      label: 'Extraer todos los ítems como lote',
      action: () =>
        onSendPrompt(
          'Extrae y clasifica todos los ítems principales, complementarios y repuestos del documento como manifiesto de lote.',
        ),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pt-1" role="group" aria-label="Acciones sugeridas">
      {chips.slice(0, 3).map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={chip.action}
          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border-subtle bg-surface-panel px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition hover:border-accent-border hover:bg-accent-soft/50 hover:text-accent-ink"
        >
          <span>{chip.label}</span>
          <ArrowRight className="h-3 w-3 opacity-65" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
