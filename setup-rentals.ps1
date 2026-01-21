#Requires -Version 7.0
<#
.SYNOPSIS
    Setup completo do módulo de Locações
.DESCRIPTION
    Cria toda estrutura de arquivos do módulo de locações
#>

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 SETUP - MÓDULO DE LOCAÇÕES" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

# ============================================
# CONFIGURAÇÃO DE CAMINHOS
# ============================================
$CurrentPath = Get-Location
$ProjectRoot = $CurrentPath.Path
$WebRoot = Join-Path $ProjectRoot "apps\web\src"
$ApiRoot = Join-Path $ProjectRoot "apps\api\src"

Write-Host "`n📂 Diretórios:" -ForegroundColor Yellow
Write-Host "  Project Root: $ProjectRoot"
Write-Host "  Web Root: $WebRoot"
Write-Host "  API Root: $ApiRoot"

$Paths = @{
    LibApi         = Join-Path $WebRoot "lib\api"
    LocacoesPage   = Join-Path $WebRoot "app\(app)\locacoes"
    Components     = Join-Path $WebRoot "app\(app)\locacoes\_components"
}

# ============================================
# CRIAR ESTRUTURA DE PASTAS
# ============================================
Write-Host "`n📁 Criando estrutura de pastas..." -ForegroundColor Yellow

foreach ($key in $Paths.Keys) {
    $path = $Paths[$key]
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "  ✅ Criado: $key" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Já existe: $key" -ForegroundColor DarkGray
    }
}

# ============================================
# ARQUIVO 1: API CLIENT (rentals.ts)
# ============================================
Write-Host "`n📝 Criando: rentals.ts (API Client)..." -ForegroundColor Yellow

$RentalsApiContent = @'
import { api } from "./http";

export type RentalStatus = "ATIVA" | "CONCLUIDA" | "CANCELADA";

export type Rental = {
  id: string;
  clientId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  initialKm: number;
  finalKm: number | null;
  dailyValue: number;
  discount: number;
  totalValue: number;
  status: RentalStatus;
  observations: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name?: string;
    razaoSocial?: string;
  };
  vehicle?: {
    id: string;
    modelo: string;
    placa: string;
  };
};

export type RentalFilters = {
  search?: string;
  status?: RentalStatus | "ALL";
};

export type ListResponse<T> = {
  ok: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
};

export async function getRentals(filters: RentalFilters, page = 1, limit = 10) {
  const qs = new URLSearchParams();
  if (filters.search) qs.set("search", filters.search);
  if (filters.status && filters.status !== "ALL") qs.set("status", filters.status);
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  return api<ListResponse<Rental>>(`/rentals?${qs.toString()}`);
}

export async function createRental(payload: unknown) {
  return api<Rental>("/rentals", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateRental(id: string, payload: unknown) {
  return api<Rental>(`/rentals/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function returnRental(id: string, payload: unknown) {
  return api<Rental>(`/rentals/${id}/return`, { method: "POST", body: JSON.stringify(payload) });
}

export async function cancelRental(id: string) {
  return api<Rental>(`/rentals/${id}/cancel`, { method: "POST" });
}

export async function deleteRental(id: string) {
  return api<{ ok: boolean }>(`/rentals/${id}`, { method: "DELETE" });
}
'@

$RentalsApiPath = Join-Path $Paths.LibApi "rentals.ts"
Set-Content -Path $RentalsApiPath -Value $RentalsApiContent -Encoding UTF8
Write-Host "  ✅ Criado: $RentalsApiPath" -ForegroundColor Green

# ============================================
# ARQUIVO 2: RENTAL TABLE
# ============================================
Write-Host "`n📝 Criando: rental-table.tsx..." -ForegroundColor Yellow

$RentalTableContent = @'
"use client";

import * as React from "react";
import type { Rental } from "@/lib/api/rentals";

type Props = {
  items: Rental[];
  onEdit: (r: Rental) => void;
  onReturn: (r: Rental) => void;
  onCancel: (r: Rental) => void;
};

function labelClient(r: Rental) {
  return r.client?.name ?? r.client?.razaoSocial ?? "-";
}

function labelVehicle(r: Rental) {
  return `${r.vehicle?.modelo ?? "-"} (${r.vehicle?.placa ?? "-"})`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR");
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}

export function RentalTable({ items, onEdit, onReturn, onCancel }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Cliente</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Veículo</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Início</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Fim</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Valor Total</th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
            <th className="px-3 py-2 text-right font-medium text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-gray-500" colSpan={7}>
                Nenhuma locação encontrada.
              </td>
            </tr>
          ) : (
            items.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="px-3 py-2">{labelClient(r)}</td>
                <td className="px-3 py-2">{labelVehicle(r)}</td>
                <td className="px-3 py-2">{formatDate(r.startDate)}</td>
                <td className="px-3 py-2">{formatDate(r.endDate)}</td>
                <td className="px-3 py-2">{formatCurrency(r.totalValue)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      r.status === "ATIVA"
                        ? "bg-blue-100 text-blue-700"
                        : r.status === "CONCLUIDA"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    {r.status === "ATIVA" && (
                      <>
                        <button
                          className="rounded border px-2 py-1 hover:bg-gray-50"
                          onClick={() => onEdit(r)}
                        >
                          Editar
                        </button>
                        <button
                          className="rounded border border-green-500 px-2 py-1 text-green-600 hover:bg-green-50"
                          onClick={() => onReturn(r)}
                        >
                          Devolver
                        </button>
                        <button
                          className="rounded border border-red-500 px-2 py-1 text-red-600 hover:bg-red-50"
                          onClick={() => onCancel(r)}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {r.status !== "ATIVA" && (
                      <span className="text-gray-400">Finalizada</span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
'@

$RentalTablePath = Join-Path $Paths.Components "rental-table.tsx"
Set-Content -Path $RentalTablePath -Value $RentalTableContent -Encoding UTF8
Write-Host "  ✅ Criado: $RentalTablePath" -ForegroundColor Green

# ============================================
# ARQUIVO 3: RENTAL FORM MODAL
# ============================================
Write-Host "`n📝 Criando: rental-form-modal.tsx..." -ForegroundColor Yellow

$RentalFormContent = Get-Content -Raw -Path ".\rental-form-modal-content.txt"
if (-not $RentalFormContent) {
    Write-Host "  ⚠️  Arquivo muito grande, criando manualmente..." -ForegroundColor Yellow
    Write-Host "  📋 Copie o conteúdo do rental-form-modal.tsx que enviei" -ForegroundColor Cyan
}

# ============================================
# RESUMO FINAL
# ============================================
Write-Host "`n" -NoNewline
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ SETUP CONCLUÍDO!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan

Write-Host "`n📦 Arquivos criados:" -ForegroundColor Yellow
Write-Host "  1. ✅ lib/api/rentals.ts"
Write-Host "  2. ✅ _components/rental-table.tsx"
Write-Host "  3. ⚠️  _components/rental-form-modal.tsx (criar manualmente)"
Write-Host "  4. ❌ _components/return-modal.tsx (pendente)"
Write-Host "  5. ❌ locacoes/page.tsx (pendente)"

Write-Host "`n🔧 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Criar rental-form-modal.tsx manualmente"
Write-Host "  2. Criar return-modal.tsx"
Write-Host "  3. Atualizar page.tsx"
Write-Host "  4. Testar no navegador"

Write-Host "`n🎯 Para continuar:" -ForegroundColor Yellow
Write-Host "  cd apps\web"
Write-Host "  npm run dev"
Write-Host ""
