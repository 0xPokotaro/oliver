-- AlterTable: Change price column from INTEGER to BIGINT
ALTER TABLE "products" ALTER COLUMN "price" TYPE BIGINT USING "price"::BIGINT;

DROP INDEX "products_sku_key";
ALTER TABLE "products" DROP COLUMN "sku";
