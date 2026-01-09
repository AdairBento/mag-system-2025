#Requires -Version 7.0
<#
.SYNOPSIS
  Ensures .env files for MAG Locação development
.DESCRIPTION
  Creates/updates .env files with default values if missing
.PARAMETER ApiPort
  API port (default: 3001)
.PARAMETER WebPort
  Web port (default: 3000)
.PARAMETER DbUrl
  PostgreSQL URL
#>

[CmdletBinding()]
param(
  [int]$ApiPort = 3001,
  [int]$WebPort = 3000,
  [string]$DbUrl = "postgresql://mag_user:mag_password@localhost:5432/mag_rental?schema=public"
)

$ErrorActionPreference = "Stop"

# ----------------------------------------------------------------------------
# Resolve repo root so script behaves the same from any working directory
# ----------------------------------------------------------------------------
function Find-RepoRoot([string]$start) {
  $p = (Resolve-Path $start).Path
  while ($true) {
    if (Test-Path (Join-Path $p "pnpm-workspace.yaml")) { return $p }
    $parent = Split-Path $p -Parent
    if ($parent -eq $p) { break }
    $p = $parent
  }
  throw "Repo root not found (pnpm-workspace.yaml). Run inside the repo."
}

$RepoRoot = Find-RepoRoot $PSScriptRoot

function Resolve-RepoPath([string]$relativePath) {
  return (Join-Path $RepoRoot $relativePath)
}

# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
function Ensure-Dir([string]$path) {
  if (!(Test-Path $path)) {
    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
}

function Read-EnvFile([string]$file) {
  $map = @{}
  if (!(Test-Path $file)) { return $map }

  $lines = Get-Content $file -ErrorAction SilentlyContinue
  foreach ($line in $lines) {
    if ($line.Trim().StartsWith("#") -or $line -match "^\s*$") { continue }

    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { continue }

    $k = $line.Substring(0, $idx).Trim()
    $v = $line.Substring($idx + 1).Trim()
    $map[$k] = $v
  }
  return $map
}

function Write-EnvFile([string]$file, [hashtable]$map, [string[]]$headerLines) {
  $dir = Split-Path $file -Parent
  Ensure-Dir $dir

  $out = New-Object System.Collections.Generic.List[string]

  foreach ($h in $headerLines) { $out.Add($h) }
  if ($headerLines.Count -gt 0) { $out.Add("") }

  foreach ($k in ($map.Keys | Sort-Object)) {
    $out.Add("$k=$($map[$k])")
  }

  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllLines($file, $out.ToArray(), $utf8NoBom)
}

function Ensure-EnvKeys([string]$file, [hashtable]$desired, [string[]]$header) {
  $current = Read-EnvFile $file
  $changed = $false

  $safeKeys = @(
    "PORT", "NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_APP_NAME", "NEXT_PUBLIC_APP_VERSION",
    "NODE_ENV", "CORS_ORIGINS", "LOG_LEVEL", "DATABASE_URL"
  )

  foreach ($k in $desired.Keys) {
    if (!$current.ContainsKey($k)) {
      $current[$k] = $desired[$k]
      $changed = $true
      continue
    }

    if ($current[$k] -ne $desired[$k] -and $k -in $safeKeys) {
      $current[$k] = $desired[$k]
      $changed = $true
    }
  }

  if (!(Test-Path $file) -or $changed) {
    Write-Host "✓ Ensuring $file" -ForegroundColor Green
    Write-EnvFile $file $current $header
  } else {
    Write-Host "✓ $file already OK" -ForegroundColor DarkGreen
  }
}

function Ensure-Gitignore-HasEnv() {
  $gitignore = Resolve-RepoPath ".gitignore"

  if (!(Test-Path $gitignore)) {
    New-Item -ItemType File -Path $gitignore -Force | Out-Null
  }

  $raw = Get-Content $gitignore -Raw -ErrorAction SilentlyContinue
  if ($null -eq $raw) { $raw = "" }

  $patterns = @(".env", ".env.local", ".env.*.local")
  $missing = @()

  foreach ($pattern in $patterns) {
    $escaped = [regex]::Escape($pattern)
    if ($raw -notmatch "(?m)^\s*$escaped\s*$") {
      $missing += $pattern
    }
  }

  if ($missing.Count -gt 0) {
    $block = "`r`n# Environment variables`r`n" + ($missing -join "`r`n") + "`r`n"
    Add-Content -Path $gitignore -Value $block -Encoding UTF8
    Write-Host "✓ .gitignore updated (env patterns added)" -ForegroundColor Green
  } else {
    Write-Host "✓ .gitignore already contains env patterns" -ForegroundColor DarkGreen
  }
}

# ----------------------------------------------------------------------------
# Paths
# ----------------------------------------------------------------------------
$apiEnvPath = Resolve-RepoPath "apps/api/.env"
$webEnvPath = Resolve-RepoPath "apps/web/.env.local"
$dbEnvPath  = Resolve-RepoPath "packages/database/.env"

# ----------------------------------------------------------------------------
# Desired values
# ----------------------------------------------------------------------------
$apiDesired = @{
  "NODE_ENV"       = "development"
  "PORT"           = "$ApiPort"
  "DATABASE_URL"   = $DbUrl
  "CORS_ORIGINS"   = "http://localhost:$WebPort,http://localhost:$ApiPort,http://localhost:3002"
  "JWT_SECRET"     = "dev-secret-change-in-production"
  "JWT_EXPIRES_IN" = "7d"
  "LOG_LEVEL"      = "debug"
}

$webDesired = @{
  "NEXT_PUBLIC_API_URL"     = "http://localhost:$ApiPort"
  "NEXT_PUBLIC_APP_NAME"    = "MAG Locação"
  "NEXT_PUBLIC_APP_VERSION" = "0.1.0"
  "NODE_ENV"                = "development"
}

$dbDesired = @{
  "DATABASE_URL" = $DbUrl
}

# ----------------------------------------------------------------------------
# Run
# ----------------------------------------------------------------------------
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  CONFIGURANDO AMBIENTE MAG LOCAÇÃO" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n[1/2] Ensuring .env files..." -ForegroundColor Yellow

Ensure-EnvKeys $apiEnvPath $apiDesired @(
  "# API Environment (local)",
  "# DO NOT COMMIT THIS FILE"
)

Ensure-EnvKeys $webEnvPath $webDesired @(
  "# Web Environment (local)",
  "# DO NOT COMMIT THIS FILE"
)

Ensure-EnvKeys $dbEnvPath $dbDesired @(
  "# Database Environment (local)",
  "# DO NOT COMMIT THIS FILE"
)

Write-Host "`n[2/2] Ensuring .gitignore..." -ForegroundColor Yellow
Ensure-Gitignore-HasEnv

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ AMBIENTE CONFIGURADO!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n📡 URLs:" -ForegroundColor Yellow
Write-Host "  • API: http://localhost:$ApiPort" -ForegroundColor Cyan
Write-Host "  • Web: http://localhost:$WebPort" -ForegroundColor Cyan

Write-Host "`n📄 Files:" -ForegroundColor Yellow
Write-Host "  • $apiEnvPath" -ForegroundColor Gray
Write-Host "  • $webEnvPath" -ForegroundColor Gray
Write-Host "  • $dbEnvPath" -ForegroundColor Gray

Write-Host ""
