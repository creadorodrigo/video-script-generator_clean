-- The generated_scripts table may have legacy snake_case columns (new_theme,
-- consolidated_analysis, pattern_id, created_at) with NOT NULL constraints
-- that conflict with the camelCase columns used by the current Prisma client.
-- This migration neutralises any such constraints safely.

DO $$
BEGIN
  -- new_theme
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generated_scripts' AND column_name = 'new_theme'
  ) THEN
    ALTER TABLE "generated_scripts" ALTER COLUMN "new_theme" DROP NOT NULL;
    ALTER TABLE "generated_scripts" ALTER COLUMN "new_theme" SET DEFAULT '{}'::jsonb;
  END IF;

  -- consolidated_analysis
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generated_scripts' AND column_name = 'consolidated_analysis'
  ) THEN
    ALTER TABLE "generated_scripts" ALTER COLUMN "consolidated_analysis" DROP NOT NULL;
    ALTER TABLE "generated_scripts" ALTER COLUMN "consolidated_analysis" SET DEFAULT '{}'::jsonb;
  END IF;

  -- pattern_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generated_scripts' AND column_name = 'pattern_id'
  ) THEN
    ALTER TABLE "generated_scripts" ALTER COLUMN "pattern_id" DROP NOT NULL;
  END IF;

  -- user_id (snake_case legacy)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generated_scripts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE "generated_scripts" ALTER COLUMN "user_id" DROP NOT NULL;
  END IF;
END $$;
