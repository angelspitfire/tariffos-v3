import { localDev, vercelOidc } from 'eve/channels/auth';
import { eveChannel } from 'eve/channels/eve';
import { createSupabaseChannelAuth } from '../lib/supabase-auth';

export default eveChannel({
  auth: [createSupabaseChannelAuth(), vercelOidc(), localDev()],
  ...(process.env.NODE_ENV !== 'production' ? { cors: true as const } : {}),
});
