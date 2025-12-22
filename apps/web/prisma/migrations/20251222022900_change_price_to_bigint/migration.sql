-- AlterTable: Change price column from INTEGER to BIGINT
ALTER TABLE "products" ALTER COLUMN "price" TYPE BIGINT USING "price"::BIGINT;

