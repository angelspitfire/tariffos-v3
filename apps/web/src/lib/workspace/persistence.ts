import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { IndexedDBAdapter } from './indexeddb-adapter';
import { SupabaseCloudAdapter } from './supabase-cloud-adapter';
import type { WorkspaceThread } from './types';

export interface IPersistence {
  loadThreads(): Promise<WorkspaceThread[]>;
  saveThread(thread: WorkspaceThread): Promise<void>;
  deleteThread(threadId: string): Promise<void>;
  loadSkuPrecedents(): Promise<SkuPrecedent[]>;
  saveSkuPrecedent(precedent: SkuPrecedent): Promise<void>;
  deleteSkuPrecedent(id: string): Promise<void>;
  loadUserProfile(): Promise<UserProfileSettings | null>;
  saveUserProfile(profile: UserProfileSettings): Promise<void>;
}

export function normalizeSkuKey(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function bestEffort(work: () => Promise<void>): Promise<void> {
  try {
    await work();
  } catch {
    // Cloud mirror is best-effort so local workspace never stalls offline.
  }
}

export class DualWritePersistence implements IPersistence {
  constructor(
    private readonly local: IPersistence,
    private readonly cloud?: IPersistence | null
  ) {}

  async loadThreads(): Promise<WorkspaceThread[]> {
    const localThreads = await this.local.loadThreads();
    if (!this.cloud) return localThreads;
    try {
      const remoteThreads = await this.cloud.loadThreads();
      if (remoteThreads.length === 0) return localThreads;
      const merged = new Map<string, WorkspaceThread>();
      for (const item of localThreads) merged.set(item.id, item);
      for (const item of remoteThreads) {
        const prev = merged.get(item.id);
        if (!prev || item.updatedAt > prev.updatedAt) {
          merged.set(item.id, item);
        }
      }
      return Array.from(merged.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      return localThreads;
    }
  }

  async saveThread(thread: WorkspaceThread): Promise<void> {
    await this.local.saveThread(thread);
    if (this.cloud) await bestEffort(() => this.cloud!.saveThread(thread));
  }

  async deleteThread(threadId: string): Promise<void> {
    await this.local.deleteThread(threadId);
    if (this.cloud) await bestEffort(() => this.cloud!.deleteThread(threadId));
  }

  async loadSkuPrecedents(): Promise<SkuPrecedent[]> {
    const localItems = await this.local.loadSkuPrecedents();
    if (!this.cloud) return localItems;
    try {
      const remoteItems = await this.cloud.loadSkuPrecedents();
      if (remoteItems.length === 0) return localItems;
      const merged = new Map<string, SkuPrecedent>();
      for (const item of localItems) merged.set(item.id, item);
      for (const item of remoteItems) merged.set(item.id, item);
      return Array.from(merged.values());
    } catch {
      return localItems;
    }
  }

  async saveSkuPrecedent(precedent: SkuPrecedent): Promise<void> {
    await this.local.saveSkuPrecedent(precedent);
    if (this.cloud) await bestEffort(() => this.cloud!.saveSkuPrecedent(precedent));
  }

  async deleteSkuPrecedent(id: string): Promise<void> {
    await this.local.deleteSkuPrecedent(id);
    if (this.cloud) await bestEffort(() => this.cloud!.deleteSkuPrecedent(id));
  }

  async loadUserProfile(): Promise<UserProfileSettings | null> {
    const localProfile = await this.local.loadUserProfile();
    if (!this.cloud) return localProfile;
    try {
      return (await this.cloud.loadUserProfile()) ?? localProfile;
    } catch {
      return localProfile;
    }
  }

  async saveUserProfile(profile: UserProfileSettings): Promise<void> {
    await this.local.saveUserProfile(profile);
    if (this.cloud) await bestEffort(() => this.cloud!.saveUserProfile(profile));
  }
}

export function createWorkspacePersistence(): IPersistence {
  const local = new IndexedDBAdapter();
  const cloud = isCloudModeEnabled() ? new SupabaseCloudAdapter() : null;
  return new DualWritePersistence(local, cloud);
}
