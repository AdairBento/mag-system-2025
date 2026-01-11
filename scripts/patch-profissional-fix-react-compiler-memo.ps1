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

  # Remove o useMemo específico de pjCompanies e substitui por cálculo direto.
  # Padrão atual (do seu lint):
  # const pjCompanies = useMemo(
  #   () => clients.filter(isPJ).map(...),
  #   [clientsList],
  # );
  #
  # Vamos substituir tudo por:
  # const pjCompanies = clients.filter(isPJ).map(...);

  $pattern = '(?s)const\s+pjCompanies\s*=\s*useMemo\(\s*\(\)\s*=>\s*(clients[^;]*?)\s*,\s*\[[^\]]*\]\s*\)\s*;'
  if ($t -match $pattern) {
    $expr = $Matches[1].Trim()
    $replacement = "const pjCompanies = $expr;"
    $t = [regex]::Replace($t, $pattern, $replacement, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  }

  return $t
} $backupRoot $repoRoot

Write-Host ""
Write-Host "✅ Patch aplicado: removido useMemo de pjCompanies (compatível com React Compiler rule)." -ForegroundColor Green
Write-Host "📦 Backup em: $backupRoot" -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "  corepack pnpm -w lint"
Write-Host ""
