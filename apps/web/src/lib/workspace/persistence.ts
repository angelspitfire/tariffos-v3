import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import { isCloudModeEnabled } from '@/lib/runtime-config';
import { IndexedDBAdapter } from './indexeddb-adapter';
import { SupabaseCloudAdapter } from './supabase-cloud-adapter';
import type { WorkspaceThread } from './types';

export interface LocalBootstrapSnapshot {
  threads: WorkspaceThread[];
  skuPrecedents: SkuPrecedent[];
  profile: UserProfileSettings | null;
}

export interface IPersistence {
  loadLocalBootstrap?: () => Promise<LocalBootstrapSnapshot>;
  loadThreads(): Promise<WorkspaceThread[]>;
  saveThread(thread: WorkspaceThread): Promise<void>;
  deleteThread(threadId: string): Promise<void>;
  loadSkuPrecedents(): Promise<SkuPrecedent[]>;
  saveSkuPrecedent(precedent: SkuPrecedent): Promise<void>;
  deleteSkuPrecedent(id: string): Promise<void>;
  loadUserProfile(): Promise<UserProfileSettings | null>;
  saveUserProfile(profile: UserProfileSettings): Promise<void>;
  clearLocal(): Promise<void>;
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

const DEFAULT_CLOUD_SAVE_DEBOUNCE_MS = 400;

export interface DualWritePersistenceOptions {
  cloudSaveDebounceMs?: number;
}

export class DualWritePersistence implements IPersistence {
  private readonly cloudSaveDebounceMs: number;
  private readonly pendingThreadSaves = new Map<
    string,
    { timer: ReturnType<typeof setTimeout>; thread: WorkspaceThread }
  >();

  constructor(
    private readonly local: IPersistence,
    private readonly cloud?: IPersistence | null,
    options?: DualWritePersistenceOptions,
  ) {
    this.cloudSaveDebounceMs = options?.cloudSaveDebounceMs ?? 0;
  }

  async loadLocalBootstrap(): Promise<{
    threads: WorkspaceThread[];
    skuPrecedents: SkuPrecedent[];
    profile: UserProfileSettings | null;
  }> {
    const [threads, skuPrecedents, profile] = await Promise.all([
      this.local.loadThreads(),
      this.local.loadSkuPrecedents(),
      this.local.loadUserProfile(),
    ]);
    return {
      threads: [...threads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      skuPrecedents,
      profile,
    };
  }

  async loadThreads(): Promise<WorkspaceThread[]> {
    const localThreads = await this.local.loadThreads();
    if (!this.cloud) return localThreads;
    try {
      const remoteThreads = await this.cloud.loadThreads();
      const sortedRemote = [...remoteThreads].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );
      const remoteIds = new Set(sortedRemote.map((t) => t.id));
      for (const localItem of localThreads) {
        if (!remoteIds.has(localItem.id)) {
          await bestEffort(() => this.local.deleteThread(localItem.id));
        }
      }
      await Promise.all(sortedRemote.map((t) => bestEffort(() => this.local.saveThread(t))));
      return sortedRemote;
    } catch {
      return localThreads;
    }
  }

  async saveThread(thread: WorkspaceThread): Promise<void> {
    await this.local.saveThread(thread);
    if (!this.cloud) return;
    if (this.cloudSaveDebounceMs <= 0) {
      await bestEffort(() => this.cloud!.saveThread(thread));
      return;
    }
    const prev = this.pendingThreadSaves.get(thread.id);
    if (prev) clearTimeout(prev.timer);
    const timer = setTimeout(() => {
      const pending = this.pendingThreadSaves.get(thread.id);
      this.pendingThreadSaves.delete(thread.id);
      if (pending) void bestEffort(() => this.cloud!.saveThread(pending.thread));
    }, this.cloudSaveDebounceMs);
    this.pendingThreadSaves.set(thread.id, { timer, thread });
  }

  async deleteThread(threadId: string): Promise<void> {
    const prev = this.pendingThreadSaves.get(threadId);
    if (prev) {
      clearTimeout(prev.timer);
      this.pendingThreadSaves.delete(threadId);
    }
    await this.local.deleteThread(threadId);
    if (this.cloud) await bestEffort(() => this.cloud!.deleteThread(threadId));
  }

  async loadSkuPrecedents(): Promise<SkuPrecedent[]> {
    const localItems = await this.local.loadSkuPrecedents();
    if (!this.cloud) return localItems;
    try {
      const remoteItems = await this.cloud.loadSkuPrecedents();
      const remoteIds = new Set(remoteItems.map((p) => p.id));
      for (const localItem of localItems) {
        if (!remoteIds.has(localItem.id)) {
          await bestEffort(() => this.local.deleteSkuPrecedent(localItem.id));
        }
      }
      await Promise.all(remoteItems.map((p) => bestEffort(() => this.local.saveSkuPrecedent(p))));
      return remoteItems;
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
      const remoteProfile = await this.cloud.loadUserProfile();
      if (remoteProfile) {
        await bestEffort(() => this.local.saveUserProfile(remoteProfile));
      }
      return remoteProfile ?? localProfile;
    } catch {
      return localProfile;
    }
  }

  async saveUserProfile(profile: UserProfileSettings): Promise<void> {
    await this.local.saveUserProfile(profile);
    if (this.cloud) await bestEffort(() => this.cloud!.saveUserProfile(profile));
  }

  async clearLocal(): Promise<void> {
    for (const entry of this.pendingThreadSaves.values()) clearTimeout(entry.timer);
    this.pendingThreadSaves.clear();
    await this.local.clearLocal();
  }
}

export function createWorkspacePersistence(): IPersistence {
  const local = new IndexedDBAdapter();
  const cloud = isCloudModeEnabled() ? new SupabaseCloudAdapter() : null;
  return new DualWritePersistence(local, cloud, {
    cloudSaveDebounceMs: DEFAULT_CLOUD_SAVE_DEBOUNCE_MS,
  });
}
