Write-Host '🐘 Subindo banco de teste...' -ForegroundColor Cyan
docker compose up -d db-test

Write-Host '⏳ Aguardando Postgres iniciar...' -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host '📦 Aplicando migrations...' -ForegroundColor Cyan
$env:DATABASE_URL = 'postgresql://mag_user:mag_password@localhost:5433/mag_rental_test?schema=public'
pnpm --filter @mag/database exec prisma migrate deploy --schema prisma/schema.prisma

Write-Host '✨ Gerando Prisma Client...' -ForegroundColor Cyan
pnpm --filter @mag/database db:generate

Write-Host '✅ Validando schema...' -ForegroundColor Cyan
pnpm --filter @mag/database run prisma:validate

Write-Host '✅ Auditoria de DB completa!' -ForegroundColor Green
