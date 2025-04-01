-- Create stock type enum
CREATE TYPE "StockType" AS ENUM ('PIPE', 'NAGINA', 'MATERIAL', 'BANGLE', 'OTHER');

-- Create transaction type enum
CREATE TYPE "TransactionType" AS ENUM ('INWARD', 'OUTWARD', 'ADJUSTMENT', 'RETURN');

-- Add cuttingPrice and weightUnit to PipeStock
ALTER TABLE "PipeStock" 
ADD COLUMN IF NOT EXISTS "cuttingPrice" DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS "weightUnit" VARCHAR(10) DEFAULT 'kg';

-- Create StockTransaction table
CREATE TABLE IF NOT EXISTS "StockTransaction" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "stockId" UUID NOT NULL,
  "stockType" "StockType" NOT NULL,
  "transactionType" "TransactionType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "remainingStock" INTEGER NOT NULL,
  "note" TEXT,
  "jobId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "organizationId" UUID,
  
  CONSTRAINT "StockTransaction_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "StockTransaction_stockId_stockType_idx" ON "StockTransaction"("stockId", "stockType");
CREATE INDEX IF NOT EXISTS "StockTransaction_transactionType_idx" ON "StockTransaction"("transactionType");
CREATE INDEX IF NOT EXISTS "StockTransaction_createdAt_idx" ON "StockTransaction"("createdAt");

-- Add foreign key constraints
ALTER TABLE "StockTransaction" 
ADD CONSTRAINT "StockTransaction_stockId_fkey" 
FOREIGN KEY ("stockId") REFERENCES "PipeStock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StockTransaction" 
ADD CONSTRAINT "StockTransaction_organizationId_fkey" 
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE; 