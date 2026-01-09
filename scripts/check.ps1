#Requires -Version 7.0
[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

function Run([string]$cmd) {
  Write-Host ">> $cmd" -ForegroundColor Cyan
  & cmd.exe /d /s /c $cmd
  if ($LASTEXITCODE -ne 0) {
    throw "Falhou: $cmd (exit=$LASTEXITCODE)"
  }
}

# Sanity: garantir que estamos no repo root (onde existe package.json)
if (!(Test-Path "package.json")) {
  throw "Execute este script na raiz do repo (onde existe package.json)."
}

# 1) Gates principais (monorepo)
Run "pnpm -w typecheck"
Run "pnpm -w lint"
Run "pnpm -w build"

# 2) Prisma sanity (usa prisma.schema no package.json root)
# Você já setou: package.json -> prisma.schema = packages/database/prisma/schema.prisma
Run "pnpm -w exec prisma validate"
Run "pnpm -w prisma:generate"

Write-Host "`nOK: check completo passou." -ForegroundColor Green
