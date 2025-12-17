-- AlterTable: Add HCA authentication fields and remove password
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "hca_id" TEXT,
  ADD COLUMN IF NOT EXISTS "slack_id" TEXT,
  DROP COLUMN IF EXISTS "password";

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_hca_id_key" ON "users"("hca_id");

-- Rename column profileImage to profile_image (snake_case)
-- Note: PostgreSQL doesn't support IF EXISTS in RENAME COLUMN
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='users' AND column_name='profileImage') THEN
    ALTER TABLE "users" RENAME COLUMN "profileImage" TO "profile_image";
  END IF;
END $$;

