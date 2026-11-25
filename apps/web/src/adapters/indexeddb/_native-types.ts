/**
 * Native IndexedDB type aliases.
 * Placed in a separate file so the global `IDBDatabase` type is not
 * shadowed by the `IDBDatabase` class in IDBDatabase.ts.
 */

export type NativeIDBDatabase = IDBDatabase;
export type NativeIDBTransaction = IDBTransaction;
export type NativeIDBObjectStore = IDBObjectStore;
