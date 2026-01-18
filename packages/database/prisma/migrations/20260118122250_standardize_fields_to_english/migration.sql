/*
  Warnings:

  - You are about to drop the column `bairro` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `cep` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `cidade` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `cnhCategoria` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `cnhNumero` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `cnhValidade` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `complemento` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `dataNascimento` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `inscricaoEstadual` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `logradouro` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `nomeFantasia` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `observacoes` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `razaoSocial` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `cnh` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `cnhCategory` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `cnhValidade` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `dataFim` on the `maintenances` table. All the data in the column will be lost.
  - You are about to drop the column `dataInicio` on the `maintenances` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `maintenances` table. All the data in the column will be lost.
  - You are about to drop the column `observacoes` on the `maintenances` table. All the data in the column will be lost.
  - You are about to drop the column `oficina` on the `maintenances` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `maintenances` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `maintenances` table. All the data in the column will be lost.
  - You are about to drop the column `combustivelRetorno` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `combustivelSaida` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `dataDevolucao` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `dataFim` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `dataInicio` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `dataRetirada` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `diasLocacao` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `kmFinal` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `kmInicial` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `kmRodados` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `observacoes` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `valorDiaria` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `valorPago` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `valorPendente` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `valorTotal` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `ano` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `anoModelo` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `combustivel` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `cor` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `ipvaValor` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `ipvaVencimento` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `marca` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `modelo` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `observacoes` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `placa` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `quilometragem` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `seguroValor` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `seguroVencimento` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `valorDiaria` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `valorMensal` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `valorSemanal` on the `vehicles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[plate]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `maintenances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `maintenances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `maintenances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyRate` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rentalDays` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brand` to the `vehicles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `vehicles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plate` to the `vehicles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "vehicles_placa_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "bairro",
DROP COLUMN "cep",
DROP COLUMN "cidade",
DROP COLUMN "cnhCategoria",
DROP COLUMN "cnhNumero",
DROP COLUMN "cnhValidade",
DROP COLUMN "complemento",
DROP COLUMN "dataNascimento",
DROP COLUMN "estado",
DROP COLUMN "inscricaoEstadual",
DROP COLUMN "logradouro",
DROP COLUMN "nomeFantasia",
DROP COLUMN "numero",
DROP COLUMN "observacoes",
DROP COLUMN "razaoSocial",
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "licenseCategory" TEXT,
ADD COLUMN     "licenseExpiry" TIMESTAMP(3),
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "stateRegistration" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "tradeName" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "cnh",
DROP COLUMN "cnhCategory",
DROP COLUMN "cnhValidade",
DROP COLUMN "telefone",
ADD COLUMN     "cellphone" TEXT,
ADD COLUMN     "licenseCategory" TEXT,
ADD COLUMN     "licenseExpiry" TIMESTAMP(3),
ADD COLUMN     "licenseNumber" TEXT;

-- AlterTable
ALTER TABLE "maintenances" DROP COLUMN "dataFim",
DROP COLUMN "dataInicio",
DROP COLUMN "descricao",
DROP COLUMN "observacoes",
DROP COLUMN "oficina",
DROP COLUMN "tipo",
DROP COLUMN "valor",
ADD COLUMN     "amount" DOUBLE PRECISION,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "type" "MaintenanceType" NOT NULL,
ADD COLUMN     "workshop" TEXT;

-- AlterTable
ALTER TABLE "rentals" DROP COLUMN "combustivelRetorno",
DROP COLUMN "combustivelSaida",
DROP COLUMN "dataDevolucao",
DROP COLUMN "dataFim",
DROP COLUMN "dataInicio",
DROP COLUMN "dataRetirada",
DROP COLUMN "diasLocacao",
DROP COLUMN "kmFinal",
DROP COLUMN "kmInicial",
DROP COLUMN "kmRodados",
DROP COLUMN "observacoes",
DROP COLUMN "valorDiaria",
DROP COLUMN "valorPago",
DROP COLUMN "valorPendente",
DROP COLUMN "valorTotal",
ADD COLUMN     "dailyRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "endMileage" INTEGER,
ADD COLUMN     "fuelOnPickup" TEXT,
ADD COLUMN     "fuelOnReturn" TEXT,
ADD COLUMN     "mileageDriven" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "pendingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "pickupDate" TIMESTAMP(3),
ADD COLUMN     "rentalDays" INTEGER NOT NULL,
ADD COLUMN     "returnDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startMileage" INTEGER,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "ano",
DROP COLUMN "anoModelo",
DROP COLUMN "categoria",
DROP COLUMN "combustivel",
DROP COLUMN "cor",
DROP COLUMN "ipvaValor",
DROP COLUMN "ipvaVencimento",
DROP COLUMN "marca",
DROP COLUMN "modelo",
DROP COLUMN "observacoes",
DROP COLUMN "placa",
DROP COLUMN "quilometragem",
DROP COLUMN "seguroValor",
DROP COLUMN "seguroVencimento",
DROP COLUMN "valorDiaria",
DROP COLUMN "valorMensal",
DROP COLUMN "valorSemanal",
ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "dailyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fuelType" TEXT,
ADD COLUMN     "insuranceAmount" DOUBLE PRECISION,
ADD COLUMN     "insuranceExpiry" TIMESTAMP(3),
ADD COLUMN     "ipvaAmount" DOUBLE PRECISION,
ADD COLUMN     "ipvaExpiry" TIMESTAMP(3),
ADD COLUMN     "mileage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "modelYear" INTEGER,
ADD COLUMN     "monthlyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "plate" TEXT NOT NULL,
ADD COLUMN     "weeklyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");
