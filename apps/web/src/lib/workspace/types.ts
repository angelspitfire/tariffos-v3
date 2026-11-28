import type {
  A2UICanvasComponent,
  A2UIDossierComponent,
  A2UIEnvelope,
  A2UIVerdictComponent,
  DossierReviewStatus,
  IncotermCode,
  OperationalStatus,
  ProcessItemProgress,
  ProcessKind,
  StreamProgressEvent,
  UserProfileSettings,
} from '@tariffos/shared-types';

export interface WorkspaceAttachment {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  status?: 'extracting' | 'ready' | 'error';
  extractedText?: string;
  imageDataUrl?: string;
}

export interface WorkspaceMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
  jurisdictionId: string;
  attachments?: WorkspaceAttachment[];
  envelope?: A2UIEnvelope;
  progress?: StreamProgressEvent;
  latencyMs?: number;
}

export interface WorkspaceThread {
  id: string;
  title: string;
  jurisdictionId: string;
  status: 'regular' | 'archived';
  eveSessionId?: string;
  processKind?: ProcessKind;
  operationalStatus?: OperationalStatus;
  clientRef?: string | null;
  primaryHsCode?: string | null;
  itemProgress?: ProcessItemProgress | null;
  createdByUserId?: string | null;
  assignedToUserId?: string | null;
  messagesLoaded?: boolean;
  messages: WorkspaceMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CanvasArtifact {
  id: string;
  title: string;
  code: string;
  createdAt: string;
  components: A2UICanvasComponent[];
}

export interface DossierVersionSnapshot {
  artifactId: string;
  versionNumber: number;
  timestamp: string;
  triggerLabel: string;
  dossier: A2UIDossierComponent;
  verdict?: A2UIVerdictComponent;
}

export interface SkuDraftSeed {
  sku: string;
  title: string;
  description: string;
  hsCode: string;
  jurisdictionId: string;
  adValoremPercent: number;
  vatPercent: number;
  legalRegime: string;
  originCountry?: string;
  incoterm?: IncotermCode;
  notes?: string;
  reviewStatus?: DossierReviewStatus;
}

export interface WorkspaceToast {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'info' | 'warning';
}

export type AnalyticsTabId = 'summary' | 'hs_distribution' | 'hitl_timings' | 'recent_compare';

export const DEFAULT_USER_PROFILE: UserProfileSettings = {
  fullName: 'Agente Aduanal',
  email: 'operaciones@tariffos.app',
  role: 'Agente de Aduanas',
  companyName: 'TariffOS Workspace',
  brokerLicense: 'SENIAT-DEMO',
  themePreference: 'light',
  defaultJurisdictionId: 've-seniat',
  defaultIncoterm: 'FOB',
  preferredCurrency: 'USD',
  detailLevel: 'standard',
  approvalWorkflowMode: 'agent_decides',
  autoOpenCanvas: true,
  updatedAt: new Date(0).toISOString(),
};
