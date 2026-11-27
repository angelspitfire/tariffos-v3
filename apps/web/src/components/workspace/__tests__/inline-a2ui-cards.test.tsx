import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  A2UIDisambiguationComponent,
  A2UIDocumentSummaryComponent,
  A2UILegalNoticeComponent,
  A2UIMerceologicalSheetComponent,
  A2UIQuestionnaireComponent,
  A2UIVerdictComponent,
} from '@tariffos/shared-types';
import { buildDefaultMerceologicalSheet } from '@/lib/workspace/merceological-helpers';
import { VerdictCard } from '../molecules/VerdictCard';
import { MerceologicalSheetCard } from '../molecules/MerceologicalSheetCard';
import { QuestionnaireCard } from '../molecules/QuestionnaireCard';
import { DisambiguationCard } from '../molecules/DisambiguationCard';
import { LegalNoticeCard } from '../molecules/LegalNoticeCard';
import { DocumentSummaryCard } from '../molecules/DocumentSummaryCard';

const sampleVerdict: A2UIVerdictComponent = {
  type: 'verdict',
  id: 'v-1',
  hsCode: '8504.40.90.00',
  description: 'Inversor cargador solar híbrido 5 kW MPPT',
  adValoremPercent: 10,
  vatPercent: 16,
  customsFeePercent: 1,
  legalRegimeCode: 'R6',
  legalRegimeSummary: 'Certificado SENCAMER aplicable',
  confidenceLabel: 'Alta (94%)',
  rgiApplied: ['RGI 1', 'RGI 6'],
  executiveSummary: [
    {
      title: 'Riesgo de partida 85.01 descartado',
      severity: 'medium',
      risk: 'No es generador rotativo sino convertidor estático.',
      recommendation: 'Adjuntar ficha técnica con curva MPPT.',
    },
  ],
};

