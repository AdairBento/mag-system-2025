<# 
PATCH PROFISSIONAL — Clientes/Motoristas (MAG WebApp)
Cria/reescreve:
- apps/web/src/types/client.ts
- apps/web/src/types/driver.ts
- apps/web/src/lib/api/clients.ts
- apps/web/src/lib/api/drivers.ts
- apps/web/src/app/(app)/diagnostico/page.tsx

Uso:
  pwsh -ExecutionPolicy Bypass -File .\scripts\patch-clientes-motoristas-profissional.ps1

Obs: faz backup automático dos arquivos que já existirem.
#>

$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$path) {
  if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null }
}

function Backup-IfExists([string]$filePath) {
  if (Test-Path $filePath) {
    $ts = Get-Date -Format "yyyyMMdd-HHmmss"
    $bak = "$filePath.bak.$ts"
    Copy-Item -Force $filePath $bak
  }
}

function Write-FileAtomic([string]$filePath, [string]$content) {
  $dir = Split-Path -Parent $filePath
  Ensure-Dir $dir

  Backup-IfExists $filePath

  $tmp = "$filePath.tmp"
  # força UTF-8 (sem BOM)
  [System.IO.File]::WriteAllText($tmp, $content, New-Object System.Text.UTF8Encoding($false))
  Move-Item -Force $tmp $filePath
}

# raiz do repo = onde está o package.json do workspace
$repoRoot = (Get-Location).Path

# -------- 1) TYPES --------
$clientTypesPath = Join-Path $repoRoot "apps\web\src\types\client.ts"
$driverTypesPath = Join-Path $repoRoot "apps\web\src\types\driver.ts"

$clientTypes = @'
// apps/web/src/types/client.ts

export type ClientType = "PF" | "PJ";
export type ClientStatus = "ATIVO" | "INATIVO" | "BLOQUEADO" | "PENDENTE";

