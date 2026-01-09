#Requires -Version 7.0
[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

function Run($cmd) {
  Write-Host ">> $cmd" -ForegroundColor Cyan
  iex $cmd
}

# 1) Typecheck / Lint / Build (monorepo)
Run "pnpm -w typecheck"
Run "pnpm -w lint"
Run "pnpm -w build"

# 2) Prisma sanity (schema fora do padrão root)
$schema = "packages/database/prisma/schema.prisma"
if (Test-Path $schema) {
  Run "pnpm -w exec prisma validate --schema `"$schema`""
  Run "pnpm -w exec prisma generate --schema `"$schema`""
} else {
  Write-Host "WARN: Prisma schema nao encontrado em $schema (pulando prisma validate/generate)" -ForegroundColor Yellow
}

Write-Host "`nOK: check completo passou." -ForegroundColor Green

