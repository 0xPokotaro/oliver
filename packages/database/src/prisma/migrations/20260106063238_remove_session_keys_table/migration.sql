/*
  Warnings:

  - You are about to drop the `session_keys` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "session_keys" DROP CONSTRAINT "session_keys_userId_fkey";

-- DropTable
DROP TABLE "session_keys";
