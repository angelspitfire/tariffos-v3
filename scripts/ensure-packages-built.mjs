#!/usr/bin/env node
/**
 * Builds workspace packages once per deployment using an atomic lock directory.
 * Safe to invoke concurrently from parallel Vercel service builds (`web` and `eve`).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { verifyWorkspacePackageOutputs } from './lib/workspace-build-guardrail.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const VERCEL_DIR = join(ROOT, '.vercel');
const LOCK_DIR = join(VERCEL_DIR, '.packages-build.lock');
const STAMP_FILE = join(VERCEL_DIR, '.packages-built.stamp');
const POLL_MS = 200;
const MAX_WAIT_MS = 300_000;

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function acquireLock() {
  mkdirSync(VERCEL_DIR, { recursive: true });
  const deadline = Date.now() + MAX_WAIT_MS;
  while (true) {
    try {
      mkdirSync(LOCK_DIR);
      return;
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 'EEXIST') {
        if (Date.now() >= deadline) {
          throw new Error(`Timed out waiting for package build lock: ${LOCK_DIR}`);
        }
        sleepSync(POLL_MS);
        continue;
      }
      throw err;
    }
  }
}

acquireLock();
try {
  if (existsSync(STAMP_FILE) && verifyWorkspacePackageOutputs(ROOT).length === 0) {
    console.log('[ensure-packages-built] Workspace packages already built; skipping.');
    process.exit(0);
  }

  console.log('[ensure-packages-built] Building workspace packages...');
  const res = spawnSync('pnpm', ['build:packages'], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }

  const missing = verifyWorkspacePackageOutputs(ROOT);
  if (missing.length > 0) {
    for (const issue of missing) {
      console.error(`[ensure-packages-built] ${issue.message}`);
    }
    process.exit(1);
  }

  writeFileSync(STAMP_FILE, `${new Date().toISOString()}\n`, 'utf8');
} finally {
  rmSync(LOCK_DIR, { recursive: true, force: true });
}
