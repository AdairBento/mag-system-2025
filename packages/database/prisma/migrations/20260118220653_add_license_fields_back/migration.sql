-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "licenseCategory" TEXT,
ADD COLUMN     "licenseExpiry" TIMESTAMP(3),
ADD COLUMN     "licenseNumber" TEXT;

-- CreateIndex
CREATE INDEX "clients_licenseNumber_idx" ON "clients"("licenseNumber");
