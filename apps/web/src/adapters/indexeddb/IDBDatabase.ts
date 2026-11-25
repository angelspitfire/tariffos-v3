/**
 * IDBDatabase — Promise-based wrapper around IndexedDB for TariffOS filings-v2.
 * Schema version 1. Object stores: filings, artifacts, tariffCache, chatHistory, settings.
 */

// ─── Schema constants ────────────────────────────────────────────────────────
export const IDB_SCHEMA_VERSION = 1;
export const IDB_DB_NAME = 'TariffOSFilings';

export const STORE_FILINGS = 'filings';
export const STORE_ARTIFACTS = 'artifacts';
export const STORE_TARIFF_CACHE = 'tariffCache';
export const STORE_CHAT_HISTORY = 'chatHistory';
export const STORE_SETTINGS = 'settings';

// Tariff cache TTL: 7 days in milliseconds
export const TARIFF_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

import {
  NativeIDBDatabase,
  NativeIDBObjectStore,
  NativeIDBTransaction,
} from './_native-types';

// ─── Result pattern ──────────────────────────────────────────────────────────

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ─── IDBDatabase ─────────────────────────────────────────────────────────────

export class IDBDatabase {
  private dbName: string;
  private version: number;
  private db: NativeIDBDatabase | null = null;

  constructor(dbName: string = IDB_DB_NAME, version: number = IDB_SCHEMA_VERSION) {
    this.dbName = dbName;
    this.version = version;
  }

  private open(): Promise<NativeIDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = () => {
        const db = request.result;
        this.createStores(db);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error ?? new Error('Failed to open IndexedDB'));
      };
    });
  }

  private createStores(db: NativeIDBDatabase): void {
    // filings store — key: id, index: filingCode, status
    if (!db.objectStoreNames.contains(STORE_FILINGS)) {
      const store = db.createObjectStore(STORE_FILINGS, { keyPath: 'id' });
      store.createIndex('byFilingCode', 'filingCode', { unique: false });
      store.createIndex('byStatus', 'status', { unique: false });
      store.createIndex('byUpdatedAt', 'updatedAt', { unique: false });
    }

    // artifacts store — key: id, index: filingId, type
    if (!db.objectStoreNames.contains(STORE_ARTIFACTS)) {
      const store = db.createObjectStore(STORE_ARTIFACTS, { keyPath: 'id' });
      store.createIndex('byFilingId', 'filingId', { unique: false });
      store.createIndex('byType', 'type', { unique: false });
    }

    // tariffCache store — key: code
    if (!db.objectStoreNames.contains(STORE_TARIFF_CACHE)) {
      db.createObjectStore(STORE_TARIFF_CACHE, { keyPath: 'code' });
    }

    // chatHistory store — key: id, index: filingId
    if (!db.objectStoreNames.contains(STORE_CHAT_HISTORY)) {
      const store = db.createObjectStore(STORE_CHAT_HISTORY, { keyPath: 'id' });
      store.createIndex('byFilingId', 'filingId', { unique: false });
    }

    // settings store — single record, key: id
    if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
      db.createObjectStore(STORE_SETTINGS, { keyPath: 'id' });
    }
  }

  private getStoreObject(
    storeName: string,
    mode: 'readonly' | 'readwrite' | 'versionchange'
  ): { transaction: NativeIDBTransaction; store: NativeIDBObjectStore } {
    if (!this.db) {
      throw new Error('Database not opened');
    }
    const transaction = this.db.transaction(storeName, mode);
    return { transaction, store: transaction.objectStore(storeName) };
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // ─── Generic helpers ───────────────────────────────────────────────────────

  async get<T>(storeName: string, key: string | IDBValidKey): Promise<Result<T | null>> {
    try {
      await this.open();
      const { store } = this.getStoreObject(storeName, 'readonly');
      return new Promise((resolve) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(ok(request.result as T | null));
        request.onerror = () => resolve(err(request.error ?? new Error(`get failed on ${storeName}`)));
      });
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async put<T>(storeName: string, value: T): Promise<Result<void>> {
    try {
      await this.open();
      const { store, transaction } = this.getStoreObject(storeName, 'readwrite');
      return new Promise((resolve) => {
        const request = store.put(value);
        request.onsuccess = () => resolve(ok(undefined));
        request.onerror = () => resolve(err(request.error ?? new Error(`put failed on ${storeName}`)));
        transaction.oncomplete = () => resolve(ok(undefined));
      });
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async delete(storeName: string, key: string | IDBValidKey): Promise<Result<void>> {
    try {
      await this.open();
      const { store } = this.getStoreObject(storeName, 'readwrite');
      return new Promise((resolve) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve(ok(undefined));
        request.onerror = () => resolve(err(request.error ?? new Error(`delete failed on ${storeName}`)));
      });
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async getAll<T>(storeName: string, indexName?: string): Promise<Result<T[]>> {
    try {
      await this.open();
      const { store } = this.getStoreObject(storeName, 'readonly');
      const target = indexName ? store.index(indexName) : store;
      return new Promise((resolve) => {
        const request = target.getAll();
        request.onsuccess = () => resolve(ok(request.result as T[]));
        request.onerror = () => resolve(err(request.error ?? new Error(`getAll failed on ${storeName}`)));
      });
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async clear(storeName: string): Promise<Result<void>> {
    try {
      await this.open();
      const { store } = this.getStoreObject(storeName, 'readwrite');
      return new Promise((resolve) => {
        const request = store.clear();
        request.onsuccess = () => resolve(ok(undefined));
        request.onerror = () => resolve(err(request.error ?? new Error(`clear failed on ${storeName}`)));
      });
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async count(storeName: string): Promise<Result<number>> {
    try {
      await this.open();
      const { store } = this.getStoreObject(storeName, 'readonly');
      return new Promise((resolve) => {
        const request = store.count();
        request.onsuccess = () => resolve(ok(request.result));
        request.onerror = () => resolve(err(request.error ?? new Error(`count failed on ${storeName}`)));
      });
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  // ─── Migration hook ────────────────────────────────────────────────────────

  async getAllByIndex<T>(
    storeName: string,
    indexName: string,
    keyValue: string | number
  ): Promise<Result<T[]>> {
    try {
      await this.open();
      const { store } = this.getStoreObject(storeName, 'readonly');
      const index = store.index(indexName);
      return new Promise((resolve) => {
        const request = index.getAll(keyValue);
        request.onsuccess = () => resolve(ok(request.result as T[]));
        request.onerror = () =>
          resolve(err(request.error ?? new Error(`getAllByIndex failed on ${storeName}`)));
      });
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  }

  async migrate(_fromVersion: number, _toVersion: number): Promise<Result<void>> {
    // No migrations needed for version 1. Placeholder for future schema upgrades.
    return ok(undefined);
  }
}

// ─── Singleton instance ──────────────────────────────────────────────────────

export const idb = new IDBDatabase();
