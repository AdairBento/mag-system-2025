# ==============================
# MAG Monorepo - Audit & Fix (one-shot)
# ==============================
$ErrorActionPreference = "Stop"

$repo = "C:\Users\adair\PycharmProject\MAG-system-webapp"
if (!(Test-Path $repo)) { throw "Repo não encontrado: $repo" }

function Stamp { (Get-Date -Format "yyyyMMdd-HHmmss") }
function Backup-File([string]$path) {
  if (Test-Path $path) {
    $bak = "$path.$(Stamp).bak"
    Copy-Item $path $bak -Force
    return $bak
  }
  return $null
}

function Kill-Port($port) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
      if ($c.OwningProcess -and $c.OwningProcess -gt 0) {
        Write-Host "Matando PID $($c.OwningProcess) na porta $port" -ForegroundColor Yellow
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
      }
    }
  } catch {}
}

function Remove-NextLockAndCache {
  param([string]$webDir)

  $lock = Join-Path $webDir ".next\dev\lock"
  $nextDir = Join-Path $webDir ".next"
  if (Test-Path $lock) {
    Write-Host "Removendo lock: $lock" -ForegroundColor Cyan
    Remove-Item $lock -Force -ErrorAction SilentlyContinue
  }
  if (Test-Path $nextDir) {
    Write-Host "Limpando cache .next (seguro)..." -ForegroundColor Cyan
    Remove-Item $nextDir -Recurse -Force -ErrorAction SilentlyContinue
  }
}

function Fix-ClientsTs {
  param([string]$clientsTs)

  if (!(Test-Path $clientsTs)) {
    Write-Host "clients.ts não encontrado (skip): $clientsTs" -ForegroundColor DarkGray
    return
  }

  $bak = Backup-File $clientsTs
  $raw = Get-Content -Raw -Encoding UTF8 $clientsTs

  # 1) mata "Unterminated regexp literal": api<any>(/clients...) -> api<any>("/clients"...)
  $raw2 = $raw
  $raw2 = $raw2 -replace 'api<([^>]+)>\(\s*/clients\b', 'api<$1>("/clients"'
  $raw2 = $raw2 -replace 'api\((\s*)/clients\b', 'api($1"/clients"'

  # 2) corrige qualquer "/clients?${qs.toString()}" para template literal real:
  #    `/clients?${qs.toString()}`
  $raw2 = $raw2 -replace '"/clients\?\$\{qs\.toString\(\)\}"', '``/clients?${qs.toString()}``'
  $raw2 = $raw2 -replace '"/clients\?\$\{([^}]+)\}"', '``/clients?${$1}``'

  if ($raw2 -ne $raw) {
    Set-Content -Path $clientsTs -Value $raw2 -Encoding UTF8
    Write-Host "OK: clients.ts corrigido. Backup: $bak" -ForegroundColor Green
  } else {
    Write-Host "OK: clients.ts já estava consistente (sem changes)." -ForegroundColor Green
  }
}

function Ensure-WebEnv {
  param([string]$envLocal)

  if (!(Test-Path $envLocal)) {
    New-Item -ItemType File -Force -Path $envLocal | Out-Null
  }

  $raw = Get-Content -Raw -Encoding UTF8 $envLocal
  $changed = $false

  if ($raw -notmatch "(?m)^\s*NEXT_PUBLIC_API_URL=") {
    $raw += "`r`nNEXT_PUBLIC_API_URL=http://localhost:3001"
    $changed = $true
  }

  if ($changed) {
    $bak = Backup-File $envLocal
    Set-Content -Path $envLocal -Value $raw.Trim() -Encoding UTF8
    Write-Host "OK: apps/web/.env.local ajustado (NEXT_PUBLIC_API_URL). Backup: $bak" -ForegroundColor Green
  } else {
    Write-Host "OK: apps/web/.env.local já tem NEXT_PUBLIC_API_URL" -ForegroundColor Green
  }
}

function Ensure-ClientsModuleImported {
  param([string]$appModulePath)

  if (!(Test-Path $appModulePath)) {
    Write-Host "app.module.ts não encontrado (skip): $appModulePath" -ForegroundColor DarkGray
    return
  }

  $raw = Get-Content -Raw -Encoding UTF8 $appModulePath
  if ($raw -match "ClientsModule") {
    Write-Host "OK: ClientsModule já referenciado no AppModule." -ForegroundColor Green
    return
  }

  $bak = Backup-File $appModulePath

  # Insere import e adiciona no imports: []
  if ($raw -notmatch 'from\s+"\./clients/clients\.module"') {
    $raw = $raw -replace '(import\s+\{[^}]+\}\s+from\s+"@nestjs/common"\s*\r?\n)', "`$1import { ClientsModule } from `"./clients/clients.module`"`r`n"
  }

  if ($raw -match 'imports:\s*\[') {
    $raw = $raw -replace 'imports:\s*\[', 'imports: [ClientsModule, '
  } else {
    Write-Host "ATENÇÃO: não achei 'imports: [' no AppModule. Ajuste manual pode ser necessário." -ForegroundColor Yellow
  }

  Set-Content -Path $appModulePath -Value $raw -Encoding UTF8
  Write-Host "OK: ClientsModule registrado no AppModule. Backup: $bak" -ForegroundColor Green
}

function Api-CheckRoute {
  param([string]$url)

  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
    return $true
  } catch {
    return $false
  }
}

Write-Host "=== MAG Audit & Fix ===" -ForegroundColor Cyan
Write-Host "Repo: $repo" -ForegroundColor DarkGray

# 0) Fecha portas comuns e limpa lock/caches do Next (profissional: estado limpo)
Kill-Port 3000
Kill-Port 3001
Kill-Port 3002

$webDir = Join-Path $repo "apps\web"
Remove-NextLockAndCache -webDir $webDir

# 1) Fix front-end clients.ts (regExp literal + template literal)
$clientsTs = Join-Path $repo "apps\web\src\lib\api\clients.ts"
Fix-ClientsTs -clientsTs $clientsTs

# 2) Garante env do web apontando API
$envLocal = Join-Path $repo "apps\web\.env.local"
Ensure-WebEnv -envLocal $envLocal

# 3) Garante AppModule importando ClientsModule (se existir)
$appModule = Join-Path $repo "apps\api\src\app.module.ts"
Ensure-ClientsModuleImported -appModulePath $appModule

# 4) Instala / checagens (sem “gambiarras”)
Push-Location $repo
Write-Host "`n=== pnpm install (workspace) ===" -ForegroundColor Cyan
corepack pnpm -w install
Pop-Location

Write-Host "`n=== Typecheck & Lint (workspace) ===" -ForegroundColor Cyan
Push-Location $repo
corepack pnpm -w run typecheck
corepack pnpm -w run lint
Pop-Location

Write-Host "`n=== Build (workspace) ===" -ForegroundColor Cyan
Push-Location $repo
corepack pnpm -w run build
Pop-Location

Write-Host "`n=== Next steps ===" -ForegroundColor Cyan
Write-Host "1) Suba API:  corepack pnpm -C apps/api dev" -ForegroundColor Gray
Write-Host "2) Teste:    Invoke-WebRequest http://localhost:3001/health -UseBasicParsing" -ForegroundColor Gray
Write-Host "3) Teste:    Invoke-WebRequest http://localhost:3001/clients -UseBasicParsing" -ForegroundColor Gray
Write-Host "4) Suba WEB:  corepack pnpm -C apps/web dev" -ForegroundColor Gray
Write-Host "OK." -ForegroundColor Green
