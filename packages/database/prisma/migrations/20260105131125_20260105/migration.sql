/*
  Warnings:

  - A unique constraint covering the columns `[aiWalletId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aiWalletId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_aiWalletId_key" ON "users"("aiWalletId");

-- CreateIndex
CREATE INDEX "users_aiWalletId_idx" ON "users"("aiWalletId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_aiWalletId_fkey" FOREIGN KEY ("aiWalletId") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
