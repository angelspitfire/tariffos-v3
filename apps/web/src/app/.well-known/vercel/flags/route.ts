import { createFlagsDiscoveryEndpoint } from 'flags/next';
import { APP_FLAGS, getFlagsDiscoveryData } from '../../../../lib/flags';

export const GET = createFlagsDiscoveryEndpoint(async () => {
  return getFlagsDiscoveryData(APP_FLAGS);
});
