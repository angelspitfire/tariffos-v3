import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FORBIDDEN_ARTIFACT_PATTERNS = [
  /(?:^|\/)\.eve\//,
  /(?:^|\/)\.next(?:-check|-e2e)?\//,
  /(?:^|\/)\.output\//,
  /(?:^|\/)dist\//,
  /(?:^|\/)node_modules\//,
  /(?:^|\/)\.vercel\//,
  /(?:^|\/)coverage\//,
  /(?:^|\/)playwright-report\//,
  /(?:^|\/)test-results\//,
];

const TS_ONLY_SOURCE_PREFIX = /^(?:apps\/[^/]+\/src\/|packages\/[^/]+\/src\/|agent\/)/;
const JS_EXT_RE = /\.(?:js|jsx|mjs|cjs)$/i;
const RAW_DIALOG_RE = /\b(?:role=["']dialog["']|aria-modal\b)/;

/**
 * Validates tracked and changed repository paths against two hard rules:
 * 1. Generated/runtime artifact folders (.eve, .next, .next-check, .next-e2e, dist, etc.) must never be tracked in Git.
 * 2. Application/package/agent source code must be TypeScript-only (.ts/.tsx), never JS.
 *
 * @param {string[]} filePaths
 * @returns {Array<{ level: 'error', code: 'tracked_artifact' | 'forbidden_js_source', file: string, message: string }>}
 */
export function checkRepoHygiene(filePaths) {
  const issues = [];

  for (const rawPath of filePaths) {
    const file = rawPath.replaceAll('\\', '/').trim();
    if (!file) continue;

    if (FORBIDDEN_ARTIFACT_PATTERNS.some((re) => re.test(file))) {
      issues.push({
        level: 'error',
        code: 'tracked_artifact',
        file,
        message: `${file}: generated/runtime artifact must not be tracked in Git (check .gitignore)`,
      });
      continue;
    }

    if (
      TS_ONLY_SOURCE_PREFIX.test(file) &&
      !file.includes('/generated/') &&
      JS_EXT_RE.test(file)
    ) {
      issues.push({
        level: 'error',
        code: 'forbidden_js_source',
        file,
        message: `${file}: JavaScript source files are forbidden in apps/packages/agent; use TypeScript (.ts/.tsx)`,
      });
    }
  }

  return issues;
}

/**
 * Ensures workspace dialogs go through WorkspaceDialogShell.tsx rather than raw role="dialog"/aria-modal divs.
 *
 * @param {Array<{ file: string, content: string }>} entries
 * @returns {Array<{ level: 'error', code: 'forbidden_raw_dialog', file: string, message: string }>}
 */
export function checkForbiddenRawDialogs(entries) {
  const issues = [];
  for (const entry of entries) {
    const file = entry.file.replaceAll('\\', '/');
    if (
      !file.endsWith('.tsx') ||
      file.endsWith('.test.tsx') ||
      file.includes('/__tests__/') ||
      file.endsWith('/WorkspaceDialogShell.tsx')
    ) {
      continue;
    }
    if (RAW_DIALOG_RE.test(entry.content)) {
      issues.push({
        level: 'error',
        code: 'forbidden_raw_dialog',
        file,
        message: `${file}: raw role="dialog" or aria-modal is forbidden outside WorkspaceDialogShell.tsx`,
      });
    }
  }
  return issues;
}

/**
 * Scans CSS content block-by-block and rejects duplicate `--token` declarations within the same `{ ... }` block.
 *
 * @param {string} file
 * @param {string} rawCss
 * @returns {Array<{ level: 'error', code: 'duplicate_css_token', file: string, message: string }>}
 */
export function checkDuplicateCssTokens(file, rawCss) {
  const stripped = rawCss.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const lines = stripped.split('\n');
  const blockStack = [];
  const issues = [];

  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx] ?? '';
    for (const ch of line) {
      if (ch === '{') blockStack.push(new Set());
      else if (ch === '}' && blockStack.length > 0) blockStack.pop();
    }
    const currentBlock = blockStack[blockStack.length - 1];
    if (!currentBlock) continue;

    for (const match of line.matchAll(/(?:^|[;\s{])(--[a-zA-Z0-9_-]+)\s*:/g)) {
      const token = match[1];
      if (!token) continue;
      if (currentBlock.has(token)) {
        issues.push({
          level: 'error',
          code: 'duplicate_css_token',
          file,
          message: `${file}:${idx + 1}: duplicate CSS custom property "${token}" in the same block`,
        });
      } else {
        currentBlock.add(token);
      }
    }
  }

  return issues;
}

/**
 * Walks workspace component `.tsx` files and tokens CSS to run architectural UI guardrails.
 *
 * @param {string} rootDir
 * @returns {Array<{ level: 'error', code: string, file: string, message: string }>}
 */
export function runArchitecturalUiGuardrails(rootDir) {
  const workspaceDir = join(rootDir, 'apps', 'web', 'src', 'components', 'workspace');
  const dialogEntries = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (full.endsWith('.tsx')) {
        dialogEntries.push({
          file: full.slice(rootDir.length + 1),
          content: readFileSync(full, 'utf8'),
        });
      }
    }
  };
  walk(workspaceDir);

  const tokensPath = 'apps/web/src/app/tokens.css';
  const tokensCss = readFileSync(join(rootDir, tokensPath), 'utf8');
  return [
    ...checkForbiddenRawDialogs(dialogEntries),
    ...checkDuplicateCssTokens(tokensPath, tokensCss),
  ];
}
