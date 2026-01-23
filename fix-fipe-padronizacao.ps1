# ============================================================
# 🔥 FIX DEFINITIVO - Padronizar Vehicle para Inglês (FIPE)
# ============================================================

Write-Host "`n🔥 PADRONIZANDO VEHICLE PARA INGLÊS (API FIPE)`n" -ForegroundColor Cyan

# ============================================================
# 1️⃣ ATUALIZAR types/vehicle.ts - INGLÊS
# ============================================================

Write-Host "1. Atualizando types/vehicle.ts para inglês..." -ForegroundColor Yellow

$vehicleTypesPath = "apps\web\src\types\vehicle.ts"
$vehicleTypesContent = @'
export type VehicleStatus = 'disponivel' | 'alugado' | 'manutencao' | 'inativo'

export interface Vehicle {
  id: string
  plate: string        // placa
  brand: string        // marca
  model: string        // modelo
  year: number         // ano
  color?: string       // cor
  mileage?: number     // km
  renavam?: string
  chassis?: string
  status: VehicleStatus
  dailyRate?: number   // valorDiaria
  weeklyRate?: number  // valorSemanal
  monthlyRate?: number // valorMensal
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
'@

$vehicleTypesContent | Out-File -FilePath $vehicleTypesPath -Encoding utf8 -NoNewline
Write-Host "   OK types/vehicle.ts atualizado (inglês)" -ForegroundColor Green

# ============================================================
# 2️⃣ CORRIGIR FILTROS - TYPE ASSERTION CORRETA
# ============================================================

Write-Host "`n2. Corrigindo filtros com type assertion..." -ForegroundColor Yellow

# --- Diagnostico ---
$diagnosticoPath = "apps\web\src\app\(app)\diagnostico\page.tsx"
$diagnosticoContent = Get-Content $diagnosticoPath -Raw

$diagnosticoContent = $diagnosticoContent -replace `
  "const \[statusFilter, setStatusFilter\] = useState\('pendente'\)", `
  "const [statusFilter, setStatusFilter] = useState<'pendente' | 'em_andamento' | 'concluida' | 'todos'>('pendente')"

$diagnosticoContent = $diagnosticoContent -replace `
  'setStatusFilter\(e\.target\.value as [^\)]+\)', `
  'setStatusFilter(e.target.value as typeof statusFilter)'

$diagnosticoContent | Out-File -FilePath $diagnosticoPath -Encoding utf8 -NoNewline

# --- Financeiro ---
$financeiroPath = "apps\web\src\app\(app)\financeiro\page.tsx"
$financeiroContent = Get-Content $financeiroPath -Raw

$financeiroContent = $financeiroContent -replace `
  "const \[tipoFilter, setTipoFilter\] = useState\('todos'\)", `
  "const [tipoFilter, setTipoFilter] = useState<'todos' | 'receita' | 'despesa'>('todos')"

$financeiroContent = $financeiroContent -replace `
  "const \[statusFilter, setStatusFilter\] = useState\('pendente'\)", `
  "const [statusFilter, setStatusFilter] = useState<'pendente' | 'todos' | 'pago' | 'recebido'>('pendente')"

$financeiroContent = $financeiroContent -replace `
  'setTipoFilter\(e\.target\.value as [^\)]+\)', `
  'setTipoFilter(e.target.value as typeof tipoFilter)'

$financeiroContent = $financeiroContent -replace `
  'setStatusFilter\(e\.target\.value as [^\)]+\)', `
  'setStatusFilter(e.target.value as typeof statusFilter)'

$financeiroContent | Out-File -FilePath $financeiroPath -Encoding utf8 -NoNewline

# --- Locacoes ---
$locacoesPath = "apps\web\src\app\(app)\locacoes\page.tsx"
$locacoesContent = Get-Content $locacoesPath -Raw

$locacoesContent = $locacoesContent -replace `
  "const \[statusFilter, setStatusFilter\] = useState\('ativa'\)", `
  "const [statusFilter, setStatusFilter] = useState<'ativa' | 'finalizada' | 'cancelada' | 'todas'>('ativa')"

$locacoesContent = $locacoesContent -replace `
  'setStatusFilter\(e\.target\.value as [^\)]+\)', `
  'setStatusFilter(e.target.value as typeof statusFilter)'

$locacoesContent | Out-File -FilePath $locacoesPath -Encoding utf8 -NoNewline

Write-Host "   OK Filtros corrigidos (3 páginas)" -ForegroundColor Green

# ============================================================
# 3️⃣ ATUALIZAR lib/api/vehicles.ts - REMOVER DUPLICAÇÃO
# ============================================================

Write-Host "`n3. Atualizando lib/api/vehicles.ts..." -ForegroundColor Yellow

$vehiclesApiPath = "apps\web\src\lib\api\vehicles.ts"
$vehiclesApiContent = @'
import { api } from './http'
import type { Vehicle, VehicleFilters } from '@/types/vehicle'

export type { Vehicle, VehicleFilters }

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

