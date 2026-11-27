'use client';

import type {
  A2UIDisambiguationOption,
  A2UIMerceologicalSheet,
  CanvasTabType,
} from '@tariffos/shared-types';
import type { WorkspaceMessage } from '@/lib/workspace/types';
import { DisambiguationCard } from '../molecules/DisambiguationCard';
import { DocumentSummaryCard } from '../molecules/DocumentSummaryCard';
import { LegalNoticeCard } from '../molecules/LegalNoticeCard';
import { MerceologicalSheetCard } from '../molecules/MerceologicalSheetCard';
import { QuestionnaireCard } from '../molecules/QuestionnaireCard';
import { VerdictCard } from '../molecules/VerdictCard';

export interface InlineCardActions {
  onOpenCanvasTab: (msg: WorkspaceMessage, tab: CanvasTabType) => void;
  onExportPdf: (msg: WorkspaceMessage) => void;
  onSaveSku: (msg: WorkspaceMessage) => void;
  onSubmitSheet: (sheet: A2UIMerceologicalSheet) => void;
  onAcceptTentative: (hsCode: string) => void;
  onSubmitQuestionnaire: (answers: Record<string, string>) => void;
  onSelectDisambiguation: (opt: A2UIDisambiguationOption) => void;
  onSendFollowUp?: (prompt: string) => void;
}

export function ThreadInlineCards({
  message,
  actions,
}: {
  message: WorkspaceMessage;
  actions: InlineCardActions;
}) {
  const envelope = message.envelope;
  if (!envelope || envelope.inlineComponents.length === 0) return null;

  return (
    <div className="mt-3 space-y-3">
      {envelope.inlineComponents.map((comp) => {
        switch (comp.type) {
          case 'verdict':
            return (
              <VerdictCard
                key={comp.id}
                verdict={comp}
                onOpenDossier={() => actions.onOpenCanvasTab(message, 'dossier')}
                onOpenCalculator={() => actions.onOpenCanvasTab(message, 'calculator')}
                onExportPdf={() => actions.onExportPdf(message)}
                onSaveSku={() => actions.onSaveSku(message)}
                onOpenRgi={() => actions.onOpenCanvasTab(message, 'rgi_comparator')}
              />
            );
          case 'merceological_sheet':
            return (
              <MerceologicalSheetCard
                key={comp.id}
                component={comp}
                tentativeProposal={envelope.decision?.tentativeProposal}
                onAcceptTentative={actions.onAcceptTentative}
                onSubmit={actions.onSubmitSheet}
              />
            );
          case 'questionnaire':
            return (
              <QuestionnaireCard
                key={comp.id}
                component={comp}
                onSubmit={actions.onSubmitQuestionnaire}
              />
            );
          case 'disambiguation':
            return (
              <DisambiguationCard
                key={comp.id}
                component={comp}
                onSelect={actions.onSelectDisambiguation}
              />
            );
          case 'legal_notice':
            return <LegalNoticeCard key={comp.id} component={comp} />;
          case 'document_summary':
            return (
              <DocumentSummaryCard
                key={comp.id}
                component={comp}
                onOpenBatch={() => actions.onOpenCanvasTab(message, 'batch_manifest')}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
