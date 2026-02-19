-- Add missing createdAt column to generated_scripts (safe for existing tables)
ALTER TABLE "generated_scripts"
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