  if (filters?.plate) {
    params.append('plate', filters.plate)
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

$vehiclesApiContent | Out-File -FilePath $vehiclesApiPath -Encoding utf8 -NoNewline
Write-Host "   OK lib/api/vehicles.ts atualizado" -ForegroundColor Green

# ============================================================
# 4️⃣ CORRIGIR veiculos/page.tsx - USEQUERY
# ============================================================

Write-Host "`n4. Corrigindo veiculos/page.tsx..." -ForegroundColor Yellow

$veiculosPagePath = "apps\web\src\app\(app)\veiculos\page.tsx"
$veiculosPageContent = Get-Content $veiculosPagePath -Raw

# Corrigir imports
$veiculosPageContent = $veiculosPageContent -replace `
  "import \{[^\}]+\} from '@/lib/api/vehicles'", `
  "import { type Vehicle, type VehicleListResponse, getVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/lib/api/vehicles'"

# Corrigir useQuery (remover generic extra)
$veiculosPageContent = $veiculosPageContent -replace `
  'const \{ data \} = useQuery<VehicleListResponse[^>]*>', `
  'const { data } = useQuery'

# Corrigir queryFn (remover contexto extra)
$veiculosPageContent = $veiculosPageContent -replace `
  'queryFn: async \(\{ queryKey \}\) =>', `
  'queryFn: async () =>'

$veiculosPageContent = $veiculosPageContent -replace `
  'const \[, filters\] = queryKey', `
  ''

$veiculosPageContent | Out-File -FilePath $veiculosPagePath -Encoding utf8 -NoNewline
Write-Host "   OK veiculos/page.tsx corrigido" -ForegroundColor Green

# ============================================================
# 5️⃣ ADICIONAR JEST TYPES NO TSCONFIG
# ============================================================

Write-Host "`n5. Adicionando Jest types no tsconfig..." -ForegroundColor Yellow

$tsconfigPath = "apps\web\tsconfig.json"

# Ler tsconfig sem converter (manter formatação)
$tsconfigContent = Get-Content $tsconfigPath -Raw

# Adicionar types se não existir
if ($tsconfigContent -notmatch '"types":\s*\[') {
    # Inserir após "compilerOptions": {
    $tsconfigContent = $tsconfigContent -replace `
        '("compilerOptions":\s*\{)', `
        '$1\n    "types": ["jest", "@testing-library/jest-dom"],'
    
    $tsconfigContent | Out-File -FilePath $tsconfigPath -Encoding utf8 -NoNewline
    Write-Host "   OK Jest types adicionados" -ForegroundColor Green
} else {
    Write-Host "   INFO Jest types já configurados" -ForegroundColor Gray
}

# ============================================================
# 6️⃣ FORMATAR E VALIDAR
# ============================================================

Write-Host "`n6. Formatando código..." -ForegroundColor Yellow
pnpm format 2>&1 | Out-Null

Write-Host "`n7. Executando validações..." -ForegroundColor Yellow
Write-Host ("=" * 70) -ForegroundColor DarkGray

# LINT
Write-Host "`n   LINT..." -ForegroundColor Cyan
$lintResult = pnpm lint 2>&1
$lintExitCode = $LASTEXITCODE

# TYPECHECK
Write-Host "`n   TYPECHECK..." -ForegroundColor Cyan
$typecheckResult = pnpm typecheck 2>&1
$typecheckExitCode = $LASTEXITCODE

# TESTES
Write-Host "`n   TESTES..." -ForegroundColor Cyan
$testResult = pnpm -r test 2>&1
$testExitCode = $LASTEXITCODE

# ============================================================
# 📊 RELATÓRIO FINAL
# ============================================================

Write-Host "`n" ("=" * 70) -ForegroundColor Cyan
Write-Host "RELATÓRIO FINAL - PADRONIZAÇÃO FIPE" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan

Write-Host "`nCorreções Aplicadas:" -ForegroundColor Green
Write-Host "   1. types/vehicle.ts padronizado para inglês (FIPE)" -ForegroundColor White
Write-Host "   2. Filtros corrigidos com union types + typeof" -ForegroundColor White
Write-Host "   3. lib/api/vehicles.ts sem duplicação de tipos" -ForegroundColor White
Write-Host "   4. veiculos/page.tsx useQuery corrigido" -ForegroundColor White
Write-Host "   5. Jest types configurados" -ForegroundColor White

Write-Host "`nResultados:" -ForegroundColor Yellow

$allPassed = $true

if ($lintExitCode -eq 0) {
    Write-Host "   OK LINT: PASSOU" -ForegroundColor Green
} else {
    Write-Host "   ERRO LINT: FALHOU" -ForegroundColor Red
    $allPassed = $false
}

if ($typecheckExitCode -eq 0) {
    Write-Host "   OK TYPECHECK: PASSOU" -ForegroundColor Green
} else {
    Write-Host "   ERRO TYPECHECK: FALHOU" -ForegroundColor Red
    $allPassed = $false
}

if ($testExitCode -eq 0) {
    Write-Host "   OK TESTES: PASSARAM" -ForegroundColor Green
} else {
    Write-Host "   ERRO TESTES: FALHARAM" -ForegroundColor Red
    $allPassed = $false
}

Write-Host "`n" ("=" * 70) -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "SISTEMA 100% FUNCIONAL E PRODUCTION-READY!" -ForegroundColor Green
    Write-Host "`nVehicle padronizado para API FIPE (inglês)!" -ForegroundColor Green
    Write-Host "Todos os erros TypeScript corrigidos!" -ForegroundColor Green
} else {
    Write-Host "Execute para ver erros restantes:" -ForegroundColor Yellow
    Write-Host "   pnpm typecheck" -ForegroundColor White
}

Write-Host "`n" ("=" * 70) -ForegroundColor Cyan
Write-Host ""
