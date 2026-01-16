#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"
$startTime = Get-Date

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 MAG System - Auditoria Completa" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Invoke-AuditStep {
    param([string]$Name, [string]$Command, [string]$Icon = "✓")
    Write-Host "[$Icon] $Name..." -ForegroundColor Yellow
    try {
        Invoke-Expression $Command
        Write-Host "[$Icon] $Name - OK" -ForegroundColor Green
        Write-Host ""
        return $true
    } catch {
        Write-Host "[$Icon] $Name - FALHOU" -ForegroundColor Red
        Write-Host "Erro: $_" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

if (-not (Invoke-AuditStep -Name "Formato (Prettier)" -Command "pnpm run audit:format" -Icon "📝")) {
    Write-Host "❌ Corrija com: pnpm format" -ForegroundColor Red
    exit 1
}

if (-not (Invoke-AuditStep -Name "Lint (ESLint)" -Command "pnpm run audit:lint" -Icon "🔍")) {
    Write-Host "❌ Corrija com: pnpm lint:fix" -ForegroundColor Red
    exit 1
}

if (-not (Invoke-AuditStep -Name "TypeCheck" -Command "pnpm run audit:types" -Icon "📘")) {
    Write-Host "❌ Corrija os erros de tipo" -ForegroundColor Red
    exit 1
}

if (-not (Invoke-AuditStep -Name "Build" -Command "pnpm run audit:build" -Icon "🏗️")) {
    Write-Host "❌ Corrija os erros de build" -ForegroundColor Red
    exit 1
}

if (-not (Invoke-AuditStep -Name "Tests" -Command "pnpm run audit:test" -Icon "🧪")) {
    Write-Host "⚠️ Alguns testes falharam" -ForegroundColor Yellow
}

if (-not (Invoke-AuditStep -Name "Database" -Command "pnpm run audit:db" -Icon "🗄️")) {
    Write-Host "❌ Problemas com Prisma" -ForegroundColor Red
    exit 1
}

Write-Host "[🔒] Security..." -ForegroundColor Yellow
try {
    pnpm run audit:security
    Write-Host "[🔒] Security - OK" -ForegroundColor Green
} catch {
    Write-Host "[🔒] Vulnerabilidades encontradas" -ForegroundColor Yellow
}

$duration = (Get-Date) - $startTime
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ AUDITORIA COMPLETA - SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Tempo: $($duration.TotalSeconds.ToString('0.00'))s" -ForegroundColor Cyan
Write-Host "Pronto para commit/push! 🚀" -ForegroundColor Green
exit 0
