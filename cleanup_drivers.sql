-- ========================================
-- LIMPEZA: Deletar drivers sem CNH
-- ========================================

-- 1. VER quantos serão deletados
SELECT COUNT(*) as "total_para_deletar"
FROM drivers 
WHERE "licenseNumber" IS NULL;

-- 2. VER detalhes antes de deletar
SELECT id, name, cpf, email, status, "createdAt"
FROM drivers 
WHERE "licenseNumber" IS NULL;

-- 3. DELETAR
DELETE FROM drivers 
WHERE "licenseNumber" IS NULL;

-- 4. CONFIRMAR que deletou tudo
SELECT COUNT(*) as "motoristas_sem_cnh"
FROM drivers 
WHERE "licenseNumber" IS NULL;
-- Deve retornar 0

-- 5. VER motoristas restantes
SELECT id, name, "licenseNumber", status, "createdAt"
FROM drivers 
ORDER BY "createdAt" DESC;
