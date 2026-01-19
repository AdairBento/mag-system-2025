/*
  Warnings:

  - A unique constraint covering the columns `[licenseNumber]` on the table `drivers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[licenseNumber,deletedAt]` on the table `drivers` will be added. If there are existing duplicate values, this will fail.
  - Made the column `licenseNumber` on table `drivers` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "drivers_cpf_key";

-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedBy" TEXT,
ALTER COLUMN "licenseNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "drivers_licenseNumber_key" ON "drivers"("licenseNumber");

-- CreateIndex
CREATE INDEX "drivers_cpf_idx" ON "drivers"("cpf");

-- CreateIndex
CREATE INDEX "drivers_status_idx" ON "drivers"("status");

-- CreateIndex
CREATE INDEX "drivers_isActive_idx" ON "drivers"("isActive");

-- CreateIndex
CREATE INDEX "drivers_deletedAt_idx" ON "drivers"("deletedAt");

-- CreateIndex
CREATE INDEX "drivers_licenseNumber_idx" ON "drivers"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_licenseNumber_deletedAt_key" ON "drivers"("licenseNumber", "deletedAt");
