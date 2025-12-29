-- AlterTable
ALTER TABLE "users" ALTER COLUMN "smartAccountAddress" DROP NOT NULL;

-- CreateTable
CREATE TABLE "session_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "encryptedPrivateKeyIv" TEXT NOT NULL,
    "encryptedPrivateKeyContent" TEXT NOT NULL,
    "sessionKeyAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_keys_sessionKeyAddress_key" ON "session_keys"("sessionKeyAddress");

-- CreateIndex
CREATE INDEX "session_keys_userId_idx" ON "session_keys"("userId");

-- CreateIndex
CREATE INDEX "session_keys_sessionKeyAddress_idx" ON "session_keys"("sessionKeyAddress");

-- CreateIndex
CREATE INDEX "users_smartAccountAddress_idx" ON "users"("smartAccountAddress");

-- AddForeignKey
ALTER TABLE "session_keys" ADD CONSTRAINT "session_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
