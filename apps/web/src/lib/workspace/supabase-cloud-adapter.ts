import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import type {
  IPersistence,
  ThreadMetadataPatch,
  ThreadSearchParams,
  ThreadSearchResult,
} from './persistence';
import type { WorkspaceThread } from './types';

async function fetchJsonOrThrow<T>(url: string, init?: RequestInit): Promise<T> {
  if (typeof fetch === 'undefined') {
    throw new Error('Fetch API is unavailable');
  }
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Workspace cloud request failed with HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

/**
 * Cloud persistence adapter backed by authenticated Next.js API routes
 * (`ClassificationSession` + `ChatMessage`, `ProductMaster`, `UserProfile`).
 */
export class SupabaseCloudAdapter implements IPersistence {
  async loadThreads(): Promise<WorkspaceThread[]> {
    const data = await fetchJsonOrThrow<{ threads?: WorkspaceThread[] }>(
      '/api/workspace/threads?view=summary&limit=50',
    );
    return Array.isArray(data?.threads) ? data.threads : [];
  }

  async loadThreadDetail(threadId: string): Promise<WorkspaceThread | null> {
    const data = await fetchJsonOrThrow<{ thread?: WorkspaceThread | null }>(
      `/api/workspace/threads/${encodeURIComponent(threadId)}`,
    );
    return data?.thread ?? null;
  }

  async patchThreadMeta(threadId: string, patch: ThreadMetadataPatch): Promise<void> {
    await fetchJsonOrThrow(`/api/workspace/threads/${encodeURIComponent(threadId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
  }

  async searchThreads(params: ThreadSearchParams): Promise<ThreadSearchResult> {
    const qs = new URLSearchParams({ view: 'summary', limit: String(params.limit ?? 30) });
    if (params.query?.trim()) qs.set('q', params.query.trim());
    if (params.status) qs.set('status', params.status);
    if (params.kind) qs.set('kind', params.kind);
    if (params.scope) qs.set('scope', params.scope);
    if (params.cursor) qs.set('cursor', params.cursor);
    const data = await fetchJsonOrThrow<{
      threads?: WorkspaceThread[];
      nextCursor?: string | null;
      counts?: Record<string, number>;
    }>(`/api/workspace/threads?${qs.toString()}`);
    return {
      threads: Array.isArray(data?.threads) ? data.threads : [],
      nextCursor: data?.nextCursor ?? null,
      counts: data?.counts,
    };
  }

  async saveThread(thread: WorkspaceThread): Promise<void> {
    await fetchJsonOrThrow('/api/workspace/threads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thread),
    });
  }

  async deleteThread(threadId: string): Promise<void> {
    await fetchJsonOrThrow(`/api/workspace/threads?id=${encodeURIComponent(threadId)}`, {
      method: 'DELETE',
    });
  }

  async loadSkuPrecedents(): Promise<SkuPrecedent[]> {
    const data = await fetchJsonOrThrow<{ precedents?: SkuPrecedent[] }>('/api/workspace/precedents');
    return Array.isArray(data?.precedents) ? data.precedents : [];
  }

  async saveSkuPrecedent(precedent: SkuPrecedent): Promise<void> {
    await fetchJsonOrThrow('/api/workspace/precedents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(precedent),
    });
  }

  async deleteSkuPrecedent(id: string): Promise<void> {
    await fetchJsonOrThrow(`/api/workspace/precedents?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  async loadUserProfile(): Promise<UserProfileSettings | null> {
    const data = await fetchJsonOrThrow<{ profile?: UserProfileSettings | null }>(
      '/api/workspace/profile',
    );
    return data?.profile ?? null;
  }

  async saveUserProfile(profile: UserProfileSettings): Promise<void> {
    await fetchJsonOrThrow('/api/workspace/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
  }

  async clearLocal(): Promise<void> {
    // Cloud adapter does not own local browser storage.
  }
}
