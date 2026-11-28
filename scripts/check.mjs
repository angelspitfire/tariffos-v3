#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { isDbRelatedPath } from './lib/db-guardrails.mjs';
import { checkRepoHygiene, runArchitecturalUiGuardrails } from './lib/repo-guardrails.mjs';
import { verifyWorkspacePackageOutputs } from './lib/workspace-build-guardrail.mjs';

const QUICK = process.argv.includes('--quick');
const WARN_LINES = 200;
const MAX_LINES = 300;

function runStep(label, cmd, args) {
  console.log(`\n==> ${label}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit' });
  return res.status === 0;
}

function getAllChangedFiles() {
  try {
    const tracked = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', 'HEAD'], {
      encoding: 'utf8',
    });
    const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {
      encoding: 'utf8',
    });
    return [
      ...new Set(
        [...tracked.split('\n'), ...untracked.split('\n')]
          .map((f) => f.trim())
          .filter((f) => Boolean(f) && existsSync(f)),
      ),
    ];
  } catch {
    return [];
  }
}

function getGitTrackedFiles() {
  try {
    return execFileSync('git', ['ls-files'], { encoding: 'utf8' })
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const allChangedFiles = getAllChangedFiles();
const changedFiles = allChangedFiles.filter(
  (f) =>
    /\.(ts|tsx)$/.test(f) &&
    !f.includes('/generated/') &&
    !f.includes('/dist/') &&
    !f.includes('/.next/'),
);
const changedDbFiles = allChangedFiles.filter((f) => isDbRelatedPath(f));

let failed = false;

// 1. TypeScript strict check across all workspaces
if (!runStep('1/5 TypeScript (tsc --noEmit)', 'pnpm', ['-r', '--if-present', 'typecheck'])) {
  failed = true;
}

// 2. Oxlint (--type-aware --type-check) on clean workspaces + changed files in packages/database
const OXLINT_CLEAN_DIRS = [
  'apps/web/src',
  'packages/agent/src',
  'packages/ai-client/src',
  'packages/shared-types/src',
  'packages/env/src',
  'packages/logger/src',
];
if (
  !runStep('2/5 Oxlint (--type-aware --type-check on clean workspaces)', 'pnpm', [
    'exec',
    'oxlint',
    '--type-aware',
    '--type-check',
    '--quiet',
    ...OXLINT_CLEAN_DIRS,
  ])
) {
  failed = true;
}
const dbChangedFiles = changedFiles.filter((f) => f.startsWith('packages/database/'));
if (dbChangedFiles.length > 0) {
  if (!runStep('2b/5 Oxlint (changed files in packages/database)', 'pnpm', ['exec', 'oxlint', ...dbChangedFiles])) {
    failed = true;
  }
}

// 3. Module size guardrail on changed/new non-test source files
console.log(`\n==> 3/5 Module size (warn > ${WARN_LINES}, fail > ${MAX_LINES} lines)`);
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

// 3b. DB static guardrails (runs ONLY when Prisma schema, SQL migrations, or supabase/ files changed)
if (changedDbFiles.length > 0) {
  if (!runStep('3b/5 DB static guardrails (RLS, policies, indexes)', 'node', ['scripts/check-db-static.mjs', ...changedDbFiles])) {
    failed = true;
  }
}

// 3c. Repo hygiene guardrail (TS-only source files + no tracked .eve/.next/dist artifacts)
console.log('\n==> 3c/5 Repo hygiene (TypeScript-only source & no tracked artifacts)');
const hygieneTargets = [...new Set([...getGitTrackedFiles(), ...allChangedFiles])];
const hygieneIssues = checkRepoHygiene(hygieneTargets);
if (hygieneIssues.length > 0) {
  for (const issue of hygieneIssues.slice(0, 20)) {
    console.error(`   FAIL [${issue.code}]: ${issue.message}`);
  }
  if (hygieneIssues.length > 20) {
    console.error(`   ... and ${hygieneIssues.length - 20} more repo hygiene violation(s).`);
  }
  failed = true;
} else {
  console.log(`   OK: ${hygieneTargets.length} tracked/changed files verified (0 JS source files, 0 tracked artifacts)`);
}

// 3d. Architectural UI guardrails (single dialog shell + non-duplicate CSS tokens)
console.log('\n==> 3d/5 Architectural UI guardrails (WorkspaceDialogShell + tokens.css)');
const uiIssues = runArchitecturalUiGuardrails(process.cwd());
if (uiIssues.length > 0) {
  for (const issue of uiIssues.slice(0, 20)) {
    console.error(`   FAIL [${issue.code}]: ${issue.message}`);
  }
  failed = true;
} else {
  console.log('   OK: WorkspaceDialogShell uniqueness & tokens.css custom properties verified');
}

// 4. Unit tests (skipped in --quick mode)
if (QUICK) {
  console.log('\n==> 4/5 Vitest [skipped in --quick mode]');
} else if (!runStep('4/5 Vitest', 'pnpm', ['-r', '--if-present', 'test'])) {
  failed = true;
}

// 5. Workspace packages build + output verification (skipped in --quick mode)
if (QUICK) {
  console.log('\n==> 5/5 Workspace packages build (pnpm build:packages) [skipped in --quick mode]');
} else if (!runStep('5/5 Workspace packages build (pnpm build:packages)', 'pnpm', ['build:packages'])) {
  failed = true;
} else {
  const missingOutputs = verifyWorkspacePackageOutputs(process.cwd());
  if (missingOutputs.length > 0) {
    for (const issue of missingOutputs) {
      console.error(`   FAIL: ${issue.message}`);
    }
    failed = true;
  } else {
    console.log('   OK: all workspace packages produced their declared dist entrypoints');
  }
}

if (failed) {
  console.error('\nMicro-harness: FAIL — fix the errors above.');
  process.exit(1);
}
console.log('\nMicro-harness: PASS');
