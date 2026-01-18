-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ATIVO', 'INATIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('DISPONIVEL', 'LOCADO', 'MANUTENCAO', 'INATIVO');

-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('ATIVA', 'FINALIZADA', 'CANCELADA', 'ATRASADA');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVA', 'CORRETIVA', 'REVISAO', 'SINISTRO');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "type" "ClientType" NOT NULL,
    "status" "ClientStatus" NOT NULL DEFAULT 'ATIVO',
    "name" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "razaoSocial" TEXT,
    "cnpj" TEXT,
    "nomeFantasia" TEXT,
    "inscricaoEstadual" TEXT,
    "cellphone" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cnhNumero" TEXT,
    "cnhCategoria" TEXT,
    "cnhValidade" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "anoModelo" INTEGER,
    "cor" TEXT,
    "quilometragem" INTEGER NOT NULL DEFAULT 0,
    "renavam" TEXT,
    "chassi" TEXT,
    "status" "VehicleStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "categoria" TEXT,
    "combustivel" TEXT,
    "valorDiaria" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorSemanal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorMensal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ipvaValor" DOUBLE PRECISION,
    "ipvaVencimento" TIMESTAMP(3),
    "seguroValor" DOUBLE PRECISION,
    "seguroVencimento" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rentals" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "status" "RentalStatus" NOT NULL DEFAULT 'ATIVA',
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "dataRetirada" TIMESTAMP(3),
    "dataDevolucao" TIMESTAMP(3),
    "valorDiaria" DOUBLE PRECISION NOT NULL,
    "diasLocacao" INTEGER NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "valorPago" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorPendente" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kmInicial" INTEGER,
    "kmFinal" INTEGER,
    "kmRodados" INTEGER,
    "combustivelSaida" TEXT,
    "combustivelRetorno" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenances" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "tipo" "MaintenanceType" NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'PENDENTE',
    "oficina" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_cpf_key" ON "clients"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "clients_cnpj_key" ON "clients"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_placa_key" ON "vehicles"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_renavam_key" ON "vehicles"("renavam");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_chassi_key" ON "vehicles"("chassi");

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
