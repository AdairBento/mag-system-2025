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

$pagePath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\page.tsx"

Patch-File $pagePath {
  param($t)

  # 1) garantir um array estável para usar no useMemo
  # Se já existir "const clientsList = ..." não duplica.
  if ($t -notmatch '\bconst\s+clientsList\s*=') {
    # tenta inserir logo após o lugar onde "clients" é definido (normalmente resultado de react-query)
    # fallback: insere antes do primeiro useMemo
    if ($t -match '(?s)(.*?)(const\s+filteredClients\s*=\s*useMemo\()') {
      $prefix = $Matches[1]
      $restStart = $t.Substring($prefix.Length)
      $insert = "`n  const clientsList = clients ?? [];`n"
      $t = $prefix + $insert + $restStart
    }
  }

  # 2) trocar "clients && clients.filter" por "clientsList.filter"
  $t = $t -replace 'clients\s*&&\s*clients\.filter', 'clientsList.filter'

  # 3) garantir deps do useMemo usando clientsList
  $t = $t -replace '\[\s*clients\s*\]', '[clientsList]'
  $t = $t -replace '\[\s*clients\s*,', '[clientsList,'

  return $t
} $backupRoot $repoRoot

Write-Host ""
Write-Host "✅ Patch aplicado: useMemo com dependência estável (clientsList) — deve zerar o warning." -ForegroundColor Green
Write-Host "📦 Backup em: $backupRoot" -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "  corepack pnpm -w lint"
Write-Host ""
