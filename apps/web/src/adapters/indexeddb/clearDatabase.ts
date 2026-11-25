/**
 * Clear Database Utility
 * Development utility to clear all IndexedDB stores.
 */

import { idb } from './IDBDatabase';

export async function clearDatabase(): Promise<void> {
  const storeNames = [
    'filings',
    'artifacts',
    'tariffCache',
    'chatHistory',
    'settings',
  ];

  for (const storeName of storeNames) {
    await idb.clear(storeName);
  }

  console.log('All IndexedDB stores cleared');
}

export async function getDatabaseStats(): Promise<Record<string, number>> {
  const storeNames = [
    'filings',
    'artifacts',
    'tariffCache',
    'chatHistory',
    'settings',
  ];

  const stats: Record<string, number> = {};

  for (const storeName of storeNames) {
    const result = await idb.count(storeName);
    stats[storeName] = result.ok ? result.value : 0;
  }

  return stats;
}

// Auto-run in development if ?clear-db query param present
if (typeof window !== 'undefined' && window.location.search.includes('clear-db')) {
  clearDatabase().then(() => {
    window.location.search = '';
    window.location.reload();
  });
}
