const DB_PATH_PATTERNS = [
  /^packages\/database\/prisma\//,
  /^supabase\//,
  /\.sql$/i,
];

export function isDbRelatedPath(filePath) {
  const normalized = filePath.replaceAll('\\', '/');
  return DB_PATH_PATTERNS.some((re) => re.test(normalized));
}

function normalizeFieldList(raw) {
  return raw
    .split(',')
    .map((part) => part.trim().replace(/\(.*\)$/, '').trim())
    .filter(Boolean);
}

export function checkPrismaSchema(schemaText) {
  const issues = [];
  const modelRe = /^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm;
  let match;

  while ((match = modelRe.exec(schemaText)) !== null) {
    const [, modelName, body] = match;
    const seenIndexes = new Map();
    const coveredPrefixes = [];

    for (const line of body.split('\n')) {
      const trimmed = line.trim();
      const singleKeyMatch = /^(\w+)\s+\S+.*@(?:id|unique)\b/.exec(trimmed);
      if (singleKeyMatch) coveredPrefixes.push([singleKeyMatch[1]]);

      const idxMatch = /^@@(index|unique)\(\[([^\]]+)\]/.exec(trimmed);
      if (!idxMatch) continue;
      const [, kind, rawFields] = idxMatch;
      const fields = normalizeFieldList(rawFields);
      const key = fields.join(',');
      coveredPrefixes.push(fields);

      if (kind === 'index') {
        if (seenIndexes.has(key)) {
          issues.push({
            level: 'error',
            code: 'duplicate_index',
            message: `Model ${modelName} declares duplicate @@index([${key}])`,
          });
        } else {
          seenIndexes.set(key, true);
        }
      }
    }

    const relRe = /@relation\([^)]*fields:\s*\[([^\]]+)\]/g;
    let relMatch;
    while ((relMatch = relRe.exec(body)) !== null) {
      const fkFields = normalizeFieldList(relMatch[1]);
      const isCovered = coveredPrefixes.some(
        (prefix) =>
          prefix.length >= fkFields.length &&
          fkFields.every((f, idx) => prefix[idx] === f),
      );
      if (!isCovered) {
        issues.push({
          level: 'error',
          code: 'unindexed_fk',
          message: `Model ${modelName} has unindexed foreign key [${fkFields.join(', ')}]`,
        });
      }
    }
  }

  return issues;
}

function hasOptOut(sqlText, matchIndex, ruleCode) {
  const before = sqlText.slice(Math.max(0, matchIndex - 200), matchIndex);
  return new RegExp(`--\\s*harness-allow:\\s*${ruleCode}\\b`, 'i').test(before);
}

function normalizeTableName(raw) {
  return raw.replaceAll('"', '').replace(/^public\./i, '').trim().toLowerCase();
}

export function checkSqlMigration(sqlText, fileName = 'migration.sql') {
  const issues = [];

  // 1. Every CREATE TABLE in public (or unqualified) must enable RLS in the same migration
  const createTableRe = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?((?:"?public"?\.)?"?[A-Za-z_][A-Za-z0-9_]*"?)/gi;
  const rlsEnabledTables = new Set();
  const rlsRe = /ALTER\s+TABLE\s+(?:ONLY\s+)?((?:"?public"?\.)?"?[A-Za-z_][A-Za-z0-9_]*"?)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
  let m;
  while ((m = rlsRe.exec(sqlText)) !== null) {
    rlsEnabledTables.add(normalizeTableName(m[1]));
  }
  while ((m = createTableRe.exec(sqlText)) !== null) {
    if (hasOptOut(sqlText, m.index, 'missing_rls')) continue;
    const tableName = normalizeTableName(m[1]);
    if (!rlsEnabledTables.has(tableName)) {
      issues.push({
        level: 'error',
        code: 'missing_rls',
        message: `${fileName}: CREATE TABLE "${tableName}" is missing ALTER TABLE ... ENABLE ROW LEVEL SECURITY`,
      });
    }
  }

  // 2. Inspect CREATE POLICY statements
  const policyRe = /CREATE\s+POLICY\s+[\s\S]*?;/gi;
  while ((m = policyRe.exec(sqlText)) !== null) {
    const stmt = m[0];
    if (!/\bTO\s+(?:authenticated|anon|service_role|[a-z_][a-z0-9_]*)\b/i.test(stmt)) {
      if (!hasOptOut(sqlText, m.index, 'policy_missing_to')) {
        issues.push({
          level: 'error',
          code: 'policy_missing_to',
          message: `${fileName}: CREATE POLICY is missing an explicit TO <role> clause (defaults to PUBLIC/anon)`,
        });
      }
    }
    if (/current_setting\(\s*'app\.current_tenant'[^)]*\)\s+IS\s+NULL/i.test(stmt)) {
      if (!hasOptOut(sqlText, m.index, 'policy_permissive_null_guc')) {
        issues.push({
          level: 'error',
          code: 'policy_permissive_null_guc',
          message: `${fileName}: CREATE POLICY allows app.current_tenant IS NULL (evaluates TRUE for PostgREST anon/authenticated)`,
        });
      }
    }
    const unwrappedFnRe = /(?<!select\s+)(?:auth\.(?:uid|jwt|role)\(\)|current_setting\()/i;
    if (unwrappedFnRe.test(stmt) && !hasOptOut(sqlText, m.index, 'policy_unwrapped_initplan')) {
      issues.push({
        level: 'error',
        code: 'policy_unwrapped_initplan',
        message: `${fileName}: wrap auth.*()/current_setting() in (select ...) inside CREATE POLICY to avoid per-row re-evaluation`,
      });
    }
  }

  // 3. Block accidental GRANT ... TO anon
  const grantAnonRe = /\bGRANT\b[^;]*\bTO\b[^;]*\banon\b/gi;
  while ((m = grantAnonRe.exec(sqlText)) !== null) {
    if (!hasOptOut(sqlText, m.index, 'grant_to_anon')) {
      issues.push({
        level: 'error',
        code: 'grant_to_anon',
        message: `${fileName}: GRANT to anon exposes table/object via public Data API`,
      });
    }
  }

  // 4. Block SECURITY DEFINER functions in public schema
  const secDefRe = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:"?public"?\.)?[^;]*\bSECURITY\s+DEFINER\b/gi;
  while ((m = secDefRe.exec(sqlText)) !== null) {
    if (!hasOptOut(sqlText, m.index, 'security_definer_public')) {
      issues.push({
        level: 'error',
        code: 'security_definer_public',
        message: `${fileName}: SECURITY DEFINER function in public schema bypasses RLS and is callable by PUBLIC`,
      });
    }
  }

  return issues;
}
