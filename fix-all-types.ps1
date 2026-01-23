# ============================================================
# 🔥 FIX COMPLETO - Sistema MAG - Correção TypeScript
# ============================================================

Write-Host "`n🔧 CORREÇÃO COMPLETA DE TIPOS - SISTEMA MAG`n" -ForegroundColor Cyan

$rootPath = "C:\Users\adair\PycharmProjects\MAG-system-webapp"
Set-Location $rootPath

# ============================================================
# 1️⃣ CORRIGIR HOOK useTranslation.ts
# ============================================================

Write-Host "1️⃣ Corrigindo useTranslation.ts..." -ForegroundColor Yellow

$useTranslationPath = "apps\web\src\hooks\useTranslation.ts"
$useTranslationContent = @'
import translations from '@/i18n/locales/pt-BR.json'

type TranslationKey = keyof typeof translations

export function useTranslation() {
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let translation: string = translations[key] as string

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
# 2️⃣ CORRIGIR vehicles.ts
# ============================================================

Write-Host "`n2️⃣ Corrigindo vehicles.ts..." -ForegroundColor Yellow

$vehiclesPath = "apps\web\src\lib\api\vehicles.ts"
$vehiclesContent = @'
import type { Vehicle } from '@/types/vehicle'
import { api } from './http'

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

  const response = await api.get<VehicleListResponse>(
    `vehicles?${params.toString()}`
  )

  return response.data
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const response = await api.get<Vehicle>(`vehicles/${id}`)
  return response.data
}

export async function createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
  const response = await api.post<Vehicle>('vehicles', data)
  return response.data
}

export async function updateVehicle(
  id: string,
  data: Partial<Vehicle>
): Promise<Vehicle> {
  const response = await api.patch<Vehicle>(`vehicles/${id}`, data)
  return response.data
}

export async function deleteVehicle(id: string): Promise<void> {
  await api.delete(`vehicles/${id}`)
}
'@

$vehiclesContent | Out-File -FilePath $vehiclesPath -Encoding utf8 -NoNewline
Write-Host "   ✅ vehicles.ts corrigido" -ForegroundColor Green

# ============================================================
# 3️⃣ CORRIGIR FILTROS COM UNION TYPES
# ============================================================

Write-Host "`n3️⃣ Corrigindo filtros com union types..." -ForegroundColor Yellow

# --- Diagnostico Page ---
$diagnosticoPath = "apps\web\src\app\(app)\diagnostico\page.tsx"
$diagnosticoContent = Get-Content $diagnosticoPath -Raw

$diagnosticoContent = $diagnosticoContent -replace `
  'const \[statusFilter, setStatusFilter\] = useState<string>\(''pendente''\)', `
  'const [statusFilter, setStatusFilter] = useState<''pendente'' | ''concluido'' | ''todos''>(''pendente'')'

$diagnosticoContent | Out-File -FilePath $diagnosticoPath -Encoding utf8 -NoNewline
Write-Host "   ✅ diagnostico/page.tsx corrigido" -ForegroundColor Green

# --- Financeiro Page ---
$financeiroPath = "apps\web\src\app\(app)\financeiro\page.tsx"
$financeiroContent = Get-Content $financeiroPath -Raw

$financeiroContent = $financeiroContent -replace `
  'const \[tipoFilter, setTipoFilter\] = useState<string>\(''todos''\)', `
  'const [tipoFilter, setTipoFilter] = useState<''todos'' | ''receita'' | ''despesa''>(''todos'')'

$financeiroContent = $financeiroContent -replace `
  'const \[statusFilter, setStatusFilter\] = useState<string>\(''pendente''\)', `
  'const [statusFilter, setStatusFilter] = useState<''pendente'' | ''pago'' | ''todos''>(''pendente'')'

$financeiroContent | Out-File -FilePath $financeiroPath -Encoding utf8 -NoNewline
Write-Host "   ✅ financeiro/page.tsx corrigido" -ForegroundColor Green

# --- Locacoes Page ---
$locacoesPath = "apps\web\src\app\(app)\locacoes\page.tsx"
$locacoesContent = Get-Content $locacoesPath -Raw

# Remover import não usado
$locacoesContent = $locacoesContent -replace "import \{ useRouter \} from 'next/navigation'\r?\n", ""

