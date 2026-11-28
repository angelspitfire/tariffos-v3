#!/usr/bin/env node
/**
 * Clean-clone Vercel deploy simulation.
 * Wipes local `packages/*\/dist` and generated Prisma client, then runs the exact
 * package build + both Vercel services (`eve` and `web`) to catch missing workspace
 * artifacts before pushing.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { verifyWorkspacePackageOutputs } from './lib/workspace-build-guardrail.mjs';

const ROOT = process.cwd();

function runStep(label, cmd, args, extraEnv = {}) {
  console.log(`\n==> ${label}`);
  const res = spawnSync(cmd, args, {
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
  });
  if (res.status !== 0) {
    console.error(`\nDeploy check FAILED at step: ${label}`);
    process.exit(res.status ?? 1);
  }
}

function cleanWorkspacePackageArtifacts() {
  console.log('\n==> 1/4 Clean workspace package dist/ & Prisma generated client');
  const packagesDir = join(ROOT, 'packages');
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const distDir = join(packagesDir, entry.name, 'dist');
    if (existsSync(distDir)) {
      rmSync(distDir, { recursive: true, force: true });
    }
  }
  const prismaGenDir = join(packagesDir, 'database', 'src', 'generated');
  if (existsSync(prismaGenDir)) {
    rmSync(prismaGenDir, { recursive: true, force: true });
  }
  console.log('   OK: removed packages/*/dist and packages/database/src/generated');
}

cleanWorkspacePackageArtifacts();

runStep('2/4 Build all workspace packages (pnpm build:packages)', 'pnpm', ['build:packages']);

const missingOutputs = verifyWorkspacePackageOutputs(ROOT);
if (missingOutputs.length > 0) {
  for (const issue of missingOutputs) {
    console.error(`   FAIL: ${issue.message}`);
  }
  process.exit(1);
}
console.log('   OK: all workspace package dist entrypoints verified');

try {
  runStep(
    '3/4 Build Eve agent service (eve build --skip-sandbox-prewarm)',
    'pnpm',
    ['exec', 'eve', 'build', '--skip-sandbox-prewarm'],
    { EVE_TELEMETRY_DISABLED: '1' },
  );
} finally {
  const nitroOutput = join(ROOT, '.output');
  if (existsSync(nitroOutput)) {
    rmSync(nitroOutput, { recursive: true, force: true });
  }
}

const webTsconfigPath = join(ROOT, 'apps', 'web', 'tsconfig.json');
const originalWebTsconfig = readFileSync(webTsconfigPath, 'utf8');
try {
  runStep(
    '4/4 Build Web Next.js service (NEXT_DIST_DIR=.next-check pnpm --filter web build)',
    'pnpm',
    ['--filter', 'web', 'build'],
    { NEXT_DIST_DIR: '.next-check' },
  );
} finally {
  const nextCheckDir = join(ROOT, 'apps', 'web', '.next-check');
  if (existsSync(nextCheckDir)) {
    rmSync(nextCheckDir, { recursive: true, force: true });
  }
  if (readFileSync(webTsconfigPath, 'utf8') !== originalWebTsconfig) {
    writeFileSync(webTsconfigPath, originalWebTsconfig, 'utf8');
  }
}

console.log('\nDeploy check: PASS (clean packages + eve + web)');
