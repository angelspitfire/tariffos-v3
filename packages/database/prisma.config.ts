import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import path from 'path';

// static monorepo-relative dotenv paths resolved at build/runtime
// fallow-ignore-next-line security-sink
dotenv.config({ path: path.resolve(__dirname, '../../apps/web/.env.local') });
// fallow-ignore-next-line security-sink
dotenv.config({ path: path.resolve(__dirname, '../../apps/web/.env') });

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
} as Parameters<typeof defineConfig>[0]);
