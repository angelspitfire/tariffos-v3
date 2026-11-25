-- Enable Row Level Security (RLS) on all 36 tables
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ClassificationSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClassificationSession" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatMessage" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ProductMaster" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductMaster" FORCE ROW LEVEL SECURITY;

ALTER TABLE "CustomClassificationRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CustomClassificationRule" FORCE ROW LEVEL SECURITY;

ALTER TABLE "KnowledgeCollection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KnowledgeCollection" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Plan" FORCE ROW LEVEL SECURITY;

ALTER TABLE "RepairHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RepairHistory" FORCE ROW LEVEL SECURITY;

ALTER TABLE "KnowledgeFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KnowledgeFile" FORCE ROW LEVEL SECURITY;

ALTER TABLE "UsageRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UsageRecord" FORCE ROW LEVEL SECURITY;

ALTER TABLE "BatchJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BatchJob" FORCE ROW LEVEL SECURITY;

ALTER TABLE "GoldenDataset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GoldenDataset" FORCE ROW LEVEL SECURITY;

ALTER TABLE "SystemConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemConfig" FORCE ROW LEVEL SECURITY;

ALTER TABLE "EvaluationRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EvaluationRun" FORCE ROW LEVEL SECURITY;

ALTER TABLE "EvaluationResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EvaluationResult" FORCE ROW LEVEL SECURITY;

ALTER TABLE "AgentSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgentSession" FORCE ROW LEVEL SECURITY;

ALTER TABLE "GlobalLegalResource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GlobalLegalResource" FORCE ROW LEVEL SECURITY;

ALTER TABLE "BatchJobItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BatchJobItem" FORCE ROW LEVEL SECURITY;

ALTER TABLE "LegalDocumentChunk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LegalDocumentChunk" FORCE ROW LEVEL SECURITY;

ALTER TABLE "NationalTariff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NationalTariff" FORCE ROW LEVEL SECURITY;

ALTER TABLE "LangGraphCheckpointWrite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LangGraphCheckpointWrite" FORCE ROW LEVEL SECURITY;

ALTER TABLE "BillingPeriod" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillingPeriod" FORCE ROW LEVEL SECURITY;

ALTER TABLE "LangGraphCheckpoint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LangGraphCheckpoint" FORCE ROW LEVEL SECURITY;

ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" FORCE ROW LEVEL SECURITY;

ALTER TABLE "LegalKnowledgeParent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LegalKnowledgeParent" FORCE ROW LEVEL SECURITY;

ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" FORCE ROW LEVEL SECURITY;

ALTER TABLE "TradeAgreement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TradeAgreement" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ConcurrentPermission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConcurrentPermission" FORCE ROW LEVEL SECURITY;

ALTER TABLE "filings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "filings" FORCE ROW LEVEL SECURITY;

ALTER TABLE "GeminiCache" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GeminiCache" FORCE ROW LEVEL SECURITY;

ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenant" FORCE ROW LEVEL SECURITY;

ALTER TABLE "FileMetadata" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FileMetadata" FORCE ROW LEVEL SECURITY;

ALTER TABLE "GoldenItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GoldenItem" FORCE ROW LEVEL SECURITY;

ALTER TABLE "ManualInvoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ManualInvoice" FORCE ROW LEVEL SECURITY;

ALTER TABLE "LegalKnowledgeChunk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LegalKnowledgeChunk" FORCE ROW LEVEL SECURITY;

ALTER TABLE "WaitlistLead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WaitlistLead" FORCE ROW LEVEL SECURITY;

