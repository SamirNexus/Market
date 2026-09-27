-- CreateTable
CREATE TABLE "MerchantSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT 'Market',
    "supportEmail" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#111827',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantSettings_pkey" PRIMARY KEY ("id")
);

-- SeedDefaultSettings
INSERT INTO "MerchantSettings" (
  "id",
  "storeName",
  "currency",
  "locale",
  "primaryColor",
  "updatedAt"
) VALUES (
  'default',
  'Market',
  'USD',
  'en-US',
  '#111827',
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
