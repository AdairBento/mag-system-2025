/*
  Warnings:

  - You are about to drop the column `licenseCategory` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `licenseExpiry` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `clients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,deletedAt]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf,deletedAt]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj,deletedAt]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "clients_cnpj_key";

-- DropIndex
DROP INDEX "clients_cpf_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "licenseCategory",
DROP COLUMN "licenseExpiry",
DROP COLUMN "licenseNumber",
DROP COLUMN "notes",
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- CreateIndex
CREATE INDEX "clients_email_idx" ON "clients"("email");

-- CreateIndex
CREATE INDEX "clients_cpf_idx" ON "clients"("cpf");

-- CreateIndex
CREATE INDEX "clients_cnpj_idx" ON "clients"("cnpj");

-- CreateIndex
CREATE INDEX "clients_deletedAt_idx" ON "clients"("deletedAt");

-- CreateIndex
CREATE INDEX "clients_isActive_idx" ON "clients"("isActive");

-- CreateIndex
CREATE INDEX "clients_type_idx" ON "clients"("type");

-- CreateIndex
CREATE INDEX "clients_status_idx" ON "clients"("status");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_deletedAt_key" ON "clients"("email", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "clients_cpf_deletedAt_key" ON "clients"("cpf", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "clients_cnpj_deletedAt_key" ON "clients"("cnpj", "deletedAt");
