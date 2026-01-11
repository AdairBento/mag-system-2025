# scripts/patch-api-add-health-endpoint.ps1
# Adds NestJS /health endpoint (HealthController + HealthModule) and wires it into AppModule
# Safe: creates backups + idempotent checks.

$ErrorActionPreference = "Stop"

function Ensure-Dir {
  param([Parameter(Mandatory=$true)][string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Write-FileUtf8NoBom {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Content
  )
  $dir = Split-Path -Parent $Path
  Ensure-Dir $dir
  # Write UTF8 without BOM
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Backup-File {
  param([Parameter(Mandatory=$true)][string]$Path)
  if (Test-Path -LiteralPath $Path) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $bak = "$Path.bak.$stamp"
    Copy-Item -LiteralPath $Path -Destination $bak -Force
    return $bak
  }
  return $null
}

$root = (Resolve-Path ".").Path

$healthDir = Join-Path $root "apps/api/src/health"
$healthController = Join-Path $healthDir "health.controller.ts"
$healthModule = Join-Path $healthDir "health.module.ts"
$appModule = Join-Path $root "apps/api/src/app.module.ts"

if (-not (Test-Path -LiteralPath $appModule)) {
  throw "Não encontrei: $appModule"
}

# 1) Create health controller
if (-not (Test-Path -LiteralPath $healthController)) {
  Write-FileUtf8NoBom -Path $healthController -Content @'
import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  getHealth() {
    return { ok: true, status: "up", ts: new Date().toISOString() };
  }
}
'@
  Write-Host "✅ Criado:" $healthController
} else {
  Write-Host "ℹ️ Já existe (skip):" $healthController
}

# 2) Create health module
if (-not (Test-Path -LiteralPath $healthModule)) {
  Write-FileUtf8NoBom -Path $healthModule -Content @'
import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
'@
  Write-Host "✅ Criado:" $healthModule
} else {
  Write-Host "ℹ️ Já existe (skip):" $healthModule
}

# 3) Patch AppModule to import HealthModule
$orig = Get-Content -LiteralPath $appModule -Raw -Encoding UTF8

if ($orig -match "HealthModule") {
  Write-Host "ℹ️ app.module.ts já referencia HealthModule (skip patch)."
} else {
  $bak = Backup-File -Path $appModule
  if ($bak) { Write-Host "🧷 Backup:" $bak }

  $patched = $orig

  # Add import line near other imports (prefer after ClientsModule if present)
  if ($patched -match "import\s+\{\s*ClientsModule\s*\}\s+from\s+['""]\.\/clients\/clients\.module['""];") {
    $patched = $patched -replace `
      "import\s+\{\s*ClientsModule\s*\}\s+from\s+['""]\.\/clients\/clients\.module['""];\s*", `
      "`$0`nimport { HealthModule } from `"`./health/health.module`";`n"
  } else {
    # Otherwise insert after first import block
    $patched = $patched -replace `
      "(?m)^(import\s+\{[^}]+\}\s+from\s+['""][^'""]+['""];\s*)", `
      "`$1`nimport { HealthModule } from `"`./health/health.module`";`n"
  }

  # Add HealthModule to @Module imports: [...]
  if ($patched -match "imports\s*:\s*\[") {
    # Insert at end of imports array or after ClientsModule
    if ($patched -match "imports\s*:\s*\[[^\]]*ClientsModule") {
      $patched = $patched -replace `
        "(imports\s*:\s*\[[^\]]*ClientsModule)(\s*,?)", `
        "`$1, HealthModule"
    } else {
      $patched = $patched -replace `
        "(imports\s*:\s*\[)", `
        "`$1HealthModule, "
    }
  } else {
    throw "Não encontrei 'imports: [' dentro do @Module no app.module.ts. Patch manual necessário."
  }

  # Normalize accidental double commas like ", ," just in case
  $patched = $patched -replace ",\s*,", ", "

  Set-Content -LiteralPath $appModule -Value $patched -Encoding UTF8 -NoNewline
  Write-Host "✅ Patch aplicado em:" $appModule
}

Write-Host ""
Write-Host "➡️ Teste agora:"
Write-Host "   curl http://localhost:3001/health"
Write-Host "   irm  http://localhost:3001/health"
Write-Host ""
Write-Host "✅ Se o 'pnpm dev' estiver rodando, o Nest recompila sozinho."
