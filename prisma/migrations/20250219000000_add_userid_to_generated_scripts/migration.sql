-- AlterTable: add userId column to generated_scripts
ALTER TABLE "generated_scripts" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Remove registros órfãos que não têm userId (dados inválidos sem dono)
DELETE FROM "generated_scripts" WHERE "userId" IS NULL;

-- Adicionar constraint NOT NULL agora que todos os registros têm userId
ALTER TABLE "generated_scripts" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "generated_scripts_userId_idx" ON "generated_scripts"("userId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "generated_scripts" ADD CONSTRAINT "generated_scripts_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
