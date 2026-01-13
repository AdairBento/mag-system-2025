/*
  Warnings:

  - You are about to drop the column `cellphone` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `cnhValidade` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `nomeFantasia` on the `clients` table. All the data in the column will be lost.
  - Made the column `cnh` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `cnhCategory` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "clients_cnpj_key";

-- DropIndex
DROP INDEX "clients_cpf_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "cellphone",
DROP COLUMN "city",
DROP COLUMN "cnhValidade",
DROP COLUMN "nomeFantasia",
ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "cnhExpiration" TEXT,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "inscricaoEstadual" TEXT,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "rg" TEXT,
ADD COLUMN     "uf" TEXT,
ALTER COLUMN "cnh" SET NOT NULL,
DROP COLUMN "cnhCategory",
ADD COLUMN     "cnhCategory" TEXT NOT NULL;
