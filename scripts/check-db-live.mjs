#!/usr/bin/env node
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const pg = require(path.resolve('packages/database/node_modules/pg'));

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key]) continue;
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = val;
  }
}

loadEnvFile(path.resolve('apps/web/.env.local'));
loadEnvFile(path.resolve('.env.local'));
loadEnvFile(path.resolve('.env'));

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error('FAIL: DIRECT_URL or DATABASE_URL is required for pnpm check:db');
  process.exit(1);
}

// Explicit allowlist of public tables intentionally exposed to browser clients (empty by default).
const ALLOWED_CLIENT_TABLES = new Set(
  (process.env.DB_AUDIT_CLIENT_TABLES ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

const client = new pg.Client({ connectionString, connectionTimeoutMillis: 8000 });
const failures = [];
let totalPublicTables = 0;

try {
  await client.connect();

  // 1. Tables in public without RLS
  const rlsCounts = await client.query(`
    SELECT count(*)::int AS total FROM pg_tables WHERE schemaname = 'public'
  `);
  totalPublicTables = rlsCounts.rows[0]?.total ?? 0;

  const noRls = await client.query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND NOT rowsecurity
    ORDER BY tablename
  `);
  for (const row of noRls.rows) {
    failures.push(`[rls_disabled] Table public."${row.tablename}" has RLS disabled`);
  }

  // 2. Grants to anon / authenticated on server-only public tables
  const grants = await client.query(`
    SELECT DISTINCT table_name, grantee
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated')
    ORDER BY table_name, grantee
  `);
  for (const row of grants.rows) {
    if (!ALLOWED_CLIENT_TABLES.has(row.table_name)) {
      failures.push(`[public_grant] Role ${row.grantee} has privileges on public."${row.table_name}"`);
    }
  }

  // 3. Permissive PUBLIC/anon or IS NULL GUC policies
  const policies = await client.query(`
    SELECT tablename, policyname, roles::text AS roles_text, coalesce(qual, '') AS qual
    FROM pg_policies
    WHERE schemaname = 'public'
  `);
  for (const row of policies.rows) {
    if (/\b(public|anon)\b/.test(row.roles_text) && !ALLOWED_CLIENT_TABLES.has(row.tablename)) {
      failures.push(`[unsafe_policy_role] Policy "${row.policyname}" on public."${row.tablename}" applies to ${row.roles_text}`);
    }
    if (/current_setting\([^)]*app\.current_tenant[^)]*\)\s+IS\s+NULL/i.test(row.qual)) {
      failures.push(`[unsafe_policy_null_guc] Policy "${row.policyname}" on public."${row.tablename}" allows app.current_tenant IS NULL`);
    }
  }

  // 4. Duplicate indexes (identical uniqueness + table + column definition)
  const dupIndexes = await client.query(`
    SELECT tablename, regexp_replace(indexdef, 'INDEX "[^"]+" ON ', 'INDEX ON ') AS sig,
           string_agg(indexname, ', ' ORDER BY indexname) AS names
    FROM pg_indexes
    WHERE schemaname = 'public'
    GROUP BY tablename, sig
    HAVING count(*) > 1
  `);
  for (const row of dupIndexes.rows) {
    failures.push(`[duplicate_index] Table public."${row.tablename}" has duplicate indexes: ${row.names}`);
  }

  // 5. Unindexed foreign keys in public
  const unindexedFks = await client.query(`
    SELECT c.conrelid::regclass::text AS table_name, c.conname AS fk_name
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE c.contype = 'f' AND n.nspname = 'public'
      AND NOT EXISTS (
        SELECT 1 FROM pg_index i
        WHERE i.indrelid = c.conrelid
          AND i.indisvalid
          AND (string_to_array(i.indkey::text, ' ')::int2[])[1:array_length(c.conkey, 1)] = c.conkey
      )
    ORDER BY table_name, fk_name
  `);
  for (const row of unindexedFks.rows) {
    failures.push(`[unindexed_fk] Foreign key ${row.fk_name} on ${row.table_name} has no covering index`);
  }
} finally {
  await client.end().catch(() => {});
}

if (failures.length > 0) {
  console.error('\nLive DB Security & Hygiene Audit: FAIL');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`Live DB Security & Hygiene Audit: PASS (${totalPublicTables}/${totalPublicTables} RLS, 0 public grants, 0 unsafe policies, 0 duplicate indexes, 0 unindexed FKs)`);
