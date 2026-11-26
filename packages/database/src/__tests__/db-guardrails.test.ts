import { describe, it, expect } from 'vitest';
import {
  isDbRelatedPath,
  checkPrismaSchema,
  checkSqlMigration,
} from '../../../../scripts/lib/db-guardrails.mjs';

describe('isDbRelatedPath', () => {
  it('matches Prisma schema, SQL migrations, and supabase directory', () => {
    expect(isDbRelatedPath('packages/database/prisma/schema.prisma')).toBe(true);
    expect(isDbRelatedPath('packages/database/prisma/migrations/20261126_x/migration.sql')).toBe(true);
    expect(isDbRelatedPath('supabase/migrations/001.sql')).toBe(true);
    expect(isDbRelatedPath('packages/database/src/scripts/fix.sql')).toBe(true);
  });

  it('ignores non-DB app and package files', () => {
    expect(isDbRelatedPath('apps/web/src/app/page.tsx')).toBe(false);
    expect(isDbRelatedPath('packages/agent/src/index.ts')).toBe(false);
    expect(isDbRelatedPath('packages/database/src/billing.ts')).toBe(false);
  });
});

describe('checkPrismaSchema', () => {
  it('flags duplicate @@index declarations on the same columns', () => {
    const schema = `
model BatchJob {
  id       String @id
  tenantId String @map("tenant_id")

  @@index([tenantId], map: "idx_BatchJob_tenant_id")
  @@index([tenantId])
  @@schema("public")
}
`;
    const issues = checkPrismaSchema(schema);
    expect(issues.some((i) => i.code === 'duplicate_index' && i.level === 'error')).toBe(true);
  });

  it('flags foreign keys without a covering index', () => {
    const schema = `
model Tenant {
  id          String  @id
  countryCode String
  country     Country @relation(fields: [countryCode], references: [code])

  @@schema("public")
}
`;
    const issues = checkPrismaSchema(schema);
    expect(issues.some((i) => i.code === 'unindexed_fk' && i.message.includes('countryCode'))).toBe(true);
  });

  it('passes when FK is covered by @@index or @@unique prefix', () => {
    const schema = `
model Tenant {
  id          String  @id
  countryCode String
  country     Country @relation(fields: [countryCode], references: [code])

  @@index([countryCode])
  @@schema("public")
}

model Membership {
  id       String @id
  tenantId String
  userId   String
  tenant   Tenant @relation(fields: [tenantId], references: [id])

  @@unique([tenantId, userId])
  @@schema("public")
}
`;
    const issues = checkPrismaSchema(schema);
    expect(issues).toEqual([]);
  });
});

describe('checkSqlMigration', () => {
  it('flags CREATE TABLE in public without ENABLE ROW LEVEL SECURITY', () => {
    const sql = `
CREATE TABLE IF NOT EXISTS public."invoices" (
  "id" TEXT PRIMARY KEY
);
`;
    const issues = checkSqlMigration(sql, 'test.sql');
    expect(issues.some((i) => i.code === 'missing_rls')).toBe(true);
  });

  it('passes when CREATE TABLE in public enables RLS', () => {
    const sql = `
CREATE TABLE IF NOT EXISTS public."invoices" (
  "id" TEXT PRIMARY KEY
);
ALTER TABLE public."invoices" ENABLE ROW LEVEL SECURITY;
`;
    const issues = checkSqlMigration(sql, 'test.sql');
    expect(issues).toEqual([]);
  });

  it('flags CREATE POLICY without TO clause or with permissive IS NULL tenant check', () => {
    const sql = `
CREATE POLICY "bad_policy" ON public."platform_admins"
  USING (
    current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );
`;
    const issues = checkSqlMigration(sql, 'test.sql');
    expect(issues.some((i) => i.code === 'policy_missing_to')).toBe(true);
    expect(issues.some((i) => i.code === 'policy_permissive_null_guc')).toBe(true);
    expect(issues.some((i) => i.code === 'policy_unwrapped_initplan')).toBe(true);
  });

  it('passes a properly scoped TO authenticated policy using (select auth.uid())', () => {
    const sql = `
CREATE POLICY "owner_read" ON public."workspace_threads"
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);
`;
    const issues = checkSqlMigration(sql, 'test.sql');
    expect(issues).toEqual([]);
  });

  it('flags GRANT to anon and SECURITY DEFINER unless explicitly allowed', () => {
    const sql = `
GRANT SELECT ON public."Tenant" TO anon;
CREATE FUNCTION public.leak() RETURNS void LANGUAGE sql SECURITY DEFINER AS $$ SELECT 1; $$;
`;
    const issues = checkSqlMigration(sql, 'test.sql');
    expect(issues.some((i) => i.code === 'grant_to_anon')).toBe(true);
    expect(issues.some((i) => i.code === 'security_definer_public')).toBe(true);
  });

  it('respects -- harness-allow opt-out comment on specific lines', () => {
    const sql = `
-- harness-allow: grant_to_anon
GRANT SELECT ON public."PublicCatalog" TO anon;
`;
    const issues = checkSqlMigration(sql, 'test.sql');
    expect(issues).toEqual([]);
  });
});
