import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import type { IPersistence } from './persistence';
import type { WorkspaceThread } from './types';

async function safeFetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  if (typeof fetch === 'undefined') return null;
  try {
    const res = await fetch(url, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Cloud persistence adapter backed by authenticated Next.js API routes
 * (`ClassificationSession` + `ChatMessage`, `ProductMaster`, `UserProfile`).
 */
export class SupabaseCloudAdapter implements IPersistence {
  async loadThreads(): Promise<WorkspaceThread[]> {
    const data = await safeFetchJson<{ threads?: WorkspaceThread[] }>('/api/workspace/threads');
    return Array.isArray(data?.threads) ? data.threads : [];
  }

  async saveThread(thread: WorkspaceThread): Promise<void> {
    await safeFetchJson('/api/workspace/threads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thread),
    });
  }

  async deleteThread(threadId: string): Promise<void> {
    await safeFetchJson(`/api/workspace/threads?id=${encodeURIComponent(threadId)}`, {
      method: 'DELETE',
    });
  }

  async loadSkuPrecedents(): Promise<SkuPrecedent[]> {
    const data = await safeFetchJson<{ precedents?: SkuPrecedent[] }>(
      '/api/workspace/precedents',
    );
    return Array.isArray(data?.precedents) ? data.precedents : [];
  }

  async saveSkuPrecedent(precedent: SkuPrecedent): Promise<void> {
    await safeFetchJson('/api/workspace/precedents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(precedent),
    });
  }

  async deleteSkuPrecedent(id: string): Promise<void> {
    await safeFetchJson(`/api/workspace/precedents?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  async loadUserProfile(): Promise<UserProfileSettings | null> {
    const data = await safeFetchJson<{ profile?: UserProfileSettings | null }>(
      '/api/workspace/profile',
    );
    return data?.profile ?? null;
  }

  async saveUserProfile(profile: UserProfileSettings): Promise<void> {
    await safeFetchJson('/api/workspace/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
  }
}
