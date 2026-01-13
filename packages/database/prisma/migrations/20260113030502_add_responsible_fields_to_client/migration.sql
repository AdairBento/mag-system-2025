/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "responsibleName" TEXT,
ADD COLUMN     "responsiblePhone" TEXT,
ALTER COLUMN "cnh" DROP NOT NULL,
ALTER COLUMN "cnhCategory" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clients_cpf_key" ON "clients"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "clients_cnpj_key" ON "clients"("cnpj");
