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

$repoRoot = (Get-Location).Path
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $repoRoot ".backups\professional-patch\$ts"
Ensure-Dir $backupRoot

$pagePath = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\page.tsx"
if (-not (Test-Path $pagePath)) { throw "Arquivo não encontrado: $pagePath" }

Backup-IfExists $pagePath $backupRoot $repoRoot

$txt = Get-Content $pagePath -Raw -Encoding UTF8

# Match do bloco inteiro (pjCompanies useMemo) do jeito que o lint mostrou.
# Singleline pra pegar quebras de linha.
$pattern = '(?s)const\s+pjCompanies\s*=\s*useMemo\(\s*\(\)\s*=>\s*clients\s*\.filter\(isPJ\)\s*\.map\(\(c\)\s*=>\s*\(\{\s*id:\s*c\.id,\s*label:\s*[^}]+\}\)\)\s*,\s*\[[^\]]*\]\s*\)\s*;'

$replacement = @'
const pjCompanies = clients
  .filter(isPJ)
  .map((c) => ({
    id: c.id,
    label: c.nomeFantasia || c.razaoSocial || `PJ ${c.id.slice(0, 6)}`,
  }));
'@

if ($txt -notmatch $pattern) {
  throw "Não encontrei o bloco pjCompanies = useMemo(...) no formato esperado. (Ele ainda existe, mas está diferente)."
}

$new = [regex]::Replace($txt, $pattern, $replacement, [System.Text.RegularExpressions.RegexOptions]::Singleline)

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($pagePath, $new, $utf8NoBom)

Write-Host ""
Write-Host "✅ Patch aplicado: pjCompanies agora é cálculo direto (sem useMemo)." -ForegroundColor Green
Write-Host "📦 Backup em: $backupRoot" -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "  corepack pnpm -w lint"
Write-Host ""
