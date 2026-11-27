import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import type { IPersistence } from './persistence';
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
    const data = await fetchJsonOrThrow<{ threads?: WorkspaceThread[] }>('/api/workspace/threads');
    return Array.isArray(data?.threads) ? data.threads : [];
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
    const data = await fetchJsonOrThrow<{ precedents?: SkuPrecedent[] }>(
      '/api/workspace/precedents',
    );
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
