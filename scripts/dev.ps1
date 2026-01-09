#Requires -Version 7.0
<#
.SYNOPSIS
  MAG monorepo dev runner (Web + API + optional Prisma tasks)
.PARAMETER Clean
  Removes Next.js cache (.next) and stale locks
.PARAMETER Prisma
  Runs Prisma generate + migrate in packages/database
.PARAMETER WebPort
  Web port (default: 3000)
.PARAMETER ApiPort
  API port (default: 3001)
#>

[CmdletBinding()]
param(
  [switch]$Clean,
  [switch]$Prisma,
  [int]$WebPort = 3000,
  [int]$ApiPort = 3001
)

$ErrorActionPreference = "Stop"

function Find-RepoRoot([string]$start) {
  $p = (Resolve-Path $start).Path
  while ($true) {
    if (Test-Path (Join-Path $p "pnpm-workspace.yaml")) { return $p }
    $parent = Split-Path $p -Parent
    if ($parent -eq $p) { break }
    $p = $parent
  }
  throw "Repo root not found (pnpm-workspace.yaml)."
}

function Stop-ListeningPort([int]$port) {
  $lines = netstat -ano | Select-String ":$port\s+.*LISTENING\s+(\d+)$"
  $pids = @()
  foreach ($l in $lines) {
    $m = [regex]::Match($l.Line, "LISTENING\s+(\d+)$")
    if ($m.Success) { $pids += [int]$m.Groups[1].Value }
  }
  $pids = $pids | Select-Object -Unique
  foreach ($procId in $pids) {
    try {
      Write-Host "🔻 Killing PID $procId on port $port" -ForegroundColor Yellow
      taskkill /F /PID $procId | Out-Null
    } catch {}
  }
}

function Remove-NextLocks([string]$repoRoot) {
  $lock1 = Join-Path $repoRoot "apps\web\.next\dev\lock"
  $lock2 = Join-Path $repoRoot "apps\web\.next\dev\lock.pid"
  foreach ($p in @($lock1, $lock2)) {
    if (Test-Path $p) {
      try {
        Remove-Item -Force $p -ErrorAction Stop
        Write-Host "🧹 Removed Next lock: $p" -ForegroundColor Cyan
      } catch {
        Write-Host "⚠️ Could not remove lock: $p" -ForegroundColor Yellow
      }
    }
  }
}

try {
  $root = Find-RepoRoot $PSScriptRoot
  Set-Location $root

  Write-Host "`n🧹 Cleaning ports and stale locks..." -ForegroundColor Cyan
  Stop-ListeningPort $WebPort
  Stop-ListeningPort $ApiPort

  # best-effort: stop orphan node processes (avoid next lock issues)
  try { Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue } catch {}

  Remove-NextLocks $root

  if ($Clean) {
    $nextPath = Join-Path $root "apps\web\.next"
    if (Test-Path $nextPath) {
      Write-Host "🧽 Removing .next..." -ForegroundColor Cyan
      Remove-Item -Recurse -Force $nextPath
    } else {
      Write-Host "ℹ️ .next not found (ok)" -ForegroundColor DarkGray
    }
  }

  # Ensure env using absolute path (no cwd issues)
  $envScript = Join-Path $PSScriptRoot "env.ps1"
  if (!(Test-Path $envScript)) { throw "Missing env.ps1 at $envScript" }

  Write-Host "`n🧾 Ensuring .env files..." -ForegroundColor Cyan
  pwsh -NoProfile -ExecutionPolicy Bypass -File $envScript -ApiPort $ApiPort -WebPort $WebPort | Write-Host

  if ($Prisma) {
    Write-Host "`n🗄️ Prisma: generate + migrate..." -ForegroundColor Cyan
    $dbPath = Join-Path $root "packages\database"
    if (!(Test-Path $dbPath)) { throw "Missing packages/database" }

    Push-Location $dbPath
    try {
      pnpm exec prisma generate
      pnpm exec prisma migrate dev
    } finally {
      Pop-Location
    }
  }

  Write-Host "`n🚀 Starting monorepo dev (stream + no-bail)..." -ForegroundColor Green
  pnpm -r --parallel --stream --no-bail dev
}
catch {
  Write-Host "`n❌ dev.ps1 error:" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  throw
}
