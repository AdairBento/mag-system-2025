-- =====================================================
-- SCRIPT DE TESTE: MIGRAÇÃO DE MOTORISTAS
-- Sistema: MAG Locação - Driver Migration Feature
-- Autor: Adair Bento
-- Data: 2026-01-19
-- =====================================================

-- ATENÇÃO: Execute em uma transação para poder fazer ROLLBACK
BEGIN;

-- =====================================================
-- 1. SETUP: CRIAR CLIENTES DE TESTE
-- =====================================================
INSERT INTO "Client" (
  "id",
  "name",
  "type",
  "status",
  "cpf",
  "cellphone",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES 
  (
    gen_random_uuid(),
    'Empresa A - Transportes',
    'PJ',
    'ATIVO',
    '12345678901',
    '31999887766',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Empresa B - Logística',
    'PJ',
    'ATIVO',
    '98765432100',
    '31988776655',
    true,
    NOW(),
    NOW()
  )
RETURNING "id", "name";

-- Armazenar IDs em variáveis (PostgreSQL 14+)
-- Se seu PostgreSQL é mais antigo, copie os UUIDs manualmente das linhas acima

-- =====================================================
-- 2. OBTER IDs DOS CLIENTES
-- =====================================================
SELECT 
  "id" as client_id,
  "name" as client_name
FROM "Client"
WHERE "name" IN ('Empresa A - Transportes', 'Empresa B - Logística')
ORDER BY "name";

-- 👉 COPIE O ID DA EMPRESA A AQUI: _________________________
-- 👉 COPIE O ID DA EMPRESA B AQUI: _________________________

-- =====================================================
-- 3. CRIAR MOTORISTA NA EMPRESA A
-- =====================================================
-- SUBSTITUA 'EMPRESA_A_ID_AQUI' pelo UUID copiado acima
INSERT INTO "Driver" (
  "id",
  "name",
  "cpf",
  "rg",
  "birthDate",
  "cellphone",
  "email",
  "zipCode",
  "street",
  "number",
  "neighborhood",
  "city",
  "state",
  "licenseNumber",
  "licenseCategory",
  "licenseExpiry",
  "status",
  "clientId",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'João Silva Santos',
  '12345678900',
  'MG12345678',
  '1990-01-15',
  '31999887766',
  'joao.silva@email.com',
  '30130100',
  'Rua da Bahia',
  '1234',
  'Centro',
  'Belo Horizonte',
  'MG',
  'CNH12345678',  -- ⚠️ CNH QUE SERÁ TESTADA
  'AB',
  '2026-12-31',
  'ATIVO',
  'EMPRESA_A_ID_AQUI',  -- 👉 SUBSTITUIR
  true,
  NOW(),
  NOW()
)
RETURNING "id", "name", "licenseNumber", "clientId";

-- 👉 COPIE O ID DO MOTORISTA AQUI: _________________________

-- =====================================================
-- 4. VERIFICAR MOTORISTA CRIADO
-- =====================================================
SELECT 
  d."id" as driver_id,
  d."name" as driver_name,
  d."licenseNumber" as cnh,
  d."clientId",
  c."name" as client_name,
  d."isActive",
  d."deletedAt"
FROM "Driver" d
LEFT JOIN "Client" c ON d."clientId" = c."id"
WHERE d."licenseNumber" = 'CNH12345678';

-- ✅ Esperado: 1 registro com clientId = Empresa A

-- =====================================================
-- 5. TESTAR DETECÇÃO DE CNH DUPLICADA
-- =====================================================
-- Esta query simula o que a API faz no método create()
SELECT 
  d."id",
  d."name",
  d."clientId",
  c."name" as client_name
FROM "Driver" d
LEFT JOIN "Client" c ON d."clientId" = c."id"
WHERE 
  d."licenseNumber" = 'CNH12345678'
  AND d."isActive" = true;

-- ✅ Esperado: 1 registro (o que acabamos de criar)
-- 🚨 Se tentar criar outro com mesma CNH, API deve retornar 409

-- =====================================================
-- 6. MIGRAR MOTORISTA PARA EMPRESA B
-- =====================================================
-- SUBSTITUA 'MOTORISTA_ID_AQUI' e 'EMPRESA_B_ID_AQUI'
UPDATE "Driver"
SET 
  "clientId" = 'EMPRESA_B_ID_AQUI',  -- 👉 SUBSTITUIR
  "updatedAt" = NOW()
WHERE "id" = 'MOTORISTA_ID_AQUI'  -- 👉 SUBSTITUIR
RETURNING "id", "name", "clientId";

-- =====================================================
-- 7. VERIFICAR MIGRAÇÃO
-- =====================================================
SELECT 
  d."id" as driver_id,
  d."name" as driver_name,
  d."licenseNumber" as cnh,
  c."name" as client_name,
  d."updatedAt"
FROM "Driver" d
LEFT JOIN "Client" c ON d."clientId" = c."id"
WHERE d."licenseNumber" = 'CNH12345678';

-- ✅ Esperado: clientName mudou de "Empresa A" para "Empresa B"

-- =====================================================
-- 8. TESTAR DESVINCULAÇÃO (INDEPENDENTE)
-- =====================================================
UPDATE "Driver"
SET 
  "clientId" = NULL,
  "updatedAt" = NOW()
WHERE "id" = 'MOTORISTA_ID_AQUI'  -- 👉 SUBSTITUIR
RETURNING "id", "name", "clientId";

-- Verificar
SELECT 
  d."id",
  d."name",
  d."clientId",
  CASE 
    WHEN d."clientId" IS NULL THEN 'MOTORISTA INDEPENDENTE'
    ELSE 'VINCULADO A CLIENTE'
  END as status_vinculo
FROM "Driver" d
WHERE d."licenseNumber" = 'CNH12345678';

-- ✅ Esperado: clientId = NULL, status = 'MOTORISTA INDEPENDENTE'

-- =====================================================
-- 9. TESTAR SOFT DELETE
-- =====================================================
UPDATE "Driver"
SET 
  "isActive" = false,
  "deletedAt" = NOW(),
  "updatedAt" = NOW()
WHERE "id" = 'MOTORISTA_ID_AQUI'  -- 👉 SUBSTITUIR
RETURNING "id", "name", "isActive", "deletedAt";

-- Verificar que não aparece em queries normais
SELECT COUNT(*)
FROM "Driver"
WHERE 
  "licenseNumber" = 'CNH12345678'
  AND "isActive" = true;

-- ✅ Esperado: COUNT = 0

-- =====================================================
-- 10. TESTAR RESTORE
-- =====================================================
UPDATE "Driver"
SET 
  "isActive" = true,
  "deletedAt" = NULL,
  "updatedAt" = NOW()
WHERE "id" = 'MOTORISTA_ID_AQUI'  -- 👉 SUBSTITUIR
RETURNING "id", "name", "isActive", "deletedAt";

-- Verificar
SELECT COUNT(*)
FROM "Driver"
WHERE 
  "licenseNumber" = 'CNH12345678'
  AND "isActive" = true;

-- ✅ Esperado: COUNT = 1

-- =====================================================
-- 11. RELATÓRIO FINAL
-- =====================================================
SELECT 
  d."id",
  d."name",
  d."licenseNumber",
  d."status",
  c."name" as current_client,
  d."isActive",
  d."deletedAt",
  d."createdAt",
  d."updatedAt"
FROM "Driver" d
LEFT JOIN "Client" c ON d."clientId" = c."id"
WHERE d."licenseNumber" = 'CNH12345678';

-- =====================================================
-- 12. LIMPEZA (OPCIONAL)
-- =====================================================
-- Se quiser MANTER os dados de teste, execute COMMIT:
-- COMMIT;

-- Se quiser REMOVER tudo e voltar ao estado anterior:
-- ROLLBACK;

-- 🚨 ESCOLHA UMA OPÇÃO ABAIXO:

-- Opção 1: MANTER dados de teste
COMMIT;
SELECT 'Dados de teste MANTIDOS. Execute o script de limpeza para remover.' as status;

-- Opção 2: REMOVER tudo (descomente as 3 linhas abaixo)
-- ROLLBACK;
-- SELECT 'Dados de teste REMOVIDOS. Banco voltou ao estado original.' as status;

-- =====================================================
-- SCRIPT DE LIMPEZA MANUAL (se escolheu COMMIT acima)
-- =====================================================
/*
DELETE FROM "Driver" WHERE "licenseNumber" = 'CNH12345678';
DELETE FROM "Client" WHERE "name" IN ('Empresa A - Transportes', 'Empresa B - Logística');
SELECT 'Limpeza concluída' as status;
*/

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================