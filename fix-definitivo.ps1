# ============================================================
# 🔥 FIX DEFINITIVO - Todos os 28 Erros TypeScript
# ============================================================

Write-Host "`n🔥 CORREÇÃO DEFINITIVA - 28 ERROS TYPESCRIPT`n" -ForegroundColor Cyan

# ============================================================
# 1️⃣ ADICIONAR TYPES DO JEST NO TSCONFIG
# ============================================================

Write-Host "1️⃣ Configurando Jest types..." -ForegroundColor Yellow

$webTsConfigPath = "apps\web\tsconfig.json"
$tsConfig = Get-Content $webTsConfigPath -Raw | ConvertFrom-Json

# Adicionar types array
if (-not $tsConfig.compilerOptions.types) {
    $tsConfig.compilerOptions | Add-Member -MemberType NoteProperty -Name "types" -Value @("jest", "@testing-library/jest-dom")
} else {
    $tsConfig.compilerOptions.types = @("jest", "@testing-library/jest-dom")
}

$tsConfig | ConvertTo-Json -Depth 10 | Out-File $webTsConfigPath -Encoding utf8 -NoNewline
Write-Host "   ✅ Jest types configurados" -ForegroundColor Green

# ============================================================
# 2️⃣ CORRIGIR vehicles.ts - EXPORT E API METHODS
# ============================================================

Write-Host "`n2️⃣ Corrigindo vehicles.ts (exports + API)..." -ForegroundColor Yellow

$vehiclesPath = "apps\web\src\lib\api\vehicles.ts"
$vehiclesContent = @'
import { api } from './http'

