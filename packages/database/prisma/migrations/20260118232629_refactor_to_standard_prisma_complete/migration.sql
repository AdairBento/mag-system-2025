/*
  Warnings:

  - The values [FINALIZADA,ATRASADA] on the enum `RentalStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [LOCADO] on the enum `VehicleStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `phone` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `endMileage` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `fuelOnPickup` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `fuelOnReturn` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `mileageDriven` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `pendingAmount` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `pickupDate` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `rentalDays` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `startMileage` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `chassi` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceAmount` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `ipvaAmount` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyRate` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyRate` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the `maintenances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cpf,deletedAt]` on the table `drivers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[plate,deletedAt]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.
  - Made the column `clientId` on table `drivers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `licenseCategory` on table `drivers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `licenseExpiry` on table `drivers` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `totalDays` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalValue` to the `rentals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DriverStatus" ADD VALUE 'BLOQUEADO';
ALTER TYPE "DriverStatus" ADD VALUE 'AFASTADO';

-- AlterEnum
BEGIN;
CREATE TYPE "RentalStatus_new" AS ENUM ('RESERVADA', 'ATIVA', 'CONCLUIDA', 'CANCELADA');
ALTER TABLE "rentals" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "rentals" ALTER COLUMN "status" TYPE "RentalStatus_new" USING ("status"::text::"RentalStatus_new");
ALTER TYPE "RentalStatus" RENAME TO "RentalStatus_old";
ALTER TYPE "RentalStatus_new" RENAME TO "RentalStatus";
DROP TYPE "RentalStatus_old";
ALTER TABLE "rentals" ALTER COLUMN "status" SET DEFAULT 'RESERVADA';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "VehicleStatus_new" AS ENUM ('DISPONIVEL', 'ALUGADO', 'MANUTENCAO', 'INATIVO');
ALTER TABLE "vehicles" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "vehicles" ALTER COLUMN "status" TYPE "VehicleStatus_new" USING ("status"::text::"VehicleStatus_new");
ALTER TYPE "VehicleStatus" RENAME TO "VehicleStatus_old";
ALTER TYPE "VehicleStatus_new" RENAME TO "VehicleStatus";
DROP TYPE "VehicleStatus_old";
ALTER TABLE "vehicles" ALTER COLUMN "status" SET DEFAULT 'DISPONIVEL';
COMMIT;

-- DropForeignKey
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_clientId_fkey";

-- DropForeignKey
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_vehicleId_fkey";

-- DropIndex
DROP INDEX "drivers_cpf_idx";

-- DropIndex
DROP INDEX "drivers_isActive_idx";

-- DropIndex
DROP INDEX "drivers_licenseNumber_idx";

-- DropIndex
DROP INDEX "drivers_licenseNumber_key";

-- DropIndex
DROP INDEX "vehicles_chassi_key";

-- DropIndex
DROP INDEX "vehicles_plate_key";

-- DropIndex
DROP INDEX "vehicles_renavam_key";

-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "phone",
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "rg" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "telephone" TEXT,
ADD COLUMN     "zipCode" TEXT,
ALTER COLUMN "clientId" SET NOT NULL,
ALTER COLUMN "licenseCategory" SET NOT NULL,
ALTER COLUMN "licenseExpiry" SET NOT NULL;

-- AlterTable
ALTER TABLE "rentals" DROP COLUMN "endMileage",
DROP COLUMN "fuelOnPickup",
DROP COLUMN "fuelOnReturn",
DROP COLUMN "mileageDriven",
DROP COLUMN "notes",
DROP COLUMN "paidAmount",
DROP COLUMN "pendingAmount",
DROP COLUMN "pickupDate",
DROP COLUMN "rentalDays",
DROP COLUMN "startMileage",
DROP COLUMN "totalAmount",
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "driverId" TEXT,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "paidValue" DOUBLE PRECISION,
ADD COLUMN     "totalDays" INTEGER NOT NULL,
ADD COLUMN     "totalValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedBy" TEXT,
ALTER COLUMN "status" SET DEFAULT 'RESERVADA';

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "category",
DROP COLUMN "chassi",
DROP COLUMN "insuranceAmount",
DROP COLUMN "ipvaAmount",
DROP COLUMN "monthlyRate",
DROP COLUMN "weeklyRate",
ADD COLUMN     "chassis" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedBy" TEXT,
ALTER COLUMN "dailyRate" DROP NOT NULL,
ALTER COLUMN "dailyRate" DROP DEFAULT,
ALTER COLUMN "mileage" DROP NOT NULL,
ALTER COLUMN "mileage" DROP DEFAULT;

-- DropTable
DROP TABLE "maintenances";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "MaintenanceStatus";

-- DropEnum
DROP TYPE "MaintenanceType";

-- DropEnum
DROP TYPE "UserRole";

-- CreateIndex
CREATE INDEX "drivers_clientId_idx" ON "drivers"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_cpf_deletedAt_key" ON "drivers"("cpf", "deletedAt");

-- CreateIndex
CREATE INDEX "rentals_clientId_idx" ON "rentals"("clientId");

-- CreateIndex
CREATE INDEX "rentals_driverId_idx" ON "rentals"("driverId");

-- CreateIndex
CREATE INDEX "rentals_vehicleId_idx" ON "rentals"("vehicleId");

-- CreateIndex
CREATE INDEX "rentals_status_idx" ON "rentals"("status");

-- CreateIndex
CREATE INDEX "rentals_startDate_idx" ON "rentals"("startDate");

-- CreateIndex
CREATE INDEX "rentals_deletedAt_idx" ON "rentals"("deletedAt");

-- CreateIndex
CREATE INDEX "vehicles_plate_idx" ON "vehicles"("plate");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicles_deletedAt_idx" ON "vehicles"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_deletedAt_key" ON "vehicles"("plate", "deletedAt");

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
