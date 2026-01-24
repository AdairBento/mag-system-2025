param(
  [string]$Root = (Get-Location).Path,
  [int]$MaxFileMB = 2,
  [int]$ProgressEvery = 20
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$report = Join-Path $Root "MAG_AUDIT_FAST_REPORT.txt"
Remove-Item $report -ErrorAction SilentlyContinue | Out-Null

function Log($s) { $s | Out-File -FilePath $report -Append -Encoding UTF8 }
function Say($s) { Write-Host $s; Log $s }

Say "🔥 MAG FAST AUDIT - $Root"
Say "📝 Relatório: $report"
Say "📏 Limite: $MaxFileMB MB por arquivo"
Say ""

# Pastas foco
$scanDirs = @(
  (Join-Path $Root "apps"),
  (Join-Path $Root "packages"),
  (Join-Path $Root "scripts")
) | Where-Object { Test-Path $_ }

if ($scanDirs.Count -eq 0) {
  throw "Não achei apps/packages/scripts dentro de $Root"
}

$files = foreach ($d in $scanDirs) {
  Get-ChildItem $d -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx |
    Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.next\\|\\dist\\|\\build\\|\\coverage\\|\\\.turbo\\|\\\.git\\' }
}

$files = $files | Sort-Object FullName -Unique
Say ("📦 Arquivos alvo: {0}" -f $files.Count)
Say ""

function Read-Safe([string]$p) {
  try {
    $fi = Get-Item -LiteralPath $p -ErrorAction Stop
    if (($fi.Length / 1MB) -gt $MaxFileMB) { return $null }
    return Get-Content -LiteralPath $p -Raw -ErrorAction Stop
  } catch { return $null }
}

# Checks (rápidos)
$checks = @(
  @{ Name="DOUBLE_SLASH_CLIENTS"; Pattern='//clients' },

  # CNH default "AB"
  @{ Name="CNH_AB_DEFAULT"; Pattern='return\s+["'']AB["'']' },

  # DTO em PT (errado)
  @{ Name="BAD_DTO_PT"; Pattern='\bdto\.(razaoSocial|inscricaoEstadual|cnhNumero|cnhCategoria|cnhValidade|cep|logradouro|bairro|cidade|estado)\b' },

  # Campo phone "solto" (inconsistência)
  @{ Name="PHONE_FIELD"; Pattern='\bphone\b' },

  # Reset de form típico
  @{ Name="FORM_RESET_EMPTY"; Pattern='setForm\(\s*emptyForm\s*\)|setForm\(emptyForm\)' },

  # Forçar PF ao abrir modal
  @{ Name="SET_PF_FORCE"; Pattern='setClientType\(\s*["'']PF["'']\s*\)' }
)

$hits = @()
$i = 0

foreach ($f in $files) {
  $i++

  if ($i % $ProgressEvery -eq 0) {
    Write-Host ("... {0}/{1}  {2}" -f $i, $files.Count, $f.Name)
  }

  $txt = Read-Safe $f.FullName
  if (-not $txt) { continue }

  foreach ($c in $checks) {
    $name = $c["Name"]
    $pat  = $c["Pattern"]

    if ($txt -notmatch $pat) { continue }

    # Captura até 10 linhas por arquivo/check
    $lines = Select-String -Path $f.FullName -Pattern $pat -AllMatches -ErrorAction SilentlyContinue | Select-Object -First 10
    foreach ($ln in $lines) {
      $hits += [pscustomobject]@{
        Check = $name
        File  = $f.FullName.Replace($Root, ".")
        Line  = $ln.LineNumber
        Text  = ($ln.Line.Trim())
      }
    }
  }
}

Say ""
Say "🧾 RESULTADOS (top 250 linhas)"
if (-not $hits -or $hits.Count -eq 0) {
  Say "✅ Nada encontrado nesses checks (ou arquivos > limite foram ignorados)."
  Say "✅ Concluído."
  exit 0
}

$hits = $hits | Sort-Object Check, File, Line
$hits | Select-Object -First 250 | ForEach-Object {
  Say ("[{0}] {1}:{2}  {3}" -f $_.Check, $_.File, $_.Line, $_.Text)
}

Say ""
Say ("📌 Total de ocorrências capturadas: {0}" -f $hits.Count)
Say "✅ Concluído."
