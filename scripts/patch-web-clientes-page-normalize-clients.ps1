#!/usr/bin/env pwsh
#Requires -Version 7.0
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$Path) { 
  if (-not (Test-Path -LiteralPath $Path)) { 
    New-Item -ItemType Directory -Path $Path | Out-Null 
  } 
}

function Backup-File([string]$File) {
  if (Test-Path -LiteralPath $File) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $bak = "$File.bak.$stamp"
    Copy-Item -LiteralPath $File -Destination $bak -Force
    return $bak
  }
  return $null
}

function Write-Utf8NoBom([string]$File, [string]$Content) {
  $dir = Split-Path -Parent $File
  Ensure-Dir $dir
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($File, $Content, $utf8NoBom)
}

$root = (Resolve-Path ".").Path
$file = Join-Path $root "apps\web\src\app\(app)\clientes\page.tsx"

if (-not (Test-Path -LiteralPath $file)) { 
  throw "Arquivo não encontrado: $file" 
}

$bak = Backup-File $file
Write-Host "🧷 Backup: $bak" -ForegroundColor Yellow

$src = Get-Content -LiteralPath $file -Raw

# Injeta helper normalizeClients uma única vez (perto do topo do arquivo)
if ($src -notmatch "function normalizeClients") {
  $src = $src -replace '(?s)("use client";.*?\n)', ('$1' + @'

function normalizeClients(input: unknown): any[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") {
    const obj = input as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.clients)) return obj.clients;
    if (Array.isArray(obj.items)) return obj.items;
    if (obj.ok === false && Array.isArray(obj.details?.items)) return obj.details.items;
  }
  return [];
}

'@)
}

# Procura a primeira ocorrência de ".filter(" usando variável clients e cria uma "clientsArr"
if ($src -notmatch "const clientsArr = normalizeClients") {
  $src = $src -replace '(?m)^\s*const\s+filteredClients\s*=\s*clients\.filter\(', '  const clientsArr = normalizeClients(clients);' + "`n" + '  const filteredClients = clientsArr.filter('
}

Write-Utf8NoBom $file $src
Write-Host "✅ Patch aplicado: $file" -ForegroundColor Green
Write-Host "➡️ Rode: corepack pnpm -w typecheck && corepack pnpm -w lint && corepack pnpm --dir apps/web dev" -ForegroundColor Cyan