export type Client = {
  id: string;
  type: ClientType;
  name: string;
  doc: string; // CPF ou CNPJ
  phone?: string | null;
  city?: string | null;
  status: ClientStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type ClientFilters = {
  q?: string;
  type?: ClientType | "ALL";
  status?: ClientStatus | "ALL";
  city?: string;
};

export type CreateClientPayload = {
  type: ClientType;
  name: string;
  doc: string;
  phone?: string | null;
  city?: string | null;
  status?: ClientStatus;
};

export type UpdateClientPayload = Partial<CreateClientPayload>;
'@

$driverTypes = @'
// apps/web/src/types/driver.ts

export type DriverStatus = "LIVRE" | "VINCULADO" | "INATIVO" | "BLOQUEADO";

export type Driver = {
  id: string;
  name: string;
  cpf: string;
  cnh?: string | null;
  phone?: string | null;
  status: DriverStatus;
  clientId?: string | null;     // PJ vinculada (se existir)
  clientName?: string | null;   // opcional p/ tabela
  createdAt?: string;
  updatedAt?: string;
};

export type DriverFilters = {
  q?: string;
  status?: DriverStatus | "ALL";
  clientId?: string | "ALL";
};

export type CreateDriverPayload = {
  name: string;
  cpf: string;
  cnh?: string | null;
  phone?: string | null;
  status?: DriverStatus;
  clientId?: string | null;
};

export type UpdateDriverPayload = Partial<CreateDriverPayload>;

export type MigrateDriverPayload = {
  toClientId: string;
};
'@

Write-FileAtomic $clientTypesPath $clientTypes
Write-FileAtomic $driverTypesPath $driverTypes

# -------- 2) API LAYER (SEM JSX) --------
$clientsApiPath = Join-Path $repoRoot "apps\web\src\lib\api\clients.ts"
$driversApiPath = Join-Path $repoRoot "apps\web\src\lib\api\drivers.ts"

$clientsApi = @'
// apps/web/src/lib/api/clients.ts
// Camada REST pura. Sem JSX. Sem lógica de UI.

import { api } from "@/lib/api/http";
import type { Client, ClientFilters, CreateClientPayload, UpdateClientPayload } from "@/types/client";

function toQuery(filters?: ClientFilters): string {
  if (!filters) return "";
  const q = new URLSearchParams();

  if (filters.q) q.set("q", filters.q);
  if (filters.city) q.set("city", filters.city);

  if (filters.type && filters.type !== "ALL") q.set("type", filters.type);
  if (filters.status && filters.status !== "ALL") q.set("status", filters.status);

  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function listClients(filters?: ClientFilters): Promise<Client[]> {
  return api<Client[]>(`/clients${toQuery(filters)}`);
}

export async function getClient(id: string): Promise<Client> {
  return api<Client>(`/clients/${id}`);
}

export async function createClient(payload: CreateClientPayload): Promise<Client> {
  return api<Client>(`/clients`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateClient(id: string, payload: UpdateClientPayload): Promise<Client> {
  return api<Client>(`/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteClient(id: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(`/clients/${id}`, { method: "DELETE" });
}
'@

$driversApi = @'
// apps/web/src/lib/api/drivers.ts
// Camada REST pura. Sem JSX. Sem lógica de UI.

import { api } from "@/lib/api/http";
import type {
  Driver,
  DriverFilters,
  CreateDriverPayload,
  UpdateDriverPayload,
  MigrateDriverPayload,
} from "@/types/driver";

function toQuery(filters?: DriverFilters): string {
  if (!filters) return "";
  const q = new URLSearchParams();

  if (filters.q) q.set("q", filters.q);

  if (filters.status && filters.status !== "ALL") q.set("status", filters.status);
  if (filters.clientId && filters.clientId !== "ALL") q.set("clientId", filters.clientId);

  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function listDrivers(filters?: DriverFilters): Promise<Driver[]> {
  return api<Driver[]>(`/drivers${toQuery(filters)}`);
}

export async function getDriver(id: string): Promise<Driver> {
  return api<Driver>(`/drivers/${id}`);
}

export async function createDriver(payload: CreateDriverPayload): Promise<Driver> {
  return api<Driver>(`/drivers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDriver(id: string, payload: UpdateDriverPayload): Promise<Driver> {
  return api<Driver>(`/drivers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteDriver(id: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(`/drivers/${id}`, { method: "DELETE" });
}

// Endpoint de migração (seu backend pode ser /drivers/:id/migrate)
export async function migrateDriver(id: string, payload: MigrateDriverPayload): Promise<Driver> {
  return api<Driver>(`/drivers/${id}/migrate`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
'@

Write-FileAtomic $clientsApiPath $clientsApi
Write-FileAtomic $driversApiPath $driversApi

# -------- 3) DIAGNÓSTICO (remove apiClient e trata erro) --------
$diagnosticoPath = Join-Path $repoRoot "apps\web\src\app\(app)\diagnostico\page.tsx"

$diagnostico = @'
// apps/web/src/app/(app)/diagnostico/page.tsx

import { api } from "@/lib/api/http";

type Health = { status: string; service: string; ts: string };

export default async function DiagnosticoPage() {
  try {
    const health = await api<Health>("/health");

    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Diagnóstico</h1>
        <pre className="rounded-md bg-muted p-3 text-sm">{JSON.stringify(health, null, 2)}</pre>
      </div>
    );
  } catch (err) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Diagnóstico</h1>
        <p className="text-sm text-destructive">Falha ao consultar /health</p>
        <pre className="rounded-md bg-muted p-3 text-sm">{JSON.stringify(err, null, 2)}</pre>
      </div>
    );
  }
}
'@

Write-FileAtomic $diagnosticoPath $diagnostico

Write-Host ""
Write-Host "✅ Patch aplicado com sucesso!" -ForegroundColor Green
Write-Host "Arquivos escritos/atualizados:" -ForegroundColor Green
Write-Host " - $clientTypesPath"
Write-Host " - $driverTypesPath"
Write-Host " - $clientsApiPath"
Write-Host " - $driversApiPath"
Write-Host " - $diagnosticoPath"
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Yellow
Write-Host "  corepack pnpm -w typecheck"
Write-Host "  corepack pnpm -w lint"
Write-Host "  corepack pnpm -w -r build"
