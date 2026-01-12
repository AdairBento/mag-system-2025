#!/usr/bin/env pwsh
#Requires -Version 7.0
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

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

# Injeta helper normalizeClients
if ($src -notmatch "function normalizeClients") {
  $helper = @'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeClients(input: unknown): any[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = input as any;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.clients)) return obj.clients;
    if (Array.isArray(obj.items)) return obj.items;
  }
  return [];
}

'@
  $src = $src -replace '("use client";)', ('$1' + $helper)
}

# Substitui clients.filter por normalizeClients(clients).filter
if ($src -match 'clients\.filter\(') {
  $replacement = '  const clientsArr = normalizeClients(clients);' + "`n" + '  const filteredClients = clientsArr.filter('
  $src = $src -replace '(?m)^\s*const\s+filteredClients\s*=\s*clients\.filter\(', $replacement
}

Write-Utf8NoBom $file $src
Write-Host "✅ Patch aplicado: $file" -ForegroundColor Green
