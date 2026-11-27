import type {
  A2UIDisambiguationOption,
  A2UIMerceologicalSheet,
  CanvasTabType,
} from '@tariffos/shared-types';
import type { InlineCardActions } from '@/components/workspace/organisms/ThreadInlineCards';
import type { WorkspaceMessage } from './types';

interface BuildInlineActionsParams {
  onSelectCanvasMessage: (messageId: string, tab: CanvasTabType) => void;
  onExportPdf: (message: WorkspaceMessage) => void;
  onSaveSku: (message: WorkspaceMessage) => void;
  onClassify: (prompt: string) => void;
}

export function buildWorkspaceInlineActions({
  onSelectCanvasMessage,
  onExportPdf,
  onSaveSku,
  onClassify,
}: BuildInlineActionsParams): InlineCardActions {
  return {
    onOpenCanvasTab: (msg, tab) => onSelectCanvasMessage(msg.id, tab),
    onExportPdf: (msg) => onExportPdf(msg),
    onSaveSku,
    onSubmitSheet: (sheet: A2UIMerceologicalSheet) => {
      const summary = sheet.attributes
        .filter((a) => a.value.trim())
        .map((a) => `${a.label}: ${a.value}`)
        .join('; ');
      onClassify(`Ficha merceológica confirmada para ${sheet.productName}: ${summary}`);
    },
    onAcceptTentative: (hsCode) =>
      onClassify(`Confirmo adoptar la hipótesis preliminar ${hsCode} y emitir dictamen completo.`),
    onSubmitQuestionnaire: (answers) => {
      const text = Object.entries(answers)
        .filter(([, v]) => v.trim())
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      onClassify(`Especificaciones complementarias: ${text}`);
    },
    onSelectDisambiguation: (opt: A2UIDisambiguationOption) =>
      onClassify(
        `Opción seleccionada: ${opt.label}${opt.suggestedHsHint ? ` (${opt.suggestedHsHint})` : ''}`
      ),
    onSendFollowUp: (prompt: string) => onClassify(prompt),
  };
}
