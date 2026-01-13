/*
  Warnings:

  - Added the required column `email` to the `drivers` table without a default value. This is not possible if the table is not empty.
  - Made the column `cnh` on table `drivers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "cnh" SET NOT NULL;
