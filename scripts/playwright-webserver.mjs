#!/usr/bin/env node
/**
 * Isolated Playwright webserver launcher for TariffOS web app.
 * Builds an offline production bundle into `.next-e2e` (protecting `tsconfig.json`)
 * and serves it over `http://localhost:<PLAYWRIGHT_PORT>` via `next start`.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB_DIR = path.join(ROOT_DIR, 'apps/web');
const TSCONFIG_PATH = path.join(WEB_DIR, 'tsconfig.json');
const PORT = process.env.PLAYWRIGHT_PORT || '3013';
const DIST_DIR = '.next-e2e';
const BUILD_ID_PATH = path.join(WEB_DIR, DIST_DIR, 'BUILD_ID');

const serverEnv = {
  ...process.env,
  NEXT_PUBLIC_CLOUD_MODE: 'false',
  NEXT_DIST_DIR: DIST_DIR,
};

function restoreTsconfig(snapshot) {
  if (!snapshot) return;
  const current = fs.existsSync(TSCONFIG_PATH) ? fs.readFileSync(TSCONFIG_PATH, 'utf8') : null;
  if (current !== snapshot) {
    fs.writeFileSync(TSCONFIG_PATH, snapshot, 'utf8');
  }
}

const skipBuild = process.env.PLAYWRIGHT_SKIP_BUILD === '1' && fs.existsSync(BUILD_ID_PATH);

if (!skipBuild) {
  const tsconfigSnapshot = fs.existsSync(TSCONFIG_PATH) ? fs.readFileSync(TSCONFIG_PATH, 'utf8') : null;
  try {
    const buildResult = spawnSync('pnpm', ['exec', 'next', 'build', '--webpack'], {
      cwd: WEB_DIR,
      env: serverEnv,
      stdio: 'inherit',
    });
    if (buildResult.error) {
      throw buildResult.error;
    }
    if (buildResult.status !== 0) {
      process.exit(buildResult.status ?? 1);
    }
  } finally {
    restoreTsconfig(tsconfigSnapshot);
  }
}

const child = spawn('pnpm', ['exec', 'next', 'start', '-H', 'localhost', '-p', PORT], {
  cwd: WEB_DIR,
  env: serverEnv,
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
}

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
