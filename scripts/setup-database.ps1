# Script de Setup Automático do Banco de Dados PostgreSQL
# MAG Sistema de Locação

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MAG Locação - Setup do Banco de Dados" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Função para verificar se o PostgreSQL está instalado
function Test-PostgreSQL {
    try {
        $null = Get-Command psql -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Função para verificar se o Docker está instalado
function Test-Docker {
    try {
        $null = Get-Command docker -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Pergunta ao usuário pela configuração do banco
Write-Host "🔍 Verificando ambiente..." -ForegroundColor Yellow
Write-Host ""

$hasPostgres = Test-PostgreSQL
$hasDocker = Test-Docker

if ($hasPostgres) {
    Write-Host "✅ PostgreSQL encontrado!" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL não encontrado" -ForegroundColor Red
}

if ($hasDocker) {
    Write-Host "✅ Docker encontrado!" -ForegroundColor Green
} else {
    Write-Host "❌ Docker não encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "Escolha uma opção:" -ForegroundColor Cyan
Write-Host "1) Usar PostgreSQL existente (local)" -ForegroundColor White
Write-Host "2) Criar container Docker com PostgreSQL" -ForegroundColor White
Write-Host "3) Configurar manualmente" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Opção (1/2/3)"

# Variáveis padrão
$dbUser = "postgres"
$dbPassword = "postgres"
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "mag_locacao"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📦 Configurando PostgreSQL local..." -ForegroundColor Yellow
        Write-Host ""
        
        $dbUser = Read-Host "Usuário PostgreSQL (padrão: postgres)"
        if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }
        
        $dbPassword = Read-Host "Senha PostgreSQL (padrão: postgres)" -AsSecureString
        $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
        if ([string]::IsNullOrWhiteSpace($dbPasswordPlain)) { $dbPasswordPlain = "postgres" }
        
        $dbHost = Read-Host "Host (padrão: localhost)"
        if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }
        
        $dbPort = Read-Host "Porta (padrão: 5432)"
        if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }
        
        $dbName = Read-Host "Nome do banco (padrão: mag_locacao)"
        if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "mag_locacao" }
    }
    "2" {
        if (-not $hasDocker) {
            Write-Host ""
            Write-Host "❌ Docker não está instalado!" -ForegroundColor Red
            Write-Host "Instale o Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host ""
        Write-Host "🐳 Criando container Docker com PostgreSQL..." -ForegroundColor Yellow
        Write-Host ""
        
        # Remove container existente se houver
        docker rm -f mag-postgres 2>$null
        
        # Cria novo container
        docker run --name mag-postgres `
            -e POSTGRES_PASSWORD=postgres `
            -e POSTGRES_DB=mag_locacao `
            -p 5432:5432 `
            -d postgres:15
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Container PostgreSQL criado com sucesso!" -ForegroundColor Green
            Start-Sleep -Seconds 5
        } else {
            Write-Host "❌ Erro ao criar container Docker" -ForegroundColor Red
            exit 1
        }
        
        $dbPasswordPlain = "postgres"
    }
    "3" {
        Write-Host ""
        Write-Host "✏️ Configuração manual..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Digite a connection string completa:" -ForegroundColor Cyan
        Write-Host "Formato: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public" -ForegroundColor Gray
        Write-Host ""
        
        $connString = Read-Host "Connection String"
        
        if ([string]::IsNullOrWhiteSpace($connString)) {
            Write-Host "❌ Connection string vazia!" -ForegroundColor Red
            exit 1
        }
        
        # Cria arquivos .env com connection string manual
        $envContent = "DATABASE_URL=`"$connString`""
        Set-Content -Path "packages/database/.env" -Value $envContent
        Set-Content -Path "apps/api/.env" -Value "NODE_ENV=development`nPORT=3001`n$envContent"
        
        Write-Host "✅ Arquivos .env criados!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Próximos passos:" -ForegroundColor Cyan
        Write-Host "1. cd packages/database" -ForegroundColor White
        Write-Host "2. pnpm prisma generate" -ForegroundColor White
        Write-Host "3. pnpm prisma migrate dev --name add-vehicles" -ForegroundColor White
        Write-Host "4. cd ../../apps/api" -ForegroundColor White
        Write-Host "5. pnpm dev" -ForegroundColor White
        exit 0
    }
    default {
        Write-Host "❌ Opção inválida!" -ForegroundColor Red
        exit 1
    }
}

# Cria DATABASE_URL
$databaseUrl = "postgresql://${dbUser}:${dbPasswordPlain}@${dbHost}:${dbPort}/${dbName}?schema=public"

Write-Host ""
Write-Host "📝 Criando arquivos .env..." -ForegroundColor Yellow

# Cria .env em packages/database
$envContent = "DATABASE_URL=`"$databaseUrl`""
New-Item -ItemType Directory -Path "packages/database" -Force | Out-Null
Set-Content -Path "packages/database/.env" -Value $envContent
Write-Host "✅ packages/database/.env criado" -ForegroundColor Green

# Cria .env em apps/api
$apiEnvContent = @"
NODE_ENV=development
PORT=3001
DATABASE_URL="$databaseUrl"
"@
New-Item -ItemType Directory -Path "apps/api" -Force | Out-Null
Set-Content -Path "apps/api/.env" -Value $apiEnvContent
Write-Host "✅ apps/api/.env criado" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Gerando Prisma Client..." -ForegroundColor Yellow
Set-Location "packages/database"
pnpm prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar Prisma Client" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}

Write-Host ""
Write-Host "🗄️ Rodando migrações..." -ForegroundColor Yellow
pnpm prisma migrate dev --name add-vehicles

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao rodar migrações" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}

Set-Location "../.."

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Setup Concluído com Sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Inicie a API:" -ForegroundColor White
Write-Host "   cd apps/api" -ForegroundColor Gray
Write-Host "   pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Em outro terminal, inicie o frontend:" -ForegroundColor White
Write-Host "   cd apps/web" -ForegroundColor Gray
Write-Host "   pnpm dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Acesse: http://localhost:3000" -ForegroundColor White
Write-Host ""
