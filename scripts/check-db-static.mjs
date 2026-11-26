#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import {
  isDbRelatedPath,
  checkPrismaSchema,
  checkSqlMigration,
} from './lib/db-guardrails.mjs';

const SCHEMA_PATH = 'packages/database/prisma/schema.prisma';

function getGitChangedDbFiles() {
  try {
    const tracked = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', 'HEAD'], {
      encoding: 'utf8',
    });
    const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], {
      encoding: 'utf8',
    });
    return [...new Set([...tracked.split('\n'), ...untracked.split('\n')].map((f) => f.trim()).filter(Boolean))]
      .filter((f) => isDbRelatedPath(f) && existsSync(f));
  } catch {
    return [];
  }
}

const args = process.argv.slice(2);
const checkSchemaAlways = args.includes('--schema') || args.includes('--all');
const explicitFiles = args.filter((a) => !a.startsWith('--'));
const targetFiles = explicitFiles.length > 0 ? explicitFiles : getGitChangedDbFiles();

const filesToCheck = new Set(targetFiles);
if (checkSchemaAlways && existsSync(SCHEMA_PATH)) {
  filesToCheck.add(SCHEMA_PATH);
}

if (filesToCheck.size === 0) {
  console.log('DB static guardrails: skipped (no DB files changed)');
  process.exit(0);
}

const allIssues = [];
for (const file of filesToCheck) {
  if (!existsSync(file)) continue;
  const content = readFileSync(file, 'utf8');
  if (file.endsWith('schema.prisma')) {
    allIssues.push(...checkPrismaSchema(content));
  } else if (file.endsWith('.sql')) {
    allIssues.push(...checkSqlMigration(content, file));
  }
}

if (allIssues.length > 0) {
  for (const issue of allIssues) {
    console.error(`   FAIL [${issue.code}]: ${issue.message}`);
  }
  process.exit(1);
}

console.log(`   OK: DB static guardrails passed (${filesToCheck.size} file(s) checked)`);
