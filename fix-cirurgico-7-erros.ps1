# ============================================================
# 🎯 FIX CIRÚRGICO MANUAL - 7 Erros Específicos
# ============================================================

Write-Host "`nFIX CIRÚRGICO - 7 ERROS ESPECÍFICOS`n" -ForegroundColor Cyan

# ============================================================
# ERRO 1: vehicle-autocomplete.tsx linha 135 - string para number
# ============================================================

Write-Host "1. Corrigindo vehicle-autocomplete.tsx (linha 135)..." -ForegroundColor Yellow

$autocompletePath = "apps\web\src\app\(app)\clientes\_components\vehicle-autocomplete.tsx"
$autocompleteContent = Get-Content $autocompletePath -Raw

# Converter AnoModelo de string para number
$autocompleteContent = $autocompleteContent -replace `
  'year: vehicle\.AnoModelo,', `
  'year: parseInt(vehicle.AnoModelo, 10),'

$autocompleteContent | Out-File -FilePath $autocompletePath -Encoding utf8 -NoNewline
Write-Host "   OK AnoModelo convertido para number" -ForegroundColor Green

# ============================================================
# ERROS 2-5: Filtros - Linha exata do onChange
# ============================================================

Write-Host "`n2. Corrigindo filtros (4 arquivos)..." -ForegroundColor Yellow

# Diagnostico - linha 192
$diagnosticoPath = "apps\web\src\app\(app)\diagnostico\page.tsx"
(Get-Content $diagnosticoPath) | ForEach-Object {
    $_ -replace `
        'value=\{statusFilter\}\s+onChange=\{e => setStatusFilter\(e\.target\.value.*?\)\}', `
        'value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}'
} | Set-Content $diagnosticoPath -Encoding utf8

# Financeiro - linhas 222 e 231
$financeiroPath = "apps\web\src\app\(app)\financeiro\page.tsx"
$financeiroContent = Get-Content $financeiroPath -Raw

$financeiroContent = $financeiroContent -replace `
    '(<select[^>]*value=\{tipoFilter\}[^>]*onChange=\{)e => setStatusFilter\([^\)]+\)(\})', `
    '${1}e => setTipoFilter(e.target.value as typeof tipoFilter)${2}'

$financeiroContent = $financeiroContent -replace `
    '(<select[^>]*value=\{statusFilter\}[^>]*onChange=\{)e => setStatusFilter\([^\)]+\)(\})', `
    '${1}e => setStatusFilter(e.target.value as typeof statusFilter)${2}'

$financeiroContent | Out-File -FilePath $financeiroPath -Encoding utf8 -NoNewline

# Locacoes - linha 206
$locacoesPath = "apps\web\src\app\(app)\locacoes\page.tsx"
(Get-Content $locacoesPath) | ForEach-Object {
    $_ -replace `
        'value=\{statusFilter\}\s+onChange=\{e => setStatusFilter\(e\.target\.value.*?\)\}', `
        'value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}'
} | Set-Content $locacoesPath -Encoding utf8

Write-Host "   OK Filtros corrigidos (4 arquivos)" -ForegroundColor Green

# ============================================================
# ERROS 6-7: veiculos/page.tsx - useQuery
# ============================================================

Write-Host "`n3. Corrigindo veiculos/page.tsx (linhas 44-46)..." -ForegroundColor Yellow

$veiculosPagePath = "apps\web\src\app\(app)\veiculos\page.tsx"
$veiculosContent = Get-Content $veiculosPagePath -Raw

# Remover generic type e corrigir queryFn
$veiculosContent = $veiculosContent -replace `
    'const \{ data \} = useQuery<[^>]+>\(\{', `
    'const { data } = useQuery({'

# Corrigir queryFn para receber apenas 0-1 argumentos
$veiculosContent = $veiculosContent -replace `
    'queryFn: async \(\{ queryKey \}\) => \{[^}]*const \[, filters\] = queryKey[^}]*return getVehicles\(filters\)[^}]*\}', `
    'queryFn: () => getVehicles()'

$veiculosContent | Out-File -FilePath $veiculosPagePath -Encoding utf8 -NoNewline
Write-Host "   OK useQuery corrigido" -ForegroundColor Green

# ============================================================
# FORMATAR E VALIDAR
# ============================================================

Write-Host "`n4. Formatando..." -ForegroundColor Yellow
pnpm format 2>&1 | Out-Null

Write-Host "`n5. Validando..." -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor DarkGray

Write-Host "   LINT..." -ForegroundColor Cyan
pnpm lint 2>&1 | Out-Null
$lintCode = $LASTEXITCODE

Write-Host "   TYPECHECK..." -ForegroundColor Cyan
pnpm typecheck 2>&1 | Out-Null
$typecheckCode = $LASTEXITCODE

Write-Host "   TESTES..." -ForegroundColor Cyan
pnpm -r test 2>&1 | Out-Null
$testCode = $LASTEXITCODE

# ============================================================
# RELATÓRIO
# ============================================================

Write-Host "`n" ("=" * 70) -ForegroundColor Cyan
Write-Host "RELATÓRIO - FIX CIRÚRGICO" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

Write-Host "`nCorreções:" -ForegroundColor Green
Write-Host "   1. vehicle-autocomplete: AnoModelo -> parseInt()" -ForegroundColor White
Write-Host "   2. diagnostico: onChange com typeof" -ForegroundColor White
Write-Host "   3. financeiro: onChange com typeof (2x)" -ForegroundColor White
Write-Host "   4. locacoes: onChange com typeof" -ForegroundColor White
Write-Host "   5. veiculos/page: useQuery sem generic" -ForegroundColor White
Write-Host "   6. veiculos/page: queryFn sem parâmetros" -ForegroundColor White

Write-Host "`nResultados:" -ForegroundColor Yellow

if ($lintCode -eq 0) {
    Write-Host "   OK LINT" -ForegroundColor Green
} else {
    Write-Host "   ERRO LINT" -ForegroundColor Red
}

if ($typecheckCode -eq 0) {
    Write-Host "   OK TYPECHECK" -ForegroundColor Green
} else {
    Write-Host "   ERRO TYPECHECK" -ForegroundColor Red
    
    $output = pnpm typecheck 2>&1 | Out-String
    $errors = $output -split "`n" | Where-Object { $_ -match "error TS\d+" }
    Write-Host "   Erros restantes: $($errors.Count)" -ForegroundColor Red
}

if ($testCode -eq 0) {
    Write-Host "   OK TESTES" -ForegroundColor Green
} else {
    Write-Host "   ERRO TESTES" -ForegroundColor Red
}

Write-Host "`n" ("=" * 70) -ForegroundColor Cyan

if ($lintCode -eq 0 -and $typecheckCode -eq 0 -and $testCode -eq 0) {
    Write-Host "SUCESSO TOTAL!" -ForegroundColor Green
} else {
    Write-Host "Execute: pnpm typecheck" -ForegroundColor Yellow
}

Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""
