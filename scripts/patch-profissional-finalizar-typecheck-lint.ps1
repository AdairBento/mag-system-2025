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

function Patch-File([string]$filePath, [scriptblock]$patchFn, [string]$backupRoot, [string]$repoRoot) {
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

# ------------------------------------------------------------
# 1) client-table.tsx: garantir Props com data/loading + chamar onEdit/onDelete com id
# ------------------------------------------------------------
$clientTablePath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\_components\client-table.tsx"

Patch-File $clientTablePath {
  param($t)

  # 1.1) troca chamadas onEdit(client) / onDelete(client) => id
  $t = $t -replace 'onEdit\(\s*client\s*\)', 'onEdit(client.id)'
  $t = $t -replace 'onDelete\(\s*client\s*\)', 'onDelete(client.id)'
  $t = $t -replace 'onEdit\(\s*row\s*\)', 'onEdit(row.id)'
  $t = $t -replace 'onDelete\(\s*row\s*\)', 'onDelete(row.id)'

  # 1.2) garantir interface/type Props tenha data/loading
  # tenta detectar "type Props = { ... }" ou "interface Props { ... }"
  if ($t -match 'type\s+Props\s*=\s*\{') {
    if ($t -notmatch '\bdata\s*:\s*Client\[\]') {
      $t = $t -replace '(type\s+Props\s*=\s*\{\s*)', "`$1`n  data: Client[];`n"
    }
    if ($t -notmatch '\bloading\s*:\s*boolean') {
      $t = $t -replace '(type\s+Props\s*=\s*\{\s*)', "`$1`n  loading: boolean;`n"
    }
    # garantir onEdit/onDelete id
    $t = $t -replace 'onEdit:\s*\(c:\s*Client\)\s*=>\s*void', 'onEdit: (id: string) => void'
    $t = $t -replace 'onDelete:\s*\(c:\s*Client\)\s*=>\s*void', 'onDelete: (id: string) => void'
  }
  elseif ($t -match 'interface\s+Props\s*\{') {
    if ($t -notmatch '\bdata\s*:\s*Client\[\]') {
      $t = $t -replace '(interface\s+Props\s*\{\s*)', "`$1`n  data: Client[];`n"
    }
    if ($t -notmatch '\bloading\s*:\s*boolean') {
      $t = $t -replace '(interface\s+Props\s*\{\s*)', "`$1`n  loading: boolean;`n"
    }
    $t = $t -replace 'onEdit:\s*\(c:\s*Client\)\s*=>\s*void', 'onEdit: (id: string) => void'
    $t = $t -replace 'onDelete:\s*\(c:\s*Client\)\s*=>\s*void', 'onDelete: (id: string) => void'
  }

  return $t
} $backupRoot $repoRoot

# ------------------------------------------------------------
# 2) clientes/page.tsx: remover ".data" onde não é retorno (3 ocorrências que estão quebrando)
# ------------------------------------------------------------
$pagePath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\page.tsx"

Patch-File $pagePath {
  param($t)

  # remove ".data" nesses acessos específicos: algo.data (onde algo é um objeto de filtros)
  # como não temos o identificador, fazemos um patch seguro: troca "{ status: ... }.data" não existe,
  # e o erro mostra exatamente "Property 'data' does not exist on type '{ status: ... }'"
  # então removemos ".data" quando for "status: ..." e "clientId: ..."

  $t = $t -replace '(\{\s*status:\s*"ATIVO"\s*\|\s*"INATIVO"[^}]*\})\.data', '$1'
  $t = $t -replace '(\{\s*status:\s*"ATIVO"\s*\|\s*"INATIVO"[^}]*\})\s*\.data', '$1'

  return $t
} $backupRoot $repoRoot

# ------------------------------------------------------------
# 3) driver-form-modal.tsx: trocar any por tipo seguro para lint
# ------------------------------------------------------------
$driverModalPath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\_components\driver-form-modal.tsx"

Patch-File $driverModalPath {
  param($t)

  # adiciona type CompanyOption se não existir
  if ($t -notmatch 'type\s+CompanyOption\s*=') {
    # coloca perto do topo do arquivo (depois dos imports)
    if ($t -match '(?s)^((?:import[^\n]*\n)+)') {
      $imports = $Matches[1]
      $rest = $t.Substring($imports.Length)
      $t = $imports + "`n" + 'type CompanyOption = { id: string; name: string };' + "`n`n" + $rest
    } else {
      $t = 'type CompanyOption = { id: string; name: string };' + "`n`n" + $t
    }
  }

  # troca companies?: any[] -> companies?: CompanyOption[]
  $t = $t -replace 'companies\?\s*:\s*any\[\]', 'companies?: CompanyOption[]'

  return $t
} $backupRoot $repoRoot

# ------------------------------------------------------------
# 4) lib/api clients/drivers: remover warning unused-vars em page/limit
# ------------------------------------------------------------
$clientsApiPath = Join-Path $repoRoot "apps\web\src\lib\api\clients.ts"
$driversApiPath = Join-Path $repoRoot "apps\web\src\lib\api\drivers.ts"

Patch-File $clientsApiPath {
  param($t)
  $t = $t -replace 'getClients\(filters\?: ClientFilters, _page\?: number, _limit\?: number\)', 'getClients(filters?: ClientFilters, page?: number, limit?: number)'
  if ($t -match 'export async function getClients\(' -and $t -notmatch 'void page;') {
    $t = $t -replace '(export async function getClients\([^\)]*\)\s*:\s*Promise<PagedResult<Client>>\s*\{\s*)', "`$1`n  void page; void limit;`n"
  }
  return $t
} $backupRoot $repoRoot

Patch-File $driversApiPath {
  param($t)
  $t = $t -replace 'getDrivers\(filters\?: DriverFilters, _page\?: number, _limit\?: number\)', 'getDrivers(filters?: DriverFilters, page?: number, limit?: number)'
  if ($t -match 'export async function getDrivers\(' -and $t -notmatch 'void page;') {
    $t = $t -replace '(export async function getDrivers\([^\)]*\)\s*:\s*Promise<PagedResult<Driver>>\s*\{\s*)', "`$1`n  void page; void limit;`n"
  }
  return $t
} $backupRoot $repoRoot

Write-Host ""
Write-Host "✅ Patch aplicado (client-table props + page.tsx .data + driver-modal any + unused-vars)!" -ForegroundColor Green
Write-Host "📦 Backup em: $backupRoot" -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "  corepack pnpm -w typecheck"
Write-Host "  corepack pnpm -w lint"
Write-Host ""
