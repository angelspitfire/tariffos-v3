-- Verbatim classifier payload per line (demo-that-sells M3).
-- Feeds the dictamen PDF builder without reconstructing adjudications.

ALTER TABLE "public"."FilingLine" ADD COLUMN "raw_result" JSONB;
