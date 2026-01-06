-- CreateTable: Create wallets table
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Add unique index for address
CREATE UNIQUE INDEX "wallets_address_key" ON "wallets"("address");

-- CreateIndex: Add index for address
CREATE INDEX "wallets_address_idx" ON "wallets"("address");

-- AlterTable: Add walletId column to users table
ALTER TABLE "users" ADD COLUMN "walletId" TEXT;

-- Migrate existing walletAddress data to wallets table (if walletAddress column exists)
-- First, insert unique wallet addresses from users table into wallets table
-- Generate UUID for each wallet
INSERT INTO "wallets" ("id", "address", "createdAt", "updatedAt")
SELECT DISTINCT ON ("walletAddress") gen_random_uuid()::text, "walletAddress", "createdAt", "updatedAt"
FROM "users"
WHERE "walletAddress" IS NOT NULL
ON CONFLICT ("address") DO NOTHING;

-- Update users.walletId to reference wallets.id (not address)
UPDATE "users" u
SET "walletId" = w."id"
FROM "wallets" w
WHERE u."walletAddress" = w."address"
AND u."walletAddress" IS NOT NULL;

-- Drop walletAddress column if it exists (from previous migration)
ALTER TABLE "users" DROP COLUMN IF EXISTS "walletAddress";

-- Drop walletAddress index if it exists
DROP INDEX IF EXISTS "users_walletAddress_key";
DROP INDEX IF EXISTS "users_walletAddress_idx";

-- CreateIndex: Add index for walletId
CREATE INDEX "users_walletId_idx" ON "users"("walletId");

-- AddForeignKey: Add foreign key constraint
ALTER TABLE "users" ADD CONSTRAINT "users_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropTable: Drop user_wallets table if it exists
DROP TABLE IF EXISTS "user_wallets";