# Corrigir filtro
$locacoesContent = $locacoesContent -replace `
  'const \[statusFilter, setStatusFilter\] = useState<string>\(''ativa''\)', `
  'const [statusFilter, setStatusFilter] = useState<''ativa'' | ''finalizada'' | ''todas''>(''ativa'')'

$locacoesContent | Out-File -FilePath $locacoesPath -Encoding utf8 -NoNewline
Write-Host "   ✅ locacoes/page.tsx corrigido (+ useRouter removido)" -ForegroundColor Green

# ============================================================
# 4️⃣ CORRIGIR veiculos/page.tsx - Import correto
# ============================================================

Write-Host "`n4️⃣ Corrigindo veiculos/page.tsx..." -ForegroundColor Yellow

$veiculosPagePath = "apps\web\src\app\(app)\veiculos\page.tsx"
$veiculosPageContent = Get-Content $veiculosPagePath -Raw

# Corrigir imports
$veiculosPageContent = $veiculosPageContent -replace `
  "import \{ Vehicle, ListResponse \} from '@/lib/api/vehicles'", `
  "import type { Vehicle, VehicleListResponse } from '@/lib/api/vehicles'"

# Corrigir tipo usado no código
$veiculosPageContent = $veiculosPageContent -replace `
  'ListResponse', `
  'VehicleListResponse'

$veiculosPageContent | Out-File -FilePath $veiculosPagePath -Encoding utf8 -NoNewline
Write-Host "   ✅ veiculos/page.tsx corrigido" -ForegroundColor Green

# ============================================================
# 5️⃣ FORMATAR E VALIDAR
# ============================================================

Write-Host "`n5️⃣ Formatando código..." -ForegroundColor Yellow
pnpm format | Out-Null

Write-Host "`n6️⃣ Executando LINT..." -ForegroundColor Yellow
$lintResult = pnpm lint 2>&1
$lintExitCode = $LASTEXITCODE

Write-Host "`n7️⃣ Executando TYPECHECK..." -ForegroundColor Yellow
$typecheckResult = pnpm typecheck 2>&1
$typecheckExitCode = $LASTEXITCODE

Write-Host "`n8️⃣ Executando TESTES..." -ForegroundColor Yellow
$testResult = pnpm -r test 2>&1
$testExitCode = $LASTEXITCODE

# ============================================================
# 📊 RELATÓRIO FINAL
# ============================================================

Write-Host "`n" ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 RELATÓRIO FINAL - SISTEMA MAG" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

Write-Host "`n✅ Arquivos Corrigidos:" -ForegroundColor Green
Write-Host "   • hooks/useTranslation.ts" -ForegroundColor White
Write-Host "   • lib/api/vehicles.ts" -ForegroundColor White
Write-Host "   • app/(app)/diagnostico/page.tsx" -ForegroundColor White
Write-Host "   • app/(app)/financeiro/page.tsx" -ForegroundColor White
Write-Host "   • app/(app)/locacoes/page.tsx" -ForegroundColor White
Write-Host "   • app/(app)/veiculos/page.tsx" -ForegroundColor White

Write-Host "`n🔍 Validações:" -ForegroundColor Yellow

if ($lintExitCode -eq 0) {
    Write-Host "   ✅ LINT: OK" -ForegroundColor Green
} else {
    Write-Host "   ❌ LINT: FALHOU" -ForegroundColor Red
}

if ($typecheckExitCode -eq 0) {
    Write-Host "   ✅ TYPECHECK: OK" -ForegroundColor Green
} else {
    Write-Host "   ❌ TYPECHECK: FALHOU" -ForegroundColor Red
}

if ($testExitCode -eq 0) {
    Write-Host "   ✅ TESTES: OK" -ForegroundColor Green
} else {
    Write-Host "   ❌ TESTES: FALHOU" -ForegroundColor Red
}

Write-Host "`n" ("=" * 60) -ForegroundColor Cyan

if ($lintExitCode -eq 0 -and $typecheckExitCode -eq 0 -and $testExitCode -eq 0) {
    Write-Host "🎉 SISTEMA 100% FUNCIONAL E PRODUCTION-READY! 🎉" -ForegroundColor Green
} else {
    Write-Host "⚠️  Ainda existem problemas. Verifique os detalhes acima." -ForegroundColor Yellow
}

Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""
