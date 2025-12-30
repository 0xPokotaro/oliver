-- AlterTable: Rename dynamicUserId to privyUserId
ALTER TABLE "users" RENAME COLUMN "dynamicUserId" TO "privyUserId";

-- DropIndex: Remove old unique index
DROP INDEX IF EXISTS "users_dynamicUserId_key";

-- CreateIndex: Create new unique index for privyUserId
CREATE UNIQUE INDEX "users_privyUserId_key" ON "users"("privyUserId");

