/**
 * IndexedDB Settings Repository Adapter
 * Production persistence for user settings
 */

import { Settings } from '@/domain/repositories';
import { idb } from './IDBDatabase';

export class IndexedDBSettingsRepository {
  async getSettings(): Promise<{ ok: true; value: Settings } | { ok: false; error: Error }> {
    try { const result = await idb.get<Settings>('settings', 'user-settings'); if (!result.ok) throw result.error; return { ok: true, value: result.value ? { ...result.value } : { theme: 'system', toastDuration: 2500, shortcutsEnabled: true, notificationsEnabled: true, language: 'es', autoSaveInterval: 30000 } }; } catch (error) { return { ok: false, error: error instanceof Error ? error : new Error('Failed to get settings') }; }
  }
  async saveSettings(settings: Settings): Promise<{ ok: true; value: undefined } | { ok: false; error: Error }> { try { await idb.put('settings', { ...settings, key: 'user-settings' }); return { ok: true, value: undefined }; } catch (error) { return { ok: false, error: error instanceof Error ? error : new Error('Failed to save settings') }; } }
  async updateTheme(theme: 'system' | 'dark' | 'light'): Promise<{ ok: true; value: undefined } | { ok: false; error: Error }> { const current = await this.getSettings(); if (!current.ok) throw current.error; const updated = { ...current.value, theme }; await this.saveSettings(updated); return { ok: true, value: undefined }; }
  async updateLanguage(language: 'es' | 'en'): Promise<{ ok: true; value: undefined } | { ok: false; error: Error }> { const current = await this.getSettings(); if (!current.ok) throw current.error; const updated = { ...current.value, language }; await this.saveSettings(updated); return { ok: true, value: undefined }; }
}
