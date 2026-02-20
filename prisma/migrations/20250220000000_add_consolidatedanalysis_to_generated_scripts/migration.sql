-- Add missing consolidatedAnalysis column to generated_scripts (safe for existing tables)
ALTER TABLE "generated_scripts"
  ADD COLUMN IF NOT EXISTS "consolidatedAnalysis" JSONB;

-- Set a default value for existing rows (empty JSON object)
UPDATE "generated_scripts"
  SET "consolidatedAnalysis" = '{}'::jsonb
  WHERE "consolidatedAnalysis" IS NULL;

-- Set NOT NULL constraint now that all rows have a value
ALTER TABLE "generated_scripts"
  ALTER COLUMN "consolidatedAnalysis" SET NOT NULL;
