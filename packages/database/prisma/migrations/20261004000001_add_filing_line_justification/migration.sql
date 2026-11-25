-- Full adjudication payload per line (demo-that-sells M2).
-- technical/colloquial justifications, critical alerts and clarifying
-- questions ride alongside the triage fields added in M0.

ALTER TABLE "public"."FilingLine" ADD COLUMN "justification" JSONB DEFAULT '{}';
