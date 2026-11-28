import type {
  OperationalStatus,
  ProcessKind,
  ProcessScopeFilter,
  SkuPrecedent,
  UserProfileSettings,
} from '@tariffos/shared-types';
import type { WorkspaceThread } from './types';

export interface LocalBootstrapSnapshot {
  threads: WorkspaceThread[];
  skuPrecedents: SkuPrecedent[];
  profile: UserProfileSettings | null;
}

export interface ThreadMetadataPatch {
  title?: string;
  status?: 'regular' | 'archived';
  processKind?: ProcessKind;
  operationalStatus?: OperationalStatus;
  clientRef?: string | null;
}

export interface ThreadSearchParams {
  query?: string;
  status?: OperationalStatus;
  kind?: ProcessKind;
  scope?: ProcessScopeFilter;
  cursor?: string;
  limit?: number;
}

export interface ThreadSearchResult {
  threads: WorkspaceThread[];
  nextCursor: string | null;
  counts?: Record<string, number>;
}

export interface IPersistence {
  loadLocalBootstrap?: () => Promise<LocalBootstrapSnapshot>;
  loadThreads(): Promise<WorkspaceThread[]>;
  loadThreadDetail?: (threadId: string) => Promise<WorkspaceThread | null>;
  patchThreadMeta?: (threadId: string, patch: ThreadMetadataPatch) => Promise<void>;
  searchThreads?: (params: ThreadSearchParams) => Promise<ThreadSearchResult>;
  saveThread(thread: WorkspaceThread): Promise<void>;
  deleteThread(threadId: string): Promise<void>;
  loadSkuPrecedents(): Promise<SkuPrecedent[]>;
  saveSkuPrecedent(precedent: SkuPrecedent): Promise<void>;
  deleteSkuPrecedent(id: string): Promise<void>;
  loadUserProfile(): Promise<UserProfileSettings | null>;
  saveUserProfile(profile: UserProfileSettings): Promise<void>;
  clearLocal(): Promise<void>;
}
