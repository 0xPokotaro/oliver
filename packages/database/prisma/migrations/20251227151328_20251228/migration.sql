/*
  Warnings:

  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dynamicUserId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dynamicUserId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar",
DROP COLUMN "email",
DROP COLUMN "metadata",
DROP COLUMN "name",
ADD COLUMN     "dynamicUserId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_dynamicUserId_key" ON "users"("dynamicUserId");
