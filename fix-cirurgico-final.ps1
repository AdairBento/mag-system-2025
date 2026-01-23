# ============================================================
# 🔥 FIX CIRÚRGICO FINAL - 22 Erros Restantes
# ============================================================

Write-Host "`nFIX CIRÚRGICO FINAL - 22 ERROS`n" -ForegroundColor Cyan

# ============================================================
# 1. ADICIONAR TIPOS FALTANTES EM types/vehicle.ts
# ============================================================

Write-Host "1. Adicionando tipos faltantes em types/vehicle.ts..." -ForegroundColor Yellow

$vehicleTypesPath = "apps\web\src\types\vehicle.ts"
$vehicleTypesContent = @'
export type VehicleStatus = 'disponivel' | 'alugado' | 'manutencao' | 'inativo'

export interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color?: string
  mileage?: number
  renavam?: string
  chassis?: string
  status: VehicleStatus
  dailyRate?: number
  weeklyRate?: number
  monthlyRate?: number
  clienteId?: string
  createdAt: string
  updatedAt: string
}

export interface VehicleFilters {
  status?: string
  plate?: string
  brand?: string
  model?: string
}

export interface VehicleFormData {
  plate: string
  brand: string
  model: string
  year: number
  color?: string
  mileage?: number
  renavam?: string
  chassis?: string
  status: VehicleStatus
  dailyRate?: number
  weeklyRate?: number
  monthlyRate?: number
}

export type VehicleType = 'carros' | 'motos' | 'caminhoes'

export interface VehicleDetails {
  marca: string
  modelo: string
  ano: string
  combustivel: string
  codigoFipe: string
  valor: string
}
'@

$vehicleTypesContent | Out-File -FilePath $vehicleTypesPath -Encoding utf8 -NoNewline
Write-Host "   OK Tipos adicionados" -ForegroundColor Green

# ============================================================
# 2. CORRIGIR FILTROS - USAR onChange CORRETO
# ============================================================

Write-Host "`n2. Corrigindo filtros (onChange)..." -ForegroundColor Yellow

# Diagnostico
$diagnosticoPath = "apps\web\src\app\(app)\diagnostico\page.tsx"
$diagnosticoContent = Get-Content $diagnosticoPath -Raw
$diagnosticoContent = $diagnosticoContent -replace `
  'onChange=\{e => setStatusFilter\([^\)]+\)\}', `
  'onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}'
$diagnosticoContent | Out-File -FilePath $diagnosticoPath -Encoding utf8 -NoNewline

# Financeiro
$financeiroPath = "apps\web\src\app\(app)\financeiro\page.tsx"
$financeiroContent = Get-Content $financeiroPath -Raw
$financeiroContent = $financeiroContent -replace `
  'onChange=\{e => setTipoFilter\([^\)]+\)\}', `
  'onChange={e => setTipoFilter(e.target.value as typeof tipoFilter)}'
$financeiroContent = $financeiroContent -replace `
  'onChange=\{e => setStatusFilter\([^\)]+\)\}', `
  'onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}'
$financeiroContent | Out-File -FilePath $financeiroPath -Encoding utf8 -NoNewline

# Locacoes
$locacoesPath = "apps\web\src\app\(app)\locacoes\page.tsx"
$locacoesContent = Get-Content $locacoesPath -Raw
$locacoesContent = $locacoesContent -replace `
  'onChange=\{e => setStatusFilter\([^\)]+\)\}', `
  'onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}'
$locacoesContent | Out-File -FilePath $locacoesPath -Encoding utf8 -NoNewline

Write-Host "   OK Filtros corrigidos" -ForegroundColor Green

# ============================================================
# 3. CORRIGIR veiculos/page.tsx
# ============================================================

Write-Host "`n3. Corrigindo veiculos/page.tsx..." -ForegroundColor Yellow

$veiculosPagePath = "apps\web\src\app\(app)\veiculos\page.tsx"
$veiculosContent = Get-Content $veiculosPagePath -Raw

# Corrigir useQuery
$veiculosContent = $veiculosContent -replace `
  'const \{ data \} = useQuery<VehicleListResponse[^>]*>\(\{', `
  'const { data } = useQuery({'

# Corrigir queryFn
$veiculosContent = $veiculosContent -replace `
  'queryFn: async \(\) => getVehicles\([^\)]*\),', `
  'queryFn: () => getVehicles(),'

# Corrigir comparações de status (uppercase para lowercase)
$veiculosContent = $veiculosContent -replace `
  "status === 'DISPONIVEL'", `
  "status === 'disponivel'"

$veiculosContent = $veiculosContent -replace `
  "status === 'LOCADO'", `
  "status === 'alugado'"

$veiculosContent = $veiculosContent -replace `
  "status === 'MANUTENCAO'", `
  "status === 'manutencao'"

$veiculosContent | Out-File -FilePath $veiculosPagePath -Encoding utf8 -NoNewline
Write-Host "   OK veiculos/page.tsx corrigido" -ForegroundColor Green

