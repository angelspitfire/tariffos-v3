import { type A2UIArtifact, type ChatMessage, type ManifestGridPayload } from '@/types/domain';
import { INITIAL_MANIFEST } from '@/__mocks__';

export const DEFAULT_BATCH_ARTIFACT: A2UIArtifact = {
  id: 'art-batch-initial',
  type: 'batch-manifest',
  title: 'Manifiesto de Carga (Lote)',
  subtitle: '3 partidas clasificadas · TR-2024-8849-VE',
  badge: 'Lote (3)',
  version: 1,
  timestamp: '12:00',
  data: {
    filingId: 'TR-2024-8849-VE',
    mode: 'batch',
    items: INITIAL_MANIFEST,
    totalCif: 99850,
    totalDuties: 1455,
  },
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm-init',
    role: 'assistant',
    content:
      'Trámite TR-2024-8849-VE (Shanghai → La Guaira) cargado. Puedes solicitar clasificaciones de un solo ítem o procesar el lote completo del manifiesto.',
    timestamp: '12:00',
    organism: {
      kind: 'manifest-grid',
      data: DEFAULT_BATCH_ARTIFACT.data as ManifestGridPayload,
    },
    artifactId: DEFAULT_BATCH_ARTIFACT.id,
  },
];
