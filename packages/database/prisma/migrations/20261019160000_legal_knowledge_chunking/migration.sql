-- Legal knowledge corpus: correct chunking, versioned provenance, and a
-- keyword retrieval path that costs nothing.
--
-- 1. `LegalKnowledgeParent.title` — the instrument's own heading text, kept
--    out of `content` so a rule's text stays clean and diffable while the
--    reader still gets the subject it needs to cite.
--
-- 2. `LegalKnowledgeParent` gains a versioned identity. A legal instrument has
--    a validity window, so the same hierarchy path can exist more than once
--    (a chapter note as amended by successive reforms). The unique key is
--    (country, legalType, path, validFromDate).
--
-- 3. `LegalKnowledgeChunk` gains `heading`, `ruleNumber` and `scope[]`.
--    A chunk is one citable rule: a numbered item of a note, including its
--    lettered sub-items. `scope` records the codes the rule speaks about, so a
--    note can be found at subheading level without inventing a hierarchy level
--    the arancel does not have.
--
-- 4. `LegalKnowledgeChunk.search` — a tsvector column for the keyword
--    ranker. The legal notes do not need vectors: their retrieval is a hard
--    chapter filter plus a keyword rank, which is free and auditable. The
--    `embedding` column stays for the instruments corpus, where a semantic
--    search over long heterogeneous documents is the right tool.

-- ---------------------------------------------------------------- parent

ALTER TABLE "LegalKnowledgeParent"
  ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT '';

-- Versioned identity. Drop the old non-unique index first; it is replaced by
-- the unique constraint below (which also serves lookups by path).
DROP INDEX IF EXISTS "LegalKnowledgeParent_countryCode_hierarchyPath_idx";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LegalKnowledgeParent_versioned_key'
  ) THEN
    ALTER TABLE "LegalKnowledgeParent"
      ADD CONSTRAINT "LegalKnowledgeParent_versioned_key"
      UNIQUE ("countryCode", "legalType", "hierarchyPath", "validFromDate");
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "LegalKnowledgeParent_countryCode_hierarchyPath_idx"
  ON "LegalKnowledgeParent" ("countryCode", "hierarchyPath");

-- ----------------------------------------------------------------- chunk

ALTER TABLE "LegalKnowledgeChunk"
  ADD COLUMN IF NOT EXISTS "heading" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "ruleNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "scope" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- The scope codes are queried with an array containment test.
CREATE INDEX IF NOT EXISTS "LegalKnowledgeChunk_scope_idx"
  ON "LegalKnowledgeChunk" USING GIN ("scope");

-- --------------------------------------------------------------- search

-- `spanish` is a built-in Postgres configuration (the snowball dictionary),
-- so this needs no extension. The column is filled by the ingestion script
-- with a GENERATED column would be nicer, but the text is assembled from the
-- chunk's heading and content, so the script writes it explicitly.
ALTER TABLE "LegalKnowledgeChunk"
  ADD COLUMN IF NOT EXISTS "search" tsvector;

CREATE INDEX IF NOT EXISTS "LegalKnowledgeChunk_search_idx"
  ON "LegalKnowledgeChunk" USING GIN ("search");

-- ------------------------------------------------------------------ notes

-- The demo-seeded chunks are placeholders ("Demo excerpt — confirm against
-- the official SENIAT arancel before quoting"). They are the only rows in the
-- corpus, they are not law, and the quality gate currently audits against
-- them. Remove them so nothing can cite a placeholder.
DELETE FROM "LegalKnowledgeChunk" WHERE content LIKE '%Demo excerpt — confirm against the official SENIAT arancel%';

DELETE FROM "LegalKnowledgeParent" p
 WHERE NOT EXISTS (SELECT 1 FROM "LegalKnowledgeChunk" c WHERE c."parentId" = p.id)
   AND p."legalType" IN ('CHAPTER', 'LEGAL_NOTE')
   AND p."sourceFile" = 'demo-seed';
