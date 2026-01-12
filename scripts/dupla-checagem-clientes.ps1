# scripts/dupla-checagem-clientes.ps1
# Dupla checagem (Clientes/Motoristas) - segura e repetível.
# Gera log e não altera nada do projeto.

$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Write-Section([string]$Title) {
  $line = ("=" * 80)
  Write-Host ""
  Write-Host $line
  Write-Host $Title
  Write-Host $line
}

$root = (Resolve-Path ".").Path
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"

$logDir = Join-Path $root ".backups\checks"
Ensure-Dir $logDir
$logFile = Join-Path $logDir "dupla-checagem-clientes-$stamp.log"

# start transcript (best-effort)
try { Start-Transcript -Path $logFile -Force | Out-Null } catch {}

Write-Section "DUPlA CHECAGEM — MAG-system-webapp (Clientes/Motoristas) — $stamp"
Write-Host "Repo:" $root

Write-Section "1) Git status (quick)"
git status

Write-Section "2) Checar masks.ts"
$masks = Join-Path $root "apps\web\src\utils\masks.ts"
Write-Host "masks.ts:" $masks
if (Test-Path -LiteralPath $masks) {
  Write-Host "✅ Existe"
} else {
  Write-Host "❌ NÃO existe"
}

Write-Section "3) Procurar referencias a utils/masks no apps/web/src"
# Usa ripgrep se existir; senão fallback com Select-String
$rg = Get-Command rg -ErrorAction SilentlyContinue
$searchRoot = Join-Path $root "apps\web\src"

if ($rg) {
  # procura por "utils/masks" em qualquer import
  & rg -n "utils/masks" $searchRoot -S
} else {
  Write-Host "ℹ️ rg (ripgrep) não encontrado; usando Select-String (mais lento)."
  Get-ChildItem -Path $searchRoot -Recurse -File -Include *.ts,*.tsx |
    ForEach-Object {
      Select-String -Path $_.FullName -Pattern "utils/masks" -SimpleMatch -ErrorAction SilentlyContinue
    }
}

Write-Section "4) Mostrar topo do client-form-modal.tsx (primeiras 80 linhas)"
$clientModal = Join-Path $root "apps\web\src\app\(app)\clientes\_components\client-form-modal.tsx"
Write-Host "Arquivo:" $clientModal
if (Test-Path -LiteralPath $clientModal) {
  Get-Content -LiteralPath $clientModal -TotalCount 80
} else {
  Write-Host "❌ Arquivo não encontrado."
}

Write-Section "5) Typecheck workspace"
corepack pnpm -w typecheck

Write-Section "6) Lint workspace"
corepack pnpm -w lint

Write-Section "FIM — Resultado gravado em:"
Write-Host $logFile

try { Stop-Transcript | Out-Null } catch {}
