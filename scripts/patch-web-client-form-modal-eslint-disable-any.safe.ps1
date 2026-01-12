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

$root = (Resolve-Path ".").Path
$file = Join-Path $root "apps\web\src\app\(app)\clientes\_components\client-form-modal.tsx"
if (-not (Test-Path -LiteralPath $file)) { throw "Arquivo não encontrado: $file" }

$bak = Backup-File $file
Write-Host "🧷 Backup:" $bak

$src = Get-Content -LiteralPath $file -Raw

# Se já tiver o disable, não duplica
if ($src -notmatch "@typescript-eslint/no-explicit-any") {
  $header = "
