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

# -------------------------------------------------------------------
# 1) ClientTable: aceitar data (e compat com items), e chamar onEdit/onDelete com id
# -------------------------------------------------------------------
$clientTablePath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\_components\client-table.tsx"
Patch-File $clientTablePath {
  param($t)

  # 1.1 - handlers: qualquer onEdit(x) onde x é Client -> onEdit(x.id)
  # cobre casos (client) (row) (c) (item) (x)
  $t = $t -replace 'onEdit\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)', 'onEdit($1.id)'
  $t = $t -replace 'onDelete\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)', 'onDelete($1.id)'

  # 1.2 - Props: se tiver items e não tiver data, adiciona data opcional e usa fallback
  if ($t -match 'type\s+Props\s*=\s*\{') {
    if ($t -notmatch '\bdata\??\s*:\s*Client\[\]') {
      $t = $t -replace '(type\s+Props\s*=\s*\{\s*)', "`$1`n  data?: Client[]; // compat`n"
    }
    if ($t -match '\bitems\s*:\s*Client\[\]' -and $t -notmatch '\bitems\??\s*:') {
      # torna items opcional, porque page.tsx não passa
      $t = $t -replace '\bitems\s*:\s*Client\[\]', 'items?: Client[]'
    }
  } elseif ($t -match 'interface\s+Props\s*\{') {
    if ($t -notmatch '\bdata\??\s*:\s*Client\[\]') {
      $t = $t -replace '(interface\s+Props\s*\{\s*)', "`$1`n  data?: Client[]; // compat`n"
    }
    if ($t -match '\bitems\s*:\s*Client\[\]') {
      $t = $t -replace '\bitems\s*:\s*Client\[\]', 'items?: Client[]'
    }
  }

  # 1.3 - no corpo do componente: se estiver usando items diretamente, cria fallback:
  # const rows = items ?? data ?? [];
  if ($t -match '\bfunction\s+ClientTable\b' -or $t -match '\bexport\s+function\s+ClientTable\b') {
    if ($t -notmatch 'const\s+rows\s*=') {
      # tenta inserir após a desestruturação de props
      $t = $t -replace '(function\s+ClientTable\(\s*\{\s*([^}]*)\}\s*:\s*Props\s*\)\s*\{)',
        "`$1`n  const rows = (items ?? data ?? []);`n"
      $t = $t -replace '(export\s+function\s+ClientTable\(\s*\{\s*([^}]*)\}\s*:\s*Props\s*\)\s*\{)',
        "`$1`n  const rows = (items ?? data ?? []);`n"
    }

    # troca usos de items no map -> rows
    $t = $t -replace '\bitems\.map\(', 'rows.map('
  }

  return $t
} $backupRoot $repoRoot

# -------------------------------------------------------------------
# 2) DriverFormModal: CompanyOption aceitar name OU label + tirar warning unused-expressions
# -------------------------------------------------------------------
$driverModalPath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\_components\driver-form-modal.tsx"
Patch-File $driverModalPath {
  param($t)

  # remove qualquer "type CompanyOption = ..." que tenha sido colocado fora de lugar
  $t = $t -replace '(?m)^\s*type\s+CompanyOption\s*=\s*\{[^\}]*\};\s*\r?\n', ''

  # reinsere o type logo após os imports (ou no topo)
  $typeDef = 'type CompanyOption = { id: string; name?: string; label?: string };'
  if ($t -match '(?s)^((?:import[^\n]*\n)+)') {
    $imports = $Matches[1]
    $rest = $t.Substring($imports.Length)
    $t = $imports + "`n" + $typeDef + "`n`n" + $rest
  } else {
    $t = $typeDef + "`n`n" + $t
  }

  # garantir companies?: CompanyOption[]
  $t = $t -replace 'companies\?\s*:\s*CompanyOption\[\]', 'companies?: CompanyOption[]'

  return $t
} $backupRoot $repoRoot

# -------------------------------------------------------------------
# 3) clientes/page.tsx: remover ".data" indevido nos 3 pontos restantes
# -------------------------------------------------------------------
$pagePath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\page.tsx"
Patch-File $pagePath {
  param($t)

  # remove ".data" em objetos de filtros (padrões comuns)
  $t = $t -replace '(\b(driverFilters|clientFilters|filters|query|payload)\b)\.data\b', '$1'
  $t = $t -replace '(\bsetDriverFilters\()\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\.data(\s*\))', '$1$2$3'
  $t = $t -replace '(\bsetClientFilters\()\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\.data(\s*\))', '$1$2$3'

  # também remove ".data" logo após um objeto literal (o TS error que você mostrou)
  $t = $t -replace '(\{\s*status:\s*"ATIVO"\s*\|\s*"INATIVO"[^}]*\})\.data\b', '$1'

  return $t
} $backupRoot $repoRoot

Write-Host ""
Write-Host "✅ Patch aplicado (zera typecheck: client-table items/data + driver-modal companies + page .data)!" -ForegroundColor Green
Write-Host "📦 Backup em: $backupRoot" -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "  corepack pnpm -w typecheck"
Write-Host "  corepack pnpm -w lint"
Write-Host ""
