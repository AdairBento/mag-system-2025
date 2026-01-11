# scripts/patch-fix-pjcompanies-remove-usememo.ps1
# Remove "const pjCompanies = useMemo(...)" and replaces with direct computed expression.
# Robust parsing via bracket matching (no brittle regex on multiline blocks).

$ErrorActionPreference = "Stop"

function Find-MatchingIndex {
  param(
    [Parameter(Mandatory=$true)][string]$Text,
    [Parameter(Mandatory=$true)][int]$StartIndex,
    [Parameter(Mandatory=$true)][char]$OpenChar,
    [Parameter(Mandatory=$true)][char]$CloseChar
  )

  if ($StartIndex -lt 0 -or $StartIndex -ge $Text.Length) { return -1 }
  if ($Text[$StartIndex] -ne $OpenChar) { return -1 }

  $depth = 0
  $i = $StartIndex
  $inSingle = $false
  $inDouble = $false
  $inTemplate = $false
  $escape = $false

  while ($i -lt $Text.Length) {
    $ch = $Text[$i]

    if ($escape) { $escape = $false; $i++; continue }
    if ($ch -eq '\') { $escape = $true; $i++; continue }

    # Template strings can contain braces etc; ignore bracket counting inside strings.
    if (-not $inDouble -and -not $inTemplate -and $ch -eq "'" ) { $inSingle = -not $inSingle; $i++; continue }
    if (-not $inSingle -and -not $inTemplate -and $ch -eq '"' ) { $inDouble = -not $inDouble; $i++; continue }
    if (-not $inSingle -and -not $inDouble -and $ch -eq '`' ) { $inTemplate = -not $inTemplate; $i++; continue }

    if ($inSingle -or $inDouble -or $inTemplate) { $i++; continue }

    if ($ch -eq $OpenChar) { $depth++ }
    elseif ($ch -eq $CloseChar) {
      $depth--
      if ($depth -eq 0) { return $i }
    }

    $i++
  }

  return -1
}

function Skip-Whitespace {
  param([string]$Text, [int]$Index)
  while ($Index -lt $Text.Length -and [char]::IsWhiteSpace($Text[$Index])) { $Index++ }
  return $Index
}

function Find-TopLevelComma {
  param(
    [Parameter(Mandatory=$true)][string]$Text,
    [Parameter(Mandatory=$true)][int]$StartIndex,
    [Parameter(Mandatory=$true)][int]$EndIndex
  )
  # Finds the first comma at "top level" (not inside (), {}, [] or strings) between StartIndex..EndIndex
  $paren = 0; $brace = 0; $brack = 0
  $inSingle = $false; $inDouble = $false; $inTemplate = $false
  $escape = $false

  for ($i=$StartIndex; $i -le $EndIndex; $i++) {
    $ch = $Text[$i]

    if ($escape) { $escape = $false; continue }
    if ($ch -eq '\') { $escape = $true; continue }

    if (-not $inDouble -and -not $inTemplate -and $ch -eq "'" ) { $inSingle = -not $inSingle; continue }
    if (-not $inSingle -and -not $inTemplate -and $ch -eq '"' ) { $inDouble = -not $inDouble; continue }
    if (-not $inSingle -and -not $inDouble -and $ch -eq '`' ) { $inTemplate = -not $inTemplate; continue }

    if ($inSingle -or $inDouble -or $inTemplate) { continue }

    switch ($ch) {
      '(' { $paren++ }
      ')' { if ($paren -gt 0) { $paren-- } }
      '{' { $brace++ }
      '}' { if ($brace -gt 0) { $brace-- } }
      '[' { $brack++ }
      ']' { if ($brack -gt 0) { $brack-- } }
      ',' {
        if ($paren -eq 0 -and $brace -eq 0 -and $brack -eq 0) { return $i }
      }
    }
  }
  return -1
}

function Extract-ReturnedExpressionFromArrow {
  param(
    [Parameter(Mandatory=$true)][string]$FuncText
  )
  # Expect something like: "() => expr" OR "() => { return expr; }"
  $idxArrow = $FuncText.IndexOf("=>")
  if ($idxArrow -lt 0) { throw "Não achei '=>' dentro do primeiro argumento do useMemo." }

  $afterArrow = $idxArrow + 2
  $afterArrow = Skip-Whitespace -Text $FuncText -Index $afterArrow

  if ($afterArrow -ge $FuncText.Length) { throw "Arrow function vazia (após =>)." }

  if ($FuncText[$afterArrow] -eq '{') {
    $endBrace = Find-MatchingIndex -Text $FuncText -StartIndex $afterArrow -OpenChar '{' -CloseChar '}'
    if ($endBrace -lt 0) { throw "Não consegui fechar o bloco { } da arrow function." }

    $block = $FuncText.Substring($afterArrow + 1, $endBrace - $afterArrow - 1)

    # tenta achar "return"
    $m = [regex]::Match($block, "(?s)\breturn\s+(?<expr>.+?);")
    if (-not $m.Success) { throw "Arrow function em bloco não tem 'return ...;'" }

    $expr = $m.Groups["expr"].Value.Trim()
    return $expr
  } else {
    # expression body: take as-is (trim trailing spaces/line breaks)
    $expr = $FuncText.Substring($afterArrow).Trim()

    # remove trailing commas if any (safety)
    $expr = $expr.TrimEnd(',')
    return $expr
  }
}

# --- main ---
$repoRoot = (Resolve-Path ".").Path
$file = Join-Path $repoRoot "apps\web\src\app\(app)\clientes\page.tsx"

if (-not (Test-Path $file)) {
  throw "Arquivo alvo não encontrado: $file"
}

$orig = Get-Content -LiteralPath $file -Raw -Encoding UTF8

$needle = "const pjCompanies"
$idx = $orig.IndexOf($needle)
if ($idx -lt 0) { throw "Não encontrei '$needle' em $file" }

# Find '=' after const pjCompanies
$idxEq = $orig.IndexOf("=", $idx)
if ($idxEq -lt 0) { throw "Não encontrei '=' após const pjCompanies" }

# Find useMemo after '='
$idxUseMemo = $orig.IndexOf("useMemo", $idxEq)
if ($idxUseMemo -lt 0) { throw "Não encontrei 'useMemo' na declaração do pjCompanies" }

# Find '(' of useMemo
$idxOpenParen = $orig.IndexOf("(", $idxUseMemo)
if ($idxOpenParen -lt 0) { throw "Não encontrei '(' do useMemo(" }

$idxCloseParen = Find-MatchingIndex -Text $orig -StartIndex $idxOpenParen -OpenChar '(' -CloseChar ')'
if ($idxCloseParen -lt 0) { throw "Não consegui fechar o useMemo(...)" }

# Find end of statement ';' after the closing paren
$idxSemi = $orig.IndexOf(";", $idxCloseParen)
if ($idxSemi -lt 0) { throw "Não encontrei ';' após o useMemo(...)" }

# Capture full statement range
$statementStart = $idx
$statementEnd = $idxSemi

$useMemoArgs = $orig.Substring($idxOpenParen + 1, $idxCloseParen - $idxOpenParen - 1)

# First argument goes until first top-level comma
$comma = Find-TopLevelComma -Text $useMemoArgs -StartIndex 0 -EndIndex ($useMemoArgs.Length - 1)
if ($comma -lt 0) { throw "Não encontrei a vírgula top-level separando args do useMemo (função, deps)." }

$firstArg = $useMemoArgs.Substring(0, $comma).Trim()

$expr = Extract-ReturnedExpressionFromArrow -FuncText $firstArg

# Keep indentation similar to original line where const starts
# Determine indentation (spaces/tabs before 'const')
$lineStart = $orig.LastIndexOf("`n", $statementStart)
if ($lineStart -lt 0) { $lineStart = 0 } else { $lineStart++ }
$indent = ""
for ($i=$lineStart; $i -lt $orig.Length; $i++) {
  $ch = $orig[$i]
  if ($ch -eq ' ' -or $ch -eq "`t") { $indent += $ch } else { break }
}

# Build replacement
# If expression spans multiple lines, we keep it as-is, but align with indent by prefixing each line after the first.
$exprLines = $expr -split "`r?`n"
if ($exprLines.Count -gt 1) {
  for ($i=1; $i -lt $exprLines.Count; $i++) {
    $exprLines[$i] = ($indent + "  " + $exprLines[$i].TrimStart())
  }
  $expr = ($exprLines -join "`n")
}

$replacement = @"
const pjCompanies = $expr;
"@

# If you want indent:
$replacement = ($replacement -split "`r?`n" | ForEach-Object {
  if ($_ -ne "") { $indent + $_ } else { $_ }
}) -join "`n"

# Apply patch
$before = $orig.Substring(0, $statementStart)
$after = $orig.Substring($statementEnd + 1)

$patched = $before + $replacement + $after

# Backup
$backup = $file + ".bak." + (Get-Date -Format "yyyyMMdd-HHmmss")
Copy-Item -LiteralPath $file -Destination $backup -Force

# Write back
Set-Content -LiteralPath $file -Value $patched -Encoding UTF8 -NoNewline

Write-Host "✅ Patch aplicado em:" $file
Write-Host "🧷 Backup criado em:" $backup
Write-Host "➡️ Agora rode: corepack pnpm -w lint"
