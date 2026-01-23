-- CreateTable
CREATE TABLE "transacoes" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "referencia" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transacoes_status_idx" ON "transacoes"("status");

-- CreateIndex
CREATE INDEX "transacoes_tipo_idx" ON "transacoes"("tipo");

-- CreateIndex
CREATE INDEX "transacoes_data_idx" ON "transacoes"("data");

-- RenameIndex
ALTER INDEX "clients_email_idx" RENAME TO "client_email_idx";