-- Apply Tenant Isolation and Security Policies
DROP POLICY IF EXISTS tenant_isolation_policy ON "Tenant";
CREATE POLICY tenant_isolation_policy ON "Tenant"
  AS PERMISSIVE FOR ALL
  USING (
    id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "Membership";
CREATE POLICY tenant_isolation_policy ON "Membership"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "ClassificationSession";
CREATE POLICY tenant_isolation_policy ON "ClassificationSession"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "ChatMessage";
CREATE POLICY tenant_isolation_policy ON "ChatMessage"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "ProductMaster";
CREATE POLICY tenant_isolation_policy ON "ProductMaster"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "CustomClassificationRule";
CREATE POLICY tenant_isolation_policy ON "CustomClassificationRule"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR tenant_id = 'GLOBAL'
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "FileMetadata";
CREATE POLICY tenant_isolation_policy ON "FileMetadata"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "BatchJob";
CREATE POLICY tenant_isolation_policy ON "BatchJob"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "BatchJobItem";
CREATE POLICY tenant_isolation_policy ON "BatchJobItem"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "LangGraphCheckpoint";
CREATE POLICY tenant_isolation_policy ON "LangGraphCheckpoint"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "LangGraphCheckpointWrite";
CREATE POLICY tenant_isolation_policy ON "LangGraphCheckpointWrite"
  AS PERMISSIVE FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "UsageRecord";
CREATE POLICY tenant_isolation_policy ON "UsageRecord"
  AS PERMISSIVE FOR ALL
  USING (
    "tenantId" = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "AgentSession";
CREATE POLICY tenant_isolation_policy ON "AgentSession"
  AS PERMISSIVE FOR ALL
  USING (
    "tenantId" = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "BillingPeriod";
CREATE POLICY tenant_isolation_policy ON "BillingPeriod"
  AS PERMISSIVE FOR ALL
  USING (
    "tenantId" = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "clients";
CREATE POLICY tenant_isolation_policy ON "clients"
  AS PERMISSIVE FOR ALL
  USING (
    organization_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "filings";
CREATE POLICY tenant_isolation_policy ON "filings"
  AS PERMISSIVE FOR ALL
  USING (
    organization_id = current_setting('app.current_tenant', true)
    OR current_setting('app.current_tenant', true) IS NULL
    OR current_setting('app.current_tenant', true) = ''
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "RepairHistory";
CREATE POLICY tenant_isolation_policy ON "RepairHistory"
  AS PERMISSIVE FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "FileMetadata" f
      WHERE f.id = "fileId"
      AND (
        f.tenant_id = current_setting('app.current_tenant', true)
        OR current_setting('app.current_tenant', true) IS NULL
        OR current_setting('app.current_tenant', true) = ''
      )
    )
  );

DROP POLICY IF EXISTS tenant_isolation_policy ON "ManualInvoice";
CREATE POLICY tenant_isolation_policy ON "ManualInvoice"
  AS PERMISSIVE FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "BillingPeriod" b
      WHERE b.id = "billingPeriodId"
      AND (
        b."tenantId" = current_setting('app.current_tenant', true)
        OR current_setting('app.current_tenant', true) IS NULL
        OR current_setting('app.current_tenant', true) = ''
      )
    )
  );

DROP POLICY IF EXISTS select_policy ON "Plan";
CREATE POLICY select_policy ON "Plan" FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS select_policy ON "SystemConfig";
CREATE POLICY select_policy ON "SystemConfig" FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS select_policy ON "GlobalLegalResource";
CREATE POLICY select_policy ON "GlobalLegalResource" FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS select_policy ON "LegalDocumentChunk";
CREATE POLICY select_policy ON "LegalDocumentChunk" FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS select_policy ON "NationalTariff";
CREATE POLICY select_policy ON "NationalTariff" FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS select_policy ON "ConcurrentPermission";
CREATE POLICY select_policy ON "ConcurrentPermission" FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS select_policy ON "TradeAgreement";
CREATE POLICY select_policy ON "TradeAgreement" FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS select_policy ON "LegalKnowledgeParent";
CREATE POLICY select_policy ON "LegalKnowledgeParent" FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS select_policy ON "LegalKnowledgeChunk";
CREATE POLICY select_policy ON "LegalKnowledgeChunk" FOR SELECT TO authenticated USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS user_profile_policy ON "profiles";
CREATE POLICY user_profile_policy ON "profiles"
  AS PERMISSIVE FOR ALL
  USING (
    id = (select auth.uid())::text
  );

DROP POLICY IF EXISTS insert_policy ON "WaitlistLead";
CREATE POLICY insert_policy ON "WaitlistLead" FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) IS NOT NULL);

-- Policies for unconfigured tables to resolve rls-no-policy issues
DROP POLICY IF EXISTS collection_policy ON "KnowledgeCollection";
CREATE POLICY collection_policy ON "KnowledgeCollection"
  AS PERMISSIVE FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS file_policy ON "KnowledgeFile";
CREATE POLICY file_policy ON "KnowledgeFile"
  AS PERMISSIVE FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS dataset_policy ON "GoldenDataset";
CREATE POLICY dataset_policy ON "GoldenDataset"
  AS PERMISSIVE FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS run_policy ON "EvaluationRun";
CREATE POLICY run_policy ON "EvaluationRun"
  AS PERMISSIVE FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS result_policy ON "EvaluationResult";
CREATE POLICY result_policy ON "EvaluationResult"
  AS PERMISSIVE FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS item_policy ON "GoldenItem";
CREATE POLICY item_policy ON "GoldenItem"
  AS PERMISSIVE FOR ALL TO authenticated USING ((select auth.uid()) IS NOT NULL) WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS cache_policy ON "GeminiCache";
CREATE POLICY cache_policy ON "GeminiCache"
  AS PERMISSIVE FOR ALL TO authenticated
  USING ((select auth.uid()) = "userId"::uuid)
  WITH CHECK ((select auth.uid()) = "userId"::uuid);

-- Create Foreign Key Indexes
CREATE INDEX IF NOT EXISTS "idx_Membership_tenant_id" ON "Membership"(tenant_id);
CREATE INDEX IF NOT EXISTS "idx_filings_client_id" ON filings(client_id);
CREATE INDEX IF NOT EXISTS "idx_filings_organization_id" ON filings(organization_id);
