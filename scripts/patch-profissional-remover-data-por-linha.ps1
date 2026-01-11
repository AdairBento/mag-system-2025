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

# Lê preservando linhas
$lines = Get-Content $pagePath -Encoding UTF8

# Linhas do TS são 1-based. Vamos corrigir exatamente 211, 215, 220.
$targets = @(211, 215, 220)

foreach ($ln in $targets) {
  $idx = $ln - 1
  if ($idx -lt 0 -or $idx -ge $lines.Count) {
    throw "Linha $ln fora do arquivo (total: $($lines.Count))."
  }

  # Remove SOMENTE o sufixo ".data" na linha, sem mexer no resto.
  # Ex: something.data -> something
  $lines[$idx] = $lines[$idx] -replace '\.data\b', ''
}

# Salva sem BOM
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllLines($pagePath, $lines, $utf8NoBom)

Write-Host ""
Write-Host "✅ Patch aplicado: removido '.data' apenas nas linhas 211/215/220 de clientes/page.tsx" -ForegroundColor Green
Write-Host "📦 Backup em: $backupRoot" -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "  corepack pnpm -w typecheck"
Write-Host ""
