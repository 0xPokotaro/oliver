/*
  Warnings:

  - Added the required column `merchantId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- Create default merchant for existing products
INSERT INTO "merchants" ("id", "name", "createdAt", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000000', '未設定', NOW(), NOW());

-- AlterTable: Rename constraint and add merchantId column (nullable first)
ALTER TABLE "products" RENAME CONSTRAINT "Product_pkey" TO "products_pkey";
ALTER TABLE "products" ADD COLUMN "merchantId" TEXT;

-- Update existing products to use default merchant
UPDATE "products" SET "merchantId" = '00000000-0000-0000-0000-000000000000' WHERE "merchantId" IS NULL;

-- Make merchantId NOT NULL
ALTER TABLE "products" ALTER COLUMN "merchantId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