# ============================================================
# 4. CORRIGIR vehicle-form-modal.tsx
# ============================================================

Write-Host "`n4. Corrigindo vehicle-form-modal.tsx..." -ForegroundColor Yellow

$modalPath = "apps\web\src\app\(app)\veiculos\_components\vehicle-form-modal.tsx"
$modalContent = Get-Content $modalPath -Raw

# Adicionar tipo explícito aos callbacks
$modalContent = $modalContent -replace `
  'setFormData\(prev =>', `
  'setFormData((prev: VehicleFormData) =>'

$modalContent | Out-File -FilePath $modalPath -Encoding utf8 -NoNewline
Write-Host "   OK vehicle-form-modal.tsx corrigido" -ForegroundColor Green

# ============================================================
# 5. CORRIGIR lib/fipe.ts
# ============================================================

Write-Host "`n5. Corrigindo lib/fipe.ts..." -ForegroundColor Yellow

$fipePath = "apps\web\src\lib\fipe.ts"
$fipeContent = Get-Content $fipePath -Raw

# Corrigir indexação do objeto
$fipeContent = $fipeContent -replace `
  'const vehicleTypeUrl = typeUrls\[vehicleType\]', `
  'const typeUrls: Record<VehicleType, string> = {\n  carros: ''carros'',\n  motos: ''motos'',\n  caminhoes: ''caminhoes''\n}\nconst vehicleTypeUrl = typeUrls[vehicleType]'

$fipeContent | Out-File -FilePath $fipePath -Encoding utf8 -NoNewline
Write-Host "   OK lib/fipe.ts corrigido" -ForegroundColor Green

# ============================================================
# 6. FORÇAR JEST TYPES NO TSCONFIG
# ============================================================

Write-Host "`n6. Forçando Jest types no tsconfig..." -ForegroundColor Yellow

$tsconfigPath = "apps\web\tsconfig.json"
$tsconfig = Get-Content $tsconfigPath -Raw | ConvertFrom-Json

# Garantir que types existe
if (-not $tsconfig.compilerOptions.PSObject.Properties['types']) {
    $tsconfig.compilerOptions | Add-Member -NotePropertyName types -NotePropertyValue @("jest", "@testing-library/jest-dom")
} else {
    $tsconfig.compilerOptions.types = @("jest", "@testing-library/jest-dom")
}

$tsconfig | ConvertTo-Json -Depth 10 | Out-File $tsconfigPath -Encoding utf8
Write-Host "   OK Jest types forçados" -ForegroundColor Green

# ============================================================
# 7. FORMATAR E VALIDAR
# ============================================================

Write-Host "`n7. Formatando..." -ForegroundColor Yellow
pnpm format 2>&1 | Out-Null

Write-Host "`n8. Validando..." -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor DarkGray

$lintResult = pnpm lint 2>&1
$lintCode = $LASTEXITCODE

$typecheckResult = pnpm typecheck 2>&1
$typecheckCode = $LASTEXITCODE

$testResult = pnpm -r test 2>&1
$testCode = $LASTEXITCODE

# ============================================================
# RELATÓRIO
# ============================================================

Write-Host "`n" ("=" * 70) -ForegroundColor Cyan
Write-Host "RELATÓRIO FINAL" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

Write-Host "`nCorreções:" -ForegroundColor Green
Write-Host "   1. VehicleFormData, VehicleType, VehicleDetails adicionados" -ForegroundColor White
Write-Host "   2. Filtros com typeof corretos" -ForegroundColor White
Write-Host "   3. useQuery corrigido" -ForegroundColor White
Write-Host "   4. Status comparisons lowercase" -ForegroundColor White
Write-Host "   5. FIPE typeUrls com Record" -ForegroundColor White
Write-Host "   6. Jest types forçados" -ForegroundColor White

Write-Host "`nResultados:" -ForegroundColor Yellow

$allPass = $true

if ($lintCode -eq 0) {
    Write-Host "   OK LINT" -ForegroundColor Green
} else {
    Write-Host "   ERRO LINT" -ForegroundColor Red
    $allPass = $false
}

if ($typecheckCode -eq 0) {
    Write-Host "   OK TYPECHECK" -ForegroundColor Green
} else {
    Write-Host "   ERRO TYPECHECK ($typecheckCode erros)" -ForegroundColor Red
    $allPass = $false
}

if ($testCode -eq 0) {
    Write-Host "   OK TESTES" -ForegroundColor Green
} else {
    Write-Host "   ERRO TESTES" -ForegroundColor Red
    $allPass = $false
}

Write-Host "`n" ("=" * 70) -ForegroundColor Cyan

if ($allPass) {
    Write-Host "SUCESSO TOTAL - PRODUCTION READY!" -ForegroundColor Green
} else {
    Write-Host "Execute: pnpm typecheck" -ForegroundColor Yellow
}

Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""
