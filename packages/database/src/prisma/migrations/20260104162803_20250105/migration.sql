/*
  Warnings:

  - You are about to drop the `UserTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserTransaction" DROP CONSTRAINT "UserTransaction_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "UserTransaction" DROP CONSTRAINT "UserTransaction_userId_fkey";

-- DropTable
DROP TABLE "UserTransaction";

-- CreateTable
CREATE TABLE "user_transactions" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_details" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionDetails" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_details_userId_key" ON "session_details"("userId");

-- CreateIndex
CREATE INDEX "session_details_userId_idx" ON "session_details"("userId");

-- AddForeignKey
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_details" ADD CONSTRAINT "session_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