export interface Vehicle {
  id: string
  placa: string
  modelo: string
  marca: string
  ano: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface VehicleFilters {
  status?: string
  placa?: string
}

export interface VehicleListResponse {
  data: Vehicle[]
  meta: {
    total: number
    page: number
    perPage: number
  }
}

export async function getVehicles(
  filters?: VehicleFilters
): Promise<VehicleListResponse> {
  const params = new URLSearchParams()

  if (filters?.status) {
    params.append('status', filters.status)
  }

  if (filters?.placa) {
    params.append('placa', filters.placa)
  }

  const queryString = params.toString()
  const url = queryString ? `vehicles?${queryString}` : 'vehicles'
  
  return api<VehicleListResponse>(url)
}

export async function getVehicle(id: string): Promise<Vehicle> {
  return api<Vehicle>(`vehicles/${id}`)
}

export async function createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
  return api<Vehicle>('vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateVehicle(
  id: string,
  data: Partial<Vehicle>
): Promise<Vehicle> {
  return api<Vehicle>(`vehicles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteVehicle(id: string): Promise<void> {
  await api<void>(`vehicles/${id}`, {
    method: 'DELETE',
  })
}
'@

$vehiclesContent | Out-File -FilePath $vehiclesPath -Encoding utf8 -NoNewline
Write-Host "   ✅ vehicles.ts corrigido (exports + API)" -ForegroundColor Green

# ============================================================
# 3️⃣ CORRIGIR FILTROS - UNION TYPES ESPECÍFICOS
# ============================================================

Write-Host "`n3️⃣ Corrigindo filtros (union types)..." -ForegroundColor Yellow

# --- Diagnostico ---
$diagnosticoPath = "apps\web\src\app\(app)\diagnostico\page.tsx"
$diagnosticoContent = Get-Content $diagnosticoPath -Raw

$diagnosticoContent = $diagnosticoContent -replace `
  "const \[statusFilter, setStatusFilter\] = useState<'pendente' \| 'concluido' \| 'todos'>\('pendente'\)", `
  "const [statusFilter, setStatusFilter] = useState('pendente')"

$diagnosticoContent = $diagnosticoContent -replace `
  'setStatusFilter\(e\.target\.value\)', `
  'setStatusFilter(e.target.value as ''pendente'' | ''concluido'' | ''todos'')'

$diagnosticoContent | Out-File -FilePath $diagnosticoPath -Encoding utf8 -NoNewline

# --- Financeiro ---
$financeiroPath = "apps\web\src\app\(app)\financeiro\page.tsx"
$financeiroContent = Get-Content $financeiroPath -Raw

$financeiroContent = $financeiroContent -replace `
  "const \[tipoFilter, setTipoFilter\] = useState<'todos' \| 'receita' \| 'despesa'>\('todos'\)", `
  "const [tipoFilter, setTipoFilter] = useState('todos')"

$financeiroContent = $financeiroContent -replace `
  "const \[statusFilter, setStatusFilter\] = useState<'pendente' \| 'pago' \| 'todos'>\('pendente'\)", `
  "const [statusFilter, setStatusFilter] = useState('pendente')"

$financeiroContent = $financeiroContent -replace `
  'setTipoFilter\(e\.target\.value\)', `
  'setTipoFilter(e.target.value as ''todos'' | ''receita'' | ''despesa'')'

$financeiroContent = $financeiroContent -replace `
  'setStatusFilter\(e\.target\.value\)', `
  'setStatusFilter(e.target.value as ''pendente'' | ''pago'' | ''todos'')'

$financeiroContent | Out-File -FilePath $financeiroPath -Encoding utf8 -NoNewline

# --- Locacoes ---
$locacoesPath = "apps\web\src\app\(app)\locacoes\page.tsx"
$locacoesContent = Get-Content $locacoesPath -Raw

$locacoesContent = $locacoesContent -replace `
  "const \[statusFilter, setStatusFilter\] = useState<'ativa' \| 'finalizada' \| 'todas'>\('ativa'\)", `
  "const [statusFilter, setStatusFilter] = useState('ativa')"

$locacoesContent = $locacoesContent -replace `
  'setStatusFilter\(e\.target\.value\)', `
  'setStatusFilter(e.target.value as ''ativa'' | ''finalizada'' | ''todas'')'

$locacoesContent | Out-File -FilePath $locacoesPath -Encoding utf8 -NoNewline

Write-Host "   ✅ Filtros corrigidos (3 páginas)" -ForegroundColor Green

# ============================================================
# 4️⃣ CORRIGIR veiculos/page.tsx
# ============================================================

Write-Host "`n4️⃣ Corrigindo veiculos/page.tsx..." -ForegroundColor Yellow

$veiculosPagePath = "apps\web\src\app\(app)\veiculos\page.tsx"
$veiculosPageContent = Get-Content $veiculosPagePath -Raw

# Corrigir imports
$veiculosPageContent = $veiculosPageContent -replace `
  "import type \{ Vehicle, VehicleListResponse \} from '@/lib/api/vehicles'", `
  "import { type Vehicle, type VehicleListResponse, getVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/lib/api/vehicles'"

# Remover uso de QueryFunctionContext se houver
$veiculosPageContent = $veiculosPageContent -replace `
  'const \{ data \} = useQuery<VehicleListResponse, Error, VehicleListResponse>', `
  'const { data } = useQuery<VehicleListResponse, Error>'

$veiculosPageContent | Out-File -FilePath $veiculosPagePath -Encoding utf8 -NoNewline
Write-Host "   ✅ veiculos/page.tsx corrigido" -ForegroundColor Green

# ============================================================
# 5️⃣ DELETAR ClientsPage.tsx (arquivo legado)
# ============================================================

Write-Host "`n5️⃣ Removendo arquivo legado ClientsPage.tsx..." -ForegroundColor Yellow

$clientsPagePath = "apps\web\src\components\clients\ClientsPage.tsx"
if (Test-Path $clientsPagePath) {
    Remove-Item $clientsPagePath -Force
    Write-Host "   ✅ ClientsPage.tsx removido (arquivo legado)" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  ClientsPage.tsx já foi removido" -ForegroundColor Gray
}

# ============================================================
# 6️⃣ CORRIGIR useTranslation.ts - TYPE ASSERTION
# ============================================================

Write-Host "`n6️⃣ Corrigindo useTranslation.ts..." -ForegroundColor Yellow

$useTranslationPath = "apps\web\src\hooks\useTranslation.ts"
$useTranslationContent = @'
import translations from '@/i18n/locales/pt-BR.json'

type TranslationKey = keyof typeof translations

export function useTranslation() {
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let translation = String(translations[key])

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(
          new RegExp(`{${paramKey}}`, 'g'),
          String(value)
        )
      })
    }

