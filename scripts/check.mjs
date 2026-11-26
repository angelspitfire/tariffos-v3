#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const QUICK = process.argv.includes('--quick');
const WARN_LINES = 200;
const MAX_LINES = 300;

function runStep(label, cmd, args) {
  console.log(`\n==> ${label}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit' });
  return res.status === 0;
}

function getChangedSourceFiles() {
  try {
    const tracked = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', 'HEAD'], {
      encoding: 'utf8',
    });
    const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {
      encoding: 'utf8',
    });
    const all = new Set(
      [...tracked.split('\n'), ...untracked.split('\n')]
        .map((f) => f.trim())
        .filter(Boolean),
    );
    return [...all].filter(
      (f) =>
        /\.(ts|tsx)$/.test(f) &&
        !f.includes('/generated/') &&
        !f.includes('/dist/') &&
        !f.includes('/.next/') &&
        existsSync(f),
    );
  } catch {
    return [];
  }
}

let failed = false;

// 1. TypeScript strict check across all workspaces
if (!runStep('1/4 TypeScript (tsc --noEmit)', 'pnpm', ['-r', '--if-present', 'typecheck'])) {
  failed = true;
}

// 2. Oxlint on changed/new TypeScript files (fast & zero legacy noise)
const changedFiles = getChangedSourceFiles();
console.log('\n==> 2/4 Oxlint (changed/new files)');
if (changedFiles.length === 0) {
  console.log('   OK: no changed TS/TSX files to lint');
} else {
  const lintRes = spawnSync('pnpm', ['exec', 'oxlint', ...changedFiles], { stdio: 'inherit' });
  if (lintRes.status !== 0) failed = true;
}

// 3. Module size guardrail on changed/new non-test source files
console.log(`\n==> 3/4 Module size (warn > ${WARN_LINES}, fail > ${MAX_LINES} lines)`);
const nonTestChanged = changedFiles.filter(
  (f) => !/\.test\.tsx?$/.test(f) && !f.includes('/__tests__/') && !f.includes('/__mocks__/'),
);
let sizeClean = true;
for (const file of nonTestChanged) {
  const lines = readFileSync(file, 'utf8').split('\n').length;
  if (lines > MAX_LINES) {
    console.error(`   FAIL: ${file} has ${lines} lines (max ${MAX_LINES}). Split into smaller modules.`);
    failed = true;
    sizeClean = false;
  } else if (lines > WARN_LINES) {
    console.warn(`   WARN: ${file} has ${lines} lines (target <= ${WARN_LINES}).`);
    sizeClean = false;
  }
}
if (sizeClean) {
  console.log('   OK: all changed modules within size target');
}

// 4. Unit tests (skipped in --quick mode)
if (QUICK) {
  console.log('\n==> 4/4 Vitest [skipped in --quick mode]');
} else if (!runStep('4/4 Vitest', 'pnpm', ['-r', '--if-present', 'test'])) {
  failed = true;
}

if (failed) {
  console.error('\nMicro-harness: FAIL — fix the errors above.');
  process.exit(1);
}
console.log('\nMicro-harness: PASS');
