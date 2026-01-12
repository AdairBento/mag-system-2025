#!/usr/bin/env pwsh
#Requires -Version 7.0
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { New-Item -ItemType Directory -Path $Path | Out-Null }
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
if (-not (Test-Path -LiteralPath $file)) { throw "Arquivo não encontrado: $file" }

$bak = Backup-File $file
Write-Host "🧷 Backup:" $bak

$lines = Get-Content -LiteralPath $file

# 1) Injeta helper normalizeClients (uma vez), logo após "use client";
$hasHelper = $false
foreach ($l in $lines) { if ($l -match "function\s+normalizeClients\s*\(") { $hasHelper = $true; break } }

if (-not $hasHelper) {
  $inject = @(
    "",
    "function normalizeClients(input: unknown): any[] {",
    "  if (Array.isArray(input)) return input;",
    "  if (input && typeof input === ""object"") {",
    "    const obj = input as any;",
    "    if (Array.isArray(obj.data)) return obj.data;",
    "    if (Array.isArray(obj.clients)) return obj.clients;",
    "    if (Array.isArray(obj.items)) return obj.items;",
    "  }",
    "  return [];",
    "}",
    ""
  )

  $out = New-Object System.Collections.Generic.List[string]
  $inserted = $false

  for ($i=0; $i -lt $lines.Count; $i++) {
    $out.Add($lines[$i])

    if (-not $inserted -and $lines[$i].Trim() -eq '"use client";') {
      foreach ($x in $inject) { $out.Add($x) }
      $inserted = $true
    }
  }

  $lines = $out.ToArray()
}

# 2) Troca "clients.filter(" por "clientsArr.filter(" e cria clientsArr antes
# Procura a linha que contém "const filteredClients = clients.filter("
$alreadyArr = $false
foreach ($l in $lines) { if ($l -match "const\s+clientsArr\s*=\s*normalizeClients\(") { $alreadyArr = $true; break } }

if (-not $alreadyArr) {
  $out = New-Object System.Collections.Generic.List[string]
  for ($i=0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]

    if ($line -match "const\s+filteredClients\s*=\s*clients\.filter\s*\(") {
      # injeta antes e troca a linha
      $out.Add("  const clientsArr = normalizeClients(clients);")
      $out.Add(($line -replace "clients\.filter\s*\(", "clientsArr.filter("))
    } else {
      $out.Add($line)
    }
  }
  $lines = $out.ToArray()
}

Write-Utf8NoBom $file ($lines -join "`n")
Write-Host "✅ Patch aplicado:" $file
Write-Host "➡️ Rode: corepack pnpm -w typecheck && corepack pnpm -w lint && corepack pnpm --dir apps/web dev"
