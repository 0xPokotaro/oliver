/*
  Warnings:

  - A unique constraint covering the columns `[smartAccountAddress]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `smartAccountAddress` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "smartAccountAddress" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_smartAccountAddress_key" ON "users"("smartAccountAddress");
