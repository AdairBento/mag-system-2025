param(
  [string]$Path = (Get-Location).Path,
  [switch]$FixUrls,
  [switch]$NoColor,
  [int]$MaxFileMB = 5
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$reportPath = Join-Path $Path "MAG_AUDIT_REPORT.txt"

function Out-Log($msg) {
  $msg | Out-File -FilePath $reportPath -Append -Encoding UTF8
}

function Write-Info($msg)  { if ($NoColor) { Write-Host $msg } else { Write-Host $msg -ForegroundColor Cyan } ; Out-Log $msg }
function Write-Warn($msg)  { if ($NoColor) { Write-Host $msg } else { Write-Host $msg -ForegroundColor Yellow } ; Out-Log $msg }
function Write-Bad($msg)   { if ($NoColor) { Write-Host $msg } else { Write-Host $msg -ForegroundColor Red } ; Out-Log $msg }
function Write-Good($msg)  { if ($NoColor) { Write-Host $msg } else { Write-Host $msg -ForegroundColor Green } ; Out-Log $msg }

function Get-Files([string]$root) {
  $include = @("*.ts","*.tsx","*.js","*.jsx","*.prisma")
  $excludeDirs = @(
    "\node_modules\",
    "\.next\",
    "\dist\",
    "\build\",
    "\coverage\",
    "\.turbo\",
    "\.git\"
  )

  Get-ChildItem -Path $root -Recurse -File -Include $include | Where-Object {
    $p = $_.FullName
    foreach ($ex in $excludeDirs) { if ($p -like "*$ex*") { return $false } }
    return $true
  }
}

function Safe-ReadFileRaw($filePath, [int]$maxMB) {
  $fi = Get-Item -LiteralPath $filePath -ErrorAction SilentlyContinue
  if (-not $fi) { return $null }

  $sizeMB = [math]::Round(($fi.Length / 1MB), 2)
  if ($sizeMB -gt $maxMB) {
    return $null
  }
  try {
    return Get-Content -LiteralPath $filePath -Raw -ErrorAction Stop
  } catch {
    return $null
  }
}

function Find-Patterns($files, $patterns, $title, [int]$maxMB) {
  $hits = @()
  $total = $files.Count
  $i = 0

  foreach ($f in $files) {
    $i++
    if ($i % 50 -eq 0 -or $i -eq 1 -or $i -eq $total) {
      Write-Progress -Activity "Auditoria MAG" -Status "Lendo arquivos ($i/$total)" -PercentComplete ([int](($i/$total)*100))
    }

    $content = Safe-ReadFileRaw $f.FullName $maxMB
    if (-not $content) { continue }

    foreach ($pat in $patterns) {
      $m = [regex]::Matches($content, $pat, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
      if ($m.Count -gt 0) {
        foreach ($mm in $m) {
          $pre = $content.Substring(0, $mm.Index)
          $line = ($pre -split "`n").Count

          $hits += [pscustomobject]@{
            Title   = $title
            File    = $f.FullName.Replace($Path, ".")
            Line    = $line
            Match   = $mm.Value.Trim()
          }
        }
      }
    }
  }

  Write-Progress -Activity "Auditoria MAG" -Completed
  return $hits
}

function Print-Group($hits, $header) {
  if (-not $hits -or $hits.Count -eq 0) {
    Write-Good ("✅ {0}: nenhum achado" -f $header)
    return
  }

  Write-Bad ("❌ {0}: {1} ocorrência(s)" -f $header, $hits.Count)
  $hits | Sort-Object File, Line | Format-Table -AutoSize | Out-String | ForEach-Object { $_.TrimEnd() } | ForEach-Object { Write-Host $_; Out-Log $_ }
  ""
}

function Fix-DoubleSlashClients($files, [int]$maxMB) {
  $changed = 0
  foreach ($f in $files) {
    $content = Safe-ReadFileRaw $f.FullName $maxMB
    if (-not $content) { continue }
    $new = $content -replace '(?<!:)/{2,}clients', '/clients'
    if ($new -ne $content) {
      Set-Content -LiteralPath $f.FullName -Value $new -Encoding UTF8
      $changed++
      Write-Warn ("🩹 Fix aplicado: {0}" -f $f.FullName.Replace($Path, "."))
    }
  }
  Write-Good ("✅ FixUrls: arquivos alterados = {0}" -f $changed)
}

# -------------------- MAIN --------------------
Remove-Item -LiteralPath $reportPath -ErrorAction SilentlyContinue | Out-Null

Write-Info ("`n🔥 MAG AUDIT (repo scan) - {0}" -f $Path)
Write-Info ("📝 Relatório: {0}`n" -f $reportPath)

if (-not (Test-Path $Path)) { throw ("Path inválido: {0}" -f $Path) }

$files = Get-Files $Path
Write-Info ("📦 Arquivos analisados: {0} (limite {1}MB por arquivo)`n" -f $files.Count, $MaxFileMB)

$ptFields = @('\brazaoSocial\b','\binscricaoEstadual\b','\bcnhNumero\b','\bcnhCategoria\b','\bcnhValidade\b','\bcep\b','\blogradouro\b','\bbairro\b','\bcidade\b','\bestado\b','\bnumero\b','\bcomplemento\b')
$phoneFields = @('\bphone\b','\bcellphone\b','\btelephone\b')
$cnhDefault = @('autoDetectCnhCategory[\s\S]{0,300}return\s+["'']AB["'']','return\s+["'']AB["'']\s*;')
$modalReset = @('useEffect\([\s\S]{0,600}if\s*\(\s*!isOpen\s*\)[\s\S]{0,300}return\s*;[\s\S]{0,900}else\s*\{[\s\S]{0,900}setForm\(\s*emptyForm\s*\)','useEffect\([\s\S]{0,900}if\s*\(\s*initialData\s*\)[\s\S]{0,600}else[\s\S]{0,400}setForm\(','setClientType\(\s*["'']PF["'']\s*\)[\s\S]{0,400}setForm\(')
$doubleSlash = @('/{2,}clients')
$badMappings = @('\bdto\.\s*razaoSocial\s*=','\bdto\.\s*inscricaoEstadual\s*=','\bdto\.\s*cnhNumero\s*=','\bdto\.\s*cep\s*=','\bdto\.\s*logradouro\s*=')

$hits_slash  = Find-Patterns $files $doubleSlash "DOUBLE_SLASH_CLIENTS" $MaxFileMB
$hits_cnh    = Find-Patterns $files $cnhDefault  "CNH_AB_DEFAULT" $MaxFileMB
$hits_badmap = Find-Patterns $files $badMappings "BAD_DTO_MAPPING" $MaxFileMB
$hits_modal  = Find-Patterns $files $modalReset  "MODAL_RESET_HEURISTIC" $MaxFileMB
$hits_phone  = Find-Patterns $files $phoneFields "PHONE_FIELDS" $MaxFileMB
$hits_pt     = Find-Patterns $files $ptFields    "PT_FIELDS" $MaxFileMB

Write-Info "`n🧾 RELATÓRIO"
Print-Group $hits_slash  "URLs com //clients"
Print-Group $hits_cnh    "CNH categoria com fallback AB"
Print-Group $hits_badmap "Mapeamentos DTO com campos PT (dto.xxx)"
Print-Group $hits_modal  "Heurística: modal resetando form indevidamente"
Print-Group $hits_phone  "Campos phone/cellphone/telephone encontrados"
Print-Group $hits_pt     "Campos em PT encontrados (possível bug em payload/mapeamento)"

if ($FixUrls) {
  Write-Warn "`n🩹 FixUrls ativado: corrigindo //clients -> /clients...`n"
  Fix-DoubleSlashClients $files $MaxFileMB
}

$sw.Stop()
Write-Good ("`n✅ Auditoria concluída em {0}s" -f [math]::Round($sw.Elapsed.TotalSeconds,2))
Write-Info ("📄 Abra o relatório: {0}" -f $reportPath)
