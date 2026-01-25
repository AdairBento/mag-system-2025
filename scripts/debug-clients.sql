-- Script para investigar clientes duplicados no banco de dados
-- Execute este script no Prisma Studio ou diretamente no PostgreSQL

-- 1. Verificar total de clientes no banco
SELECT COUNT(*) as total_clients FROM "Client";

-- 2. Verificar clientes ativos (sem deletedAt)
SELECT COUNT(*) as active_clients FROM "Client" WHERE "deletedAt" IS NULL;

-- 3. Verificar clientes deletados
SELECT COUNT(*) as deleted_clients FROM "Client" WHERE "deletedAt" IS NOT NULL;

-- 4. Verificar CPFs duplicados
SELECT cpf, COUNT(*) as count
FROM "Client"
WHERE cpf IS NOT NULL AND "deletedAt" IS NULL
GROUP BY cpf
HAVING COUNT(*) > 1;

-- 5. Verificar CNPJs duplicados
SELECT cnpj, COUNT(*) as count
FROM "Client"
WHERE cnpj IS NOT NULL AND "deletedAt" IS NULL
GROUP BY cnpj
HAVING COUNT(*) > 1;

-- 6. Verificar Emails duplicados
SELECT email, COUNT(*) as count
FROM "Client"
WHERE email IS NOT NULL AND "deletedAt" IS NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- 7. Listar todos os clientes com detalhes
SELECT 
  id,
  type,
  name,
  "companyName",
  cpf,
  cnpj,
  email,
  cellphone,
  "isActive",
  "deletedAt",
  "createdAt"
FROM "Client"
ORDER BY "createdAt" DESC;

-- 8. Verificar se existem clientes com isActive = false MAS deletedAt IS NULL
SELECT 
  id,
  name,
  "companyName",
  "isActive",
  "deletedAt"
FROM "Client"
WHERE "isActive" = false AND "deletedAt" IS NULL;

-- 9. SOLUÇÃO: Se houver clientes inativos sem deletedAt, corrigir:
-- UPDATE "Client"
-- SET "deletedAt" = NOW()
-- WHERE "isActive" = false AND "deletedAt" IS NULL;

-- 10. SOLUÇÃO: Se houver CPFs duplicados, deletar o mais recente:
-- DELETE FROM "Client"
-- WHERE id IN (
--   SELECT id FROM (
--     SELECT id, ROW_NUMBER() OVER (PARTITION BY cpf ORDER BY "createdAt" DESC) as rn
--     FROM "Client"
--     WHERE cpf IS NOT NULL AND "deletedAt" IS NULL
--   ) t WHERE t.rn > 1
-- );
