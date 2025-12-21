-- AlterTable: Add new columns
ALTER TABLE "products" ADD COLUMN "sku" TEXT,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
ADD COLUMN "stockStatus" TEXT NOT NULL DEFAULT 'in_stock',
ADD COLUMN "imageUrl" TEXT;

-- Update existing rows to have sku values (using id as temporary sku)
UPDATE "products" SET "sku" = 'product-' || "id" WHERE "sku" IS NULL;

-- CreateIndex: Create unique index for sku
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- Make sku NOT NULL after setting values
ALTER TABLE "products" ALTER COLUMN "sku" SET NOT NULL;

