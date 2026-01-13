/*
  Warnings:

  - The `cnhExpiration` column on the `clients` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "ie" TEXT,
DROP COLUMN "cnhExpiration",
ADD COLUMN     "cnhExpiration" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "drivers" ALTER COLUMN "cnh" DROP NOT NULL;
