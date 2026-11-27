import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import type { IPersistence } from './persistence';
import type { WorkspaceThread } from './types';

const DB_NAME = 'tariffos-v3-workspace';
const DB_VERSION = 1;
const STORE_THREADS = 'threads';
const STORE_SKUS = 'sku_precedents';
const STORE_PROFILE = 'user_profile';
const PROFILE_RECORD_KEY = 'default';

interface IndexedDBAdapterOptions {
  forceMemoryFallback?: boolean;
}

export class IndexedDBAdapter implements IPersistence {
  private readonly memoryThreads = new Map<string, WorkspaceThread>();
  private readonly memorySkus = new Map<string, SkuPrecedent>();
  private memoryProfile: UserProfileSettings | null = null;
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private readonly forceMemoryFallback: boolean;

  constructor(options?: IndexedDBAdapterOptions) {
    this.forceMemoryFallback = Boolean(options?.forceMemoryFallback);
  }

  private getDb(): Promise<IDBDatabase | null> {
    if (this.forceMemoryFallback || typeof indexedDB === 'undefined') {
      return Promise.resolve(null);
    }
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise<IDBDatabase | null>((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_THREADS)) {
            db.createObjectStore(STORE_THREADS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_SKUS)) {
            db.createObjectStore(STORE_SKUS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_PROFILE)) {
            db.createObjectStore(STORE_PROFILE);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    return this.dbPromise;
  }

  private async runStore<T>(
    storeName: string,
    mode: IDBTransactionMode,
    executor: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T | undefined> {
    const db = await this.getDb();
    if (!db) return undefined;
    return new Promise<T | undefined>((resolve) => {
      try {
        const tx = db.transaction(storeName, mode);
        const req = executor(tx.objectStore(storeName));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(undefined);
      } catch {
        resolve(undefined);
      }
    });
  }

  async loadThreads(): Promise<WorkspaceThread[]> {
    const db = await this.getDb();
    if (!db) {
      return Array.from(this.memoryThreads.values()).sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt)
      );
    }
    const items = await this.runStore<WorkspaceThread[]>(STORE_THREADS, 'readonly', (s) =>
      s.getAll()
    );
    return (items ?? []).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async saveThread(thread: WorkspaceThread): Promise<void> {
    this.memoryThreads.set(thread.id, thread);
    await this.runStore(STORE_THREADS, 'readwrite', (s) => s.put(thread));
  }

  async deleteThread(threadId: string): Promise<void> {
    this.memoryThreads.delete(threadId);
    await this.runStore(STORE_THREADS, 'readwrite', (s) => s.delete(threadId));
  }

  async loadSkuPrecedents(): Promise<SkuPrecedent[]> {
    const db = await this.getDb();
    if (!db) return Array.from(this.memorySkus.values());
    const items = await this.runStore<SkuPrecedent[]>(STORE_SKUS, 'readonly', (s) => s.getAll());
    return items ?? [];
  }

  async saveSkuPrecedent(precedent: SkuPrecedent): Promise<void> {
    this.memorySkus.set(precedent.id, precedent);
    await this.runStore(STORE_SKUS, 'readwrite', (s) => s.put(precedent));
  }

  async deleteSkuPrecedent(id: string): Promise<void> {
    this.memorySkus.delete(id);
    await this.runStore(STORE_SKUS, 'readwrite', (s) => s.delete(id));
  }

  async loadUserProfile(): Promise<UserProfileSettings | null> {
    const db = await this.getDb();
    if (!db) return this.memoryProfile;
    const result = await this.runStore<UserProfileSettings | undefined>(
      STORE_PROFILE,
      'readonly',
      (s) => s.get(PROFILE_RECORD_KEY)
    );
    return result ?? this.memoryProfile;
  }

  async saveUserProfile(profile: UserProfileSettings): Promise<void> {
    this.memoryProfile = profile;
    await this.runStore(STORE_PROFILE, 'readwrite', (s) => s.put(profile, PROFILE_RECORD_KEY));
  }

  async clearLocal(): Promise<void> {
    this.memoryThreads.clear();
    this.memorySkus.clear();
    this.memoryProfile = null;
    await Promise.all([
      this.runStore(STORE_THREADS, 'readwrite', (s) => s.clear()),
      this.runStore(STORE_SKUS, 'readwrite', (s) => s.clear()),
      this.runStore(STORE_PROFILE, 'readwrite', (s) => s.clear()),
    ]);
  }
}
