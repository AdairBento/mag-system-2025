# Script para iniciar ambiente de desenvolvimento
# MAG Sistema de Locação

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MAG Locação - Iniciando Dev Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se os .env existem
if (-not (Test-Path "packages/database/.env")) {
    Write-Host "❌ Arquivo packages/database/.env não encontrado!" -ForegroundColor Red
    Write-Host "Execute primeiro: .\scripts\setup-database.ps1" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "apps/api/.env")) {
    Write-Host "❌ Arquivo apps/api/.env não encontrado!" -ForegroundColor Red
    Write-Host "Execute primeiro: .\scripts\setup-database.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Iniciando API e Frontend em paralelo..." -ForegroundColor Yellow
Write-Host ""

# Inicia API em um novo terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\api'; Write-Host '🔥 API Server' -ForegroundColor Green; pnpm dev"

Start-Sleep -Seconds 2

# Inicia Frontend em outro terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\web'; Write-Host '🌐 Frontend Server' -ForegroundColor Blue; pnpm dev"

Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "API: http://localhost:3001" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Swagger: http://localhost:3001/api" -ForegroundColor White
Write-Host ""
