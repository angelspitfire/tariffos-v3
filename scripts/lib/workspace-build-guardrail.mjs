import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Verifies that every workspace package under `packages/*` produced its
 * declared `main` and `types` build entrypoints on disk.
 * Catches silent `pnpm --filter` misses before they break Vercel/CI builds.
 *
 * @param {string} rootDir
 * @returns {Array<{ pkg: string, field: 'main' | 'types', expectedPath: string, message: string }>}
 */
export function verifyWorkspacePackageOutputs(rootDir = process.cwd()) {
  const packagesDir = join(rootDir, 'packages');
  if (!existsSync(packagesDir)) return [];

  const issues = [];
  const entries = readdirSync(packagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const pkgDir = join(packagesDir, entry.name);
    const pkgJsonPath = join(pkgDir, 'package.json');
    if (!existsSync(pkgJsonPath)) continue;

    const manifest = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    const pkgName = manifest.name ?? `packages/${entry.name}`;

    for (const field of /** @type {const} */ (['main', 'types'])) {
      const relTarget = manifest[field];
      if (typeof relTarget !== 'string' || !relTarget.trim()) continue;
      const absTarget = resolve(pkgDir, relTarget);
      if (!existsSync(absTarget)) {
        issues.push({
          pkg: pkgName,
          field,
          expectedPath: `packages/${entry.name}/${relTarget.replace(/^\.\//, '')}`,
          message: `${pkgName}: missing built ${field} entry (packages/${entry.name}/${relTarget.replace(/^\.\//, '')})`,
        });
      }
    }
  }

  return issues;
}
