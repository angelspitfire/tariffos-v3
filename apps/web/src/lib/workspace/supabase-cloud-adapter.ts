import type { SkuPrecedent, UserProfileSettings } from '@tariffos/shared-types';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { IPersistence } from './persistence';
import type { WorkspaceThread } from './types';

function tryCreateClient() {
  try {
    return createSupabaseBrowserClient();
  } catch {
    return null;
  }
}

export class SupabaseCloudAdapter implements IPersistence {
  private async getUserId(): Promise<string | null> {
    const client = tryCreateClient();
    if (!client) return null;
    try {
      const { data } = await client.auth.getUser();
      return data.user?.id ?? null;
    } catch {
      return null;
    }
  }

  async loadThreads(): Promise<WorkspaceThread[]> {
    const client = tryCreateClient();
    const userId = await this.getUserId();
    if (!client || !userId) return [];
    const { data, error } = await client
      .from('workspace_threads')
      .select('payload')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(50);
    if (error || !data) return [];
    return data
      .map((row) => row.payload as WorkspaceThread)
      .filter((item): item is WorkspaceThread => Boolean(item && item.id));
  }

  async saveThread(thread: WorkspaceThread): Promise<void> {
    const client = tryCreateClient();
    const userId = await this.getUserId();
    if (!client || !userId) return;
    await client.from('workspace_threads').upsert({
      id: thread.id,
      user_id: userId,
      title: thread.title,
      payload: thread,
      updated_at: thread.updatedAt,
    });
  }

  async deleteThread(threadId: string): Promise<void> {
    const client = tryCreateClient();
    const userId = await this.getUserId();
    if (!client || !userId) return;
    await client.from('workspace_threads').delete().eq('id', threadId).eq('user_id', userId);
  }

  async loadSkuPrecedents(): Promise<SkuPrecedent[]> {
    const client = tryCreateClient();
    const userId = await this.getUserId();
    if (!client || !userId) return [];
    const { data, error } = await client
      .from('sku_precedents')
      .select('payload')
      .eq('user_id', userId)
      .limit(200);
    if (error || !data) return [];
    return data
      .map((row) => row.payload as SkuPrecedent)
      .filter((item): item is SkuPrecedent => Boolean(item && item.id));
  }

  async saveSkuPrecedent(precedent: SkuPrecedent): Promise<void> {
    const client = tryCreateClient();
    const userId = await this.getUserId();
    if (!client || !userId) return;
    await client.from('sku_precedents').upsert({
      id: precedent.id,
      user_id: userId,
      sku: precedent.sku,
      payload: precedent,
      updated_at: precedent.updatedAt,
    });
  }

  async deleteSkuPrecedent(id: string): Promise<void> {
    const client = tryCreateClient();
    const userId = await this.getUserId();
    if (!client || !userId) return;
    await client.from('sku_precedents').delete().eq('id', id).eq('user_id', userId);
  }

  async loadUserProfile(): Promise<UserProfileSettings | null> {
    const client = tryCreateClient();
    const userId = await this.getUserId();
    if (!client || !userId) return null;
    const { data, error } = await client
      .from('workspace_profiles')
      .select('payload')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data?.payload) return null;
    return data.payload as UserProfileSettings;
  }

  async saveUserProfile(profile: UserProfileSettings): Promise<void> {
    const client = tryCreateClient();
    const userId = await this.getUserId();
    if (!client || !userId) return;
    await client.from('workspace_profiles').upsert({
      user_id: userId,
      payload: profile,
      updated_at: profile.updatedAt,
    });
  }
}
