-- DropIndex
DROP INDEX IF EXISTS "users_smartAccountAddress_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN IF EXISTS "smartAccountAddress";