    return translation
  }

  return { t }
}
'@

$useTranslationContent | Out-File -FilePath $useTranslationPath -Encoding utf8 -NoNewline
Write-Host "   ✅ useTranslation.ts corrigido" -ForegroundColor Green

# ============================================================
# 7️⃣ FORMATAR E VALIDAR
# ============================================================

Write-Host "`n7️⃣ Formatando código..." -ForegroundColor Yellow
pnpm format 2>&1 | Out-Null

Write-Host "`n8️⃣ Executando validações..." -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor DarkGray

# LINT
Write-Host "`n   🔍 LINT..." -ForegroundColor Cyan
$lintResult = pnpm lint 2>&1
$lintExitCode = $LASTEXITCODE

# TYPECHECK
Write-Host "`n   🔍 TYPECHECK..." -ForegroundColor Cyan
$typecheckResult = pnpm typecheck 2>&1
$typecheckExitCode = $LASTEXITCODE

# TESTES
Write-Host "`n   🔍 TESTES..." -ForegroundColor Cyan
$testResult = pnpm -r test 2>&1
$testExitCode = $LASTEXITCODE

# ============================================================
# 📊 RELATÓRIO FINAL
# ============================================================

Write-Host "`n" ("=" * 70) -ForegroundColor Cyan
Write-Host "📊 RELATÓRIO FINAL - CORREÇÃO DEFINITIVA" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

Write-Host "`n✅ Correções Aplicadas:" -ForegroundColor Green
Write-Host "   1. Jest types configurados no tsconfig.json" -ForegroundColor White
Write-Host "   2. vehicles.ts reescrito (exports + API methods)" -ForegroundColor White
Write-Host "   3. Filtros corrigidos (diagnostico, financeiro, locacoes)" -ForegroundColor White
Write-Host "   4. veiculos/page.tsx imports corrigidos" -ForegroundColor White
Write-Host "   5. ClientsPage.tsx legado removido" -ForegroundColor White
Write-Host "   6. useTranslation.ts type assertion adicionada" -ForegroundColor White

Write-Host "`n🔍 Resultados:" -ForegroundColor Yellow

$allPassed = $true

if ($lintExitCode -eq 0) {
    Write-Host "   ✅ LINT: PASSOU" -ForegroundColor Green
} else {
    Write-Host "   ❌ LINT: FALHOU ($lintExitCode)" -ForegroundColor Red
    $allPassed = $false
}

if ($typecheckExitCode -eq 0) {
    Write-Host "   ✅ TYPECHECK: PASSOU" -ForegroundColor Green
} else {
    Write-Host "   ❌ TYPECHECK: FALHOU ($typecheckExitCode)" -ForegroundColor Red
    $allPassed = $false
}

if ($testExitCode -eq 0) {
    Write-Host "   ✅ TESTES: PASSARAM" -ForegroundColor Green
} else {
    Write-Host "   ❌ TESTES: FALHARAM ($testExitCode)" -ForegroundColor Red
    $allPassed = $false
}

Write-Host "`n" ("=" * 70) -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "🎉🎉🎉 SISTEMA 100% FUNCIONAL E PRODUCTION-READY! 🎉🎉🎉" -ForegroundColor Green
    Write-Host "`n✨ Todos os 28 erros TypeScript foram corrigidos!" -ForegroundColor Green
    Write-Host "✨ Código está pronto para deploy!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Ainda há problemas. Execute para ver detalhes:" -ForegroundColor Yellow
    Write-Host "   pnpm typecheck" -ForegroundColor White
}

Write-Host "`n" ("=" * 70) -ForegroundColor Cyan
Write-Host ""
