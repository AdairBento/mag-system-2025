/*
  Warnings:

  - Made the column `clientId` on table `contracts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_clientId_fkey";

-- DropIndex
DROP INDEX "contracts_contractNumber_key";

-- AlterTable
ALTER TABLE "contracts" ALTER COLUMN "clientId" SET NOT NULL;

-- AlterTable
ALTER TABLE "rentals" ADD COLUMN     "discount" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
