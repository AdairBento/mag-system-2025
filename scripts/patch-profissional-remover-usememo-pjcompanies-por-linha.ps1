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

$lines = Get-Content $pagePath -Encoding UTF8

# Vamos localizar o bloco do pjCompanies automaticamente (mais seguro que chutar linha):
# Remove do "const pjCompanies = useMemo(" até a linha que contém ");" final do bloco.
$start = -1
$end = -1

for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match '^\s*const\s+pjCompanies\s*=\s*useMemo\(') {
    $start = $i
    break
  }
}

if ($start -eq -1) {
  throw "Não achei o bloco: const pjCompanies = useMemo(...). Ele ainda existe? (ou mudou de nome)"
}

# acha o fim do bloco: primeira linha após start que contém ');'
for ($j = $start; $j -lt $lines.Count; $j++) {
  if ($lines[$j] -match '^\s*\)\s*;\s*$' -or $lines[$j] -match '^\s*\);\s*$') {
    $end = $j
    break
  }
}

if ($end -eq -1) {
  throw "Achei o início do useMemo, mas não achei o fechamento ');' do bloco."
}

# Agora vamos extrair o corpo do map(...) pra reaproveitar exatamente o que você já tem.
# Procuramos a primeira linha que começa com 'clients' e vamos até antes do fechamento
# e juntamos como expressão.
$exprLines = @()
for ($k = $start; $k -le $end; $k++) {
  # pula a linha do const pjCompanies = useMemo(
  if ($k -eq $start) { continue }

  # para quando chegar na deps array "[...]" ou no fechamento
  if ($lines[$k] -match '^\s*\[\s*.*\]\s*,?\s*$') { break }
  if ($lines[$k] -match '^\s*\)\s*;') { break }

  # remove a linha "() =>" se existir
  $line = $lines[$k] -replace '^\s*\(\)\s*=>\s*', ''
  $exprLines += $line
}

$expr = ($exprLines -join "`n").Trim()
if (-not $expr) {
  # fallback: expressão padrão
  $expr = "clients.filter(isPJ).map((c) => ({ id: c.id, label: c.nomeFantasia || c.razaoSocial || `PJ ${c.id.slice(0, 6)}` }))"
}

# Substitui o bloco inteiro por const direto
$newBlock = @(
  "  const pjCompanies = $expr;"
)

# Reconstroi arquivo
$before = @()
if ($start -gt 0) { $before = $lines[0..($start-1)] }
$after = @()
if ($end -lt ($lines.Count - 1)) { $after = $lin
