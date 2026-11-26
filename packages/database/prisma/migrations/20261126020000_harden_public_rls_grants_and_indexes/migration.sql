-- Harden public schema security (RLS + Data API privileges) and clean up duplicate/missing FK indexes.
-- All 43 tables in public are server-only (accessed via Prisma on the backend).
-- Idempotent and non-destructive to table data.

-- 1. Enable Row Level Security (deny-by-default for non-bypass roles) on all remaining public tables
ALTER TABLE public."Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Country" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ClassificationSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ChatMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProductMaster" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CustomClassificationRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."KnowledgeCollection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."KnowledgeFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."UsageRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DecisionArtifact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FileMetadata" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BatchJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BatchJobItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WaitlistLead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AgentSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GlobalLegalResource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LegalDocumentChunk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."NationalTariff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TariffNodeEmbedding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LangGraphCheckpoint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LangGraphCheckpointWrite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BillingPeriod" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ExchangeRate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."filings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."filing_status_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FilingLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TradeAgreement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LegalKnowledgeParent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LegalKnowledgeChunk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GeminiCache" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SystemSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PermitType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."HsPermitRequirement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."dashboard_indicators" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Webhook" ENABLE ROW LEVEL SECURITY;

-- 2. Remove permissive PUBLIC policies that evaluated TRUE whenever app.current_tenant was unset
DROP POLICY IF EXISTS "admin_audit_logs_admin_only_policy" ON public."admin_audit_logs";
DROP POLICY IF EXISTS "platform_admins_admin_only_policy" ON public."platform_admins";

-- 3. Revoke PostgREST / GraphQL access from anon and authenticated roles on server-only public tables
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- 4. Drop duplicate legacy idx_* indexes (Prisma canonical *_idx indexes remain)
DROP INDEX IF EXISTS public."idx_BatchJob_classificationSessionId";
DROP INDEX IF EXISTS public."idx_BatchJob_tenant_id";
DROP INDEX IF EXISTS public."idx_BatchJobItem_jobId";
DROP INDEX IF EXISTS public."idx_BatchJobItem_tenant_id";
DROP INDEX IF EXISTS public."idx_BillingPeriod_tenantId";
DROP INDEX IF EXISTS public."idx_ChatMessage_session_id";
DROP INDEX IF EXISTS public."idx_ChatMessage_tenant_id";
DROP INDEX IF EXISTS public."idx_ClassificationSession_tenant_id";
DROP INDEX IF EXISTS public."idx_FileMetadata_classificationSessionId";
DROP INDEX IF EXISTS public."idx_ProductMaster_tenant_id";
DROP INDEX IF EXISTS public."idx_UsageRecord_tenantId";

-- 5. Add covering indexes for unindexed foreign keys
CREATE INDEX IF NOT EXISTS "Tenant_countryCode_idx"
  ON public."Tenant" ("countryCode");

CREATE INDEX IF NOT EXISTS "HsPermitRequirement_permitTypeId_idx"
  ON public."HsPermitRequirement" ("permitTypeId");
