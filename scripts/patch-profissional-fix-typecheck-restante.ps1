$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$path) {
  if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null }
}

function To-RelPath([string]$fullPath, [string]$root) {
  $p = [System.IO.Path]::GetFullPath($fullPath)
  $r = [System.IO.Path]::GetFullPath($root)
  if ($p.StartsWith($r)) { return $p.Substring($r.Length).TrimStart('\','/') }
  return [System.IO.Path]::GetFileName($p)
}

function Backup-IfExists([string]$filePath, [string]$backupRoot, [string]$repoRoot) {
  if (Test-Path $filePath) {
    $rel = To-RelPath $filePath $repoRoot
    $dest = Join-Path $backupRoot $rel
    $destDir = Split-Path -Parent $dest
    Ensure-Dir $destDir
    Copy-Item -Force $filePath $dest
  }
}

function Write-FileAtomic([string]$filePath, [string]$content, [string]$backupRoot, [string]$repoRoot) {
  $dir = Split-Path -Parent $filePath
  Ensure-Dir $dir
  Backup-IfExists $filePath $backupRoot $repoRoot
  $tmp = "$filePath.tmp"
  $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
  [System.IO.File]::WriteAllText($tmp, $content, $utf8NoBom)
  Move-Item -Force $tmp $filePath
}

function Patch-Text([string]$filePath, [scriptblock]$patchFn, [string]$backupRoot, [string]$repoRoot) {
  if (-not (Test-Path $filePath)) { throw "Arquivo não encontrado: $filePath" }
  Backup-IfExists $filePath $backupRoot $repoRoot
  $txt = Get-Content $filePath -Raw -Encoding UTF8
  $new = & $patchFn $txt
  if ($new -ne $txt) {
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($filePath, $new, $utf8NoBom)
  }
}

$repoRoot = (Get-Location).Path
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $repoRoot ".backups\professional-patch\$ts"
Ensure-Dir $backupRoot

# ---------------------------------------------------------------------
# 1) types/driver.ts: CNHStatus compat (valid/expiring/expired)
# ---------------------------------------------------------------------
$driverTypesPath = Join-Path $repoRoot "apps\web\src\types\driver.ts"

Patch-Text $driverTypesPath {
  param($t)

  # substitui a linha do CNHStatus por uma versão compatível
  $t = $t -replace 'export type CNHStatus = "[^"]+" \| "[^"]+" \| "[^"]+" \| "[^"]+";','export type CNHStatus = "REGULAR" | "VENCIDA" | "SUSPENSA" | "CASSADA" | "valid" | "expiring" | "expired";'
  return $t
} $backupRoot $repoRoot

# ---------------------------------------------------------------------
# 2) lib/api/clients.ts e drivers.ts: wrappers getClients/getDrivers com (filters,page,limit) e retorno {data}
# ---------------------------------------------------------------------
$clientsApiPath = Join-Path $repoRoot "apps\web\src\lib\api\clients.ts"
$driversApiPath = Join-Path $repoRoot "apps\web\src\lib\api\drivers.ts"

Patch-Text $clientsApiPath {
  param($t)

  # remove alias simples se existir e cria wrapper compat
  $t = $t -replace '(?m)^\s*export const getClients\s*=\s*listClients;\s*$',''

  if ($t -notmatch 'export async function getClients') {
    $t = $t.TrimEnd() + @"

export type PagedResult<T> = { data: T[] };

// Compat: UI antiga chama getClients(filters, page, limit) e espera .data
export async function getClients(filters?: ClientFilters, _page?: number, _limit?: number): Promise<PagedResult<Client>> {
  const data = await listClients(filters);
  return { data };
}
"@
  }

  return $t
} $backupRoot $repoRoot

Patch-Text $driversApiPath {
  param($t)

  $t = $t -replace '(?m)^\s*export const getDrivers\s*=\s*listDrivers;\s*$',''

  if ($t -notmatch 'export async function getDrivers') {
    $t = $t.TrimEnd() + @"

export type PagedResult<T> = { data: T[] };

// Compat: UI antiga chama getDrivers(filters, page, limit) e espera .data
export async function getDrivers(filters?: DriverFilters, _page?: number, _limit?: number): Promise<PagedResult<Driver>> {
  const data = await listDrivers(filters);
  return { data };
}
"@
  }

  return $t
} $backupRoot $repoRoot

# ---------------------------------------------------------------------
# 3) client-table.tsx: alinhar props para onEdit/onDelete receberem id (string)
# ---------------------------------------------------------------------
$clientTablePath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\_components\client-table.tsx"
if (Test-Path $clientTablePath) {
  Patch-Text $clientTablePath {
    param($t)

    # tenta forçar assinatura Props para id (sem reescrever layout)
    $t = $t -replace 'onEdit:\s*\(c:\s*Client\)\s*=>\s*void','onEdit: (id: string) => void'
    $t = $t -replace 'onDelete:\s*\(c:\s*Client\)\s*=>\s*void','onDelete: (id: string) => void'

    # se o código chama onEdit(row) / onDelete(row), troca para row.id
    $t = $t -replace 'onEdit\(\s*client\s*\)','onEdit(client.id)'
    $t = $t -replace 'onDelete\(\s*client\s*\)','onDelete(client.id)'
    $t = $t -replace 'onEdit\(\s*row\s*\)','onEdit(row.id)'
    $t = $t -replace 'onDelete\(\s*row\s*\)','onDelete(row.id)'

    return $t
  } $backupRoot $repoRoot
}

# ---------------------------------------------------------------------
# 4) driver-form-modal.tsx: aceitar prop companies opcional (sem obrigar uso)
# ---------------------------------------------------------------------
$driverModalPath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\_components\driver-form-modal.tsx"
if (Test-Path $driverModalPath) {
  Patch-Text $driverModalPath {
    param($t)

    # adiciona companies?: any[] na interface/Props se ainda não existir
    if ($t -match 'type Props\s*=\s*\{') {
      if ($t -notmatch 'companies\?:') {
        $t = $t -replace '(type Props\s*=\s*\{\s*)', "`$1`n  companies?: any[];`n"
      }
    } elseif ($t -match 'interface Props\s*\{') {
      if ($t -notmatch 'companies\?:') {
        $t = $t -replace '(interface Props\s*\{\s*)', "`$1`n  companies?: any[];`n"
      }
    }

    return $t
  } $backupRoot $repoRoot
}

Write-Host ""
Write-Host "✅ Patch aplicado (restante do typecheck: CNHStatus + wrappers getClients/getDrivers + props)!" -ForegroundColor Green
Write-Host "📦 Backup em: $backupRoot" -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "  corepack pnpm -w typecheck"
Write-Host "  corepack pnpm -w lint"
Write-Host ""
