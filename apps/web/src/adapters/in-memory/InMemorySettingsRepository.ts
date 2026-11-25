/**
 * InMemorySettingsRepository - in-memory implementation of ISettingsRepository.
 * Persists settings to a memory Map.
 */

import {
  ISettingsRepository,
  Settings,
} from '@/domain/repositories';
import { TOAST_DURATION_MS } from '@/lib/constants';
import { Result, Ok } from '@/domain/Result';

const SIMULATED_IO_DELAY_MS = 10;

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  toastDuration: TOAST_DURATION_MS,
  shortcutsEnabled: true,
  notificationsEnabled: true,
  language: 'es',
  autoSaveInterval: 30000,
};

async function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_IO_DELAY_MS));
}

export class InMemorySettingsRepository implements ISettingsRepository {
  private settings: Settings = { ...DEFAULT_SETTINGS };

  async getSettings(): Promise<Result<Settings, Error>> {
    await delay();
    return Ok({ ...this.settings });
  }

  async saveSettings(settings: Settings): Promise<Result<void, Error>> {
    await delay();
    this.settings = { ...settings };
    return Ok(undefined);
  }

  async updateTheme(theme: Settings['theme']): Promise<Result<void, Error>> {
    await delay();
    this.settings = { ...this.settings, theme };
    return Ok(undefined);
  }

  async updateLanguage(language: Settings['language']): Promise<Result<void, Error>> {
    await delay();
    this.settings = { ...this.settings, language };
    return Ok(undefined);
  }
}
