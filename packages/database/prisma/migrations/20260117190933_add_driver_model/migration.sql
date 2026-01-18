-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('ATIVO', 'INATIVO');

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT,
    "cnh" TEXT,
    "cnhCategory" TEXT,
    "cnhValidade" TIMESTAMP(3),
    "telefone" TEXT,
    "phone" TEXT,
    "status" "DriverStatus" NOT NULL DEFAULT 'ATIVO',
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drivers_cpf_key" ON "drivers"("cpf");

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
