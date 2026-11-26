const FORBIDDEN_ARTIFACT_PATTERNS = [
  /(?:^|\/)\.eve\//,
  /(?:^|\/)\.next\//,
  /(?:^|\/)dist\//,
  /(?:^|\/)node_modules\//,
  /(?:^|\/)\.vercel\//,
  /(?:^|\/)coverage\//,
];

const TS_ONLY_SOURCE_PREFIX = /^(?:apps\/[^/]+\/src\/|packages\/[^/]+\/src\/|agent\/)/;
const JS_EXT_RE = /\.(?:js|jsx|mjs|cjs)$/i;

/**
 * Validates tracked and changed repository paths against two hard rules:
 * 1. Generated/runtime artifact folders (.eve, .next, dist, etc.) must never be tracked in Git.
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
