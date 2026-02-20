-- Comprehensive fix: ensure ALL required columns exist in generated_scripts
-- Safe to run multiple times (uses IF NOT EXISTS and checks before constraints)

-- 1. settings
ALTER TABLE "generated_scripts"
  ADD COLUMN IF NOT EXISTS "settings" JSONB;
UPDATE "generated_scripts" SET "settings" = '{}'::jsonb WHERE "settings" IS NULL;
ALTER TABLE "generated_scripts" ALTER COLUMN "settings" SET NOT NULL;

-- 2. scripts
ALTER TABLE "generated_scripts"
  ADD COLUMN IF NOT EXISTS "scripts" JSONB;
UPDATE "generated_scripts" SET "scripts" = '[]'::jsonb WHERE "scripts" IS NULL;
ALTER TABLE "generated_scripts" ALTER COLUMN "scripts" SET NOT NULL;

-- 3. patternId (nullable, no default needed)
ALTER TABLE "generated_scripts"
  ADD COLUMN IF NOT EXISTS "patternId" TEXT;

-- 4. Index on patternId
CREATE INDEX IF NOT EXISTS "generated_scripts_patternId_idx" ON "generated_scripts"("patternId");

-- 5. Foreign key: patternId -> video_patterns.id
DO $$ BEGIN
    ALTER TABLE "generated_scripts" ADD CONSTRAINT "generated_scripts_patternId_fkey"
        FOREIGN KEY ("patternId") REFERENCES "video_patterns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