describe('Inline A2UI cards', () => {
  it('VerdictCard copies HS code in 1 click, shows 3 tax tiles, collapses executive summary, and triggers actions', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const onOpenDossier = vi.fn();
    const onOpenCalculator = vi.fn();
    const onExportPdf = vi.fn();
    const onSaveSku = vi.fn();
    const onOpenRgi = vi.fn();

    render(
      <VerdictCard
        verdict={sampleVerdict}
        onOpenDossier={onOpenDossier}
        onOpenCalculator={onOpenCalculator}
        onExportPdf={onExportPdf}
        onSaveSku={onSaveSku}
        onOpenRgi={onOpenRgi}
      />
    );

    expect(screen.getByText('Ad Valorem')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('IVA')).toBeInTheDocument();
    expect(screen.getByText('16%')).toBeInTheDocument();
    expect(screen.getByText('Régimen')).toBeInTheDocument();
    expect(screen.getByText('R6')).toBeInTheDocument();

    // Executive summary collapsed by default
    expect(screen.queryByText(/Riesgo de partida 85\.01 descartado/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Resumen ejecutivo/i }));
    expect(screen.getByText(/Riesgo de partida 85\.01 descartado/)).toBeInTheDocument();

    // 1-click HS copy
    await user.click(screen.getByRole('button', { name: /Copiar código 8504\.40\.90\.00/i }));
    expect(writeText).toHaveBeenCalledWith('8504.40.90.00');
    expect(screen.getByText(/Copiado/i)).toBeInTheDocument();

    // Direct actions
    await user.click(screen.getByRole('button', { name: /Ver Dossier/i }));
    await user.click(screen.getByRole('button', { name: /Calcular CIF/i }));
    await user.click(screen.getByRole('button', { name: /Exportar PDF/i }));
    await user.click(screen.getByRole('button', { name: /Guardar SKU/i }));
    await user.click(screen.getByRole('button', { name: /Camino RGI/i }));

    expect(onOpenDossier).toHaveBeenCalledTimes(1);
    expect(onOpenCalculator).toHaveBeenCalledTimes(1);
    expect(onExportPdf).toHaveBeenCalledTimes(1);
    expect(onSaveSku).toHaveBeenCalledTimes(1);
    expect(onOpenRgi).toHaveBeenCalledTimes(1);
  });

  it('MerceologicalSheetCard collapses to 1 line in confirmed_summary, shows tentative 1-click bar, and submits on Enter', async () => {
    const user = userEvent.setup();
    const sheet = buildDefaultMerceologicalSheet('Motor eléctrico trifásico', {
      naturaleza_materia: 'Carcasa de hierro',
    });

    const confirmedComp: A2UIMerceologicalSheetComponent = {
      type: 'merceological_sheet',
      id: 'ms-confirmed',
      mode: 'confirmed_summary',
      title: 'Ficha Merceológica Validada',
      sheet: { ...sheet, confirmedByUser: true },
    };

    const { rerender } = render(
      <MerceologicalSheetCard component={confirmedComp} onSubmit={vi.fn()} />
    );

    // Collapsed to 1 line — inputs not rendered until expanded
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ficha Merceológica Validada/i })).toBeInTheDocument();

    const hitlComp: A2UIMerceologicalSheetComponent = {
      type: 'merceological_sheet',
      id: 'ms-hitl',
      mode: 'hitl_validation',
      title: 'Validación Merceológica HITL',
      sheet,
    };
    const onSubmit = vi.fn();
    const onAcceptTentative = vi.fn();

    rerender(
      <MerceologicalSheetCard
        component={hitlComp}
        tentativeProposal={{
          hsCode: '8501.52.10.00',
          title: 'Motor CA polifásico > 750 W hasta 75 kW',
          confidencePct: 68,
        }}
        onSubmit={onSubmit}
        onAcceptTentative={onAcceptTentative}
      />
    );

    const tentativeBtn = screen.getByRole('button', { name: /Usar 8501\.52\.10\.00/i });
    await user.click(tentativeBtn);
    expect(onAcceptTentative).toHaveBeenCalledWith('8501.52.10.00');

    // Type into missing critical input and press Enter to submit
    const specInput = screen.getByLabelText(/Especificaciones técnicas/i);
    await user.type(specInput, '15 kW 440V trifásico{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].attributes.find((a: { key: string }) => a.key === 'especificaciones_tecnicas')?.value).toContain('15 kW');
  });

  it('QuestionnaireCard renders 1-click pill chips when options <= 5 and updates live X/N counter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const questionnaire: A2UIQuestionnaireComponent = {
      type: 'questionnaire',
      id: 'q-1',
      title: 'Datos críticos del motor',
      fields: [
        {
          id: 'power',
          label: 'Potencia nominal',
          fieldType: 'select',
          options: ['<= 750 W', '750 W - 75 kW', '> 75 kW'],
        },
        {
          id: 'voltage',
          label: 'Voltaje',
          fieldType: 'text',
          placeholder: '220V',
          unit: 'V',
        },
      ],
    };

    render(<QuestionnaireCard component={questionnaire} onSubmit={onSubmit} />);
    expect(screen.getByText('0/2')).toBeInTheDocument();

    const chip = screen.getByRole('button', { name: '750 W - 75 kW' });
    await user.click(chip);
    expect(screen.getByText('1/2')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('220V'), '440');
    expect(screen.getByText('2/2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Enviar respuestas/i }));
    expect(onSubmit).toHaveBeenCalledWith({ power: '750 W - 75 kW', voltage: '440' });
  });

  it('DisambiguationCard renders numbered options and emits selection on click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const disambig: A2UIDisambiguationComponent = {
      type: 'disambiguation',
      id: 'd-1',
      question: 'Selecciona el rango de potencia',
      options: [
        { id: 'o1', label: 'Hasta 750 W', technicalDetail: 'Motores pequeños', suggestedHsHint: '8501.51' },
        { id: 'o2', label: 'Entre 750 W y 75 kW', technicalDetail: 'Uso industrial', suggestedHsHint: '8501.52' },
      ],
    };

    render(<DisambiguationCard component={disambig} onSelect={onSelect} />);
    const opt2 = screen.getByRole('button', { name: /Entre 750 W y 75 kW/i });
    expect(within(opt2).getByText('2')).toBeInTheDocument();
    await user.click(opt2);
    expect(onSelect).toHaveBeenCalledWith(disambig.options[1]);
  });

  it('LegalNoticeCard collapses to 1 line for info without mandatory permits and expands full checklist for warning/mandatory', async () => {
    const user = userEvent.setup();
    const infoNotice: A2UILegalNoticeComponent = {
      type: 'legal_notice',
      id: 'ln-info',
      severity: 'info',
      authority: 'SENIAT',
      title: 'Régimen ordinario verificado',
      summary: 'Sin permisos previos obligatorios.',
      requiredPermits: [],
    };

    const { rerender } = render(<LegalNoticeCard component={infoNotice} />);
    expect(screen.queryByText('Sin permisos previos obligatorios.')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Régimen ordinario verificado/i }));
    expect(screen.getByText('Sin permisos previos obligatorios.')).toBeInTheDocument();

    const warnNotice: A2UILegalNoticeComponent = {
      type: 'legal_notice',
      id: 'ln-warn',
      severity: 'warning',
      authority: 'SENIAT',
      title: 'Control sanitario SACS requerido',
      summary: 'Requiere permiso previo obligatorio.',
      requiredPermits: [
        { code: 'R4', name: 'Registro Sanitario', organism: 'SACS', mandatory: true },
      ],
    };

    rerender(<LegalNoticeCard component={warnNotice} />);
    expect(screen.getByText('Requiere permiso previo obligatorio.')).toBeInTheDocument();
    expect(screen.getByText(/Registro Sanitario/)).toBeInTheDocument();
  });

  it('DocumentSummaryCard shows batch open CTA when isBatch is true', async () => {
    const user = userEvent.setup();
    const onOpenBatch = vi.fn();
    const docSummary: A2UIDocumentSummaryComponent = {
      type: 'document_summary',
      id: 'doc-1',
      docTypesDetected: ['Bill of Lading', 'Factura Comercial'],
      documentReference: 'INV-2026-0918',
      totalDeclaredValue: 'USD 28,400',
      itemsCount: 4,
      isBatch: true,
    };

    render(<DocumentSummaryCard component={docSummary} onOpenBatch={onOpenBatch} />);
    await user.click(screen.getByRole('button', { name: /Abrir Lote/i }));
    expect(onOpenBatch).toHaveBeenCalledTimes(1);
  });

  it('VerdictCard deduplicates repeated RGI rules before slicing without duplicate React key warnings', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(
        <VerdictCard
          verdict={{
            ...sampleVerdict,
            rgiApplied: ['RGI 1', 'RGI 1', 'RGI 6'],
          }}
        />,
      );

      expect(errorSpy).not.toHaveBeenCalled();
      expect(screen.getAllByText('RGI 1')).toHaveLength(1);
      expect(screen.getByText('RGI 6')).toBeInTheDocument();
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('MerceologicalSheetCard auto-focuses first missing input only on fine-pointer (desktop) devices', () => {
    const originalMatchMedia = window.matchMedia;
    const sheet = buildDefaultMerceologicalSheet('Bomba centrífuga', {});
    const hitlComp: A2UIMerceologicalSheetComponent = {
      type: 'merceological_sheet',
      id: 'ms-focus-test',
      mode: 'hitl_validation',
      title: 'Validación Merceológica',
      sheet,
    };

    try {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });

      const { unmount } = render(
        <MerceologicalSheetCard component={hitlComp} onSubmit={vi.fn()} />,
      );
      expect(document.activeElement).toBe(document.body);
      unmount();

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(pointer: fine)',
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });

      render(<MerceologicalSheetCard component={hitlComp} onSubmit={vi.fn()} />);
      expect(document.activeElement?.tagName).toBe('INPUT');
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: originalMatchMedia,
      });
    }
  });

  it('VerdictCard applies unified rounded-field radius with one primary CTA, one secondary tonal, and three quiet tertiary actions', () => {
    render(<VerdictCard verdict={sampleVerdict} />);

    const dossierBtn = screen.getByRole('button', { name: /Ver Dossier/i });
    const cifBtn = screen.getByRole('button', { name: /Calcular CIF/i });
    const pdfBtn = screen.getByRole('button', { name: /Exportar PDF/i });
    const skuBtn = screen.getByRole('button', { name: /Guardar SKU/i });
    const rgiBtn = screen.getByRole('button', { name: /Camino RGI/i });

    for (const btn of [dossierBtn, cifBtn, pdfBtn, skuBtn, rgiBtn]) {
      expect(btn.className).toContain('rounded-field');
      expect(btn.className).not.toContain('rounded-full');
    }

    expect(dossierBtn.className).toContain('bg-surface-inverted');
    expect(dossierBtn.className).toContain('text-ink-on-inverted');
    expect(cifBtn.className).toContain('bg-surface-muted');
    expect(cifBtn.className).toContain('border-border-subtle');

    for (const quietBtn of [pdfBtn, skuBtn, rgiBtn]) {
      expect(quietBtn.className).not.toContain('bg-accent-brand');
      expect(quietBtn.className).not.toContain('bg-surface-inverted');
      expect(quietBtn.className).toContain('text-ink-secondary');
    }
  });

  it('inline HITL and notice cards expose semantic <h3> headings', () => {
    const sheet = buildDefaultMerceologicalSheet('Válvula industrial', {});
    render(
      <>
        <MerceologicalSheetCard
          component={{
            type: 'merceological_sheet',
            id: 'ms-h3',
            mode: 'hitl_validation',
            title: 'Ficha Técnica HITL',
            sheet,
          }}
          onSubmit={vi.fn()}
        />
        <QuestionnaireCard
          component={{
            type: 'questionnaire',
            id: 'q-h3',
            title: 'Cuestionario técnico',
            fields: [{ id: 'f1', label: 'Material', fieldType: 'text' }],
          }}
          onSubmit={vi.fn()}
        />
        <DisambiguationCard
          component={{
            type: 'disambiguation',
            id: 'd-h3',
            question: 'Elige la opción correcta',
            options: [{ id: 'o1', label: 'Opción A', technicalDetail: 'Detalle A' }],
          }}
          onSelect={vi.fn()}
        />
        <LegalNoticeCard
          component={{
            type: 'legal_notice',
            id: 'ln-h3',
            severity: 'warning',
            authority: 'SENIAT',
            title: 'Aviso normativo SENCAMER',
            summary: 'Requiere revisión previa.',
            requiredPermits: [],
          }}
        />
      </>,
    );

    expect(screen.getByRole('heading', { level: 3, name: 'Ficha Técnica HITL' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Cuestionario técnico' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Elige la opción correcta' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Aviso normativo SENCAMER' })).toBeInTheDocument();
  });
});
