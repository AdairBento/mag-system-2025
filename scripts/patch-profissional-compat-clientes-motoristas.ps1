$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$path) {
  if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null }
}

function To-RelPath([string]$fullPath, [string]$root) {
  $p = [System.IO.Path]::GetFullPath($fullPath)
  $r = [System.IO.Path]::GetFullPath($root)
  if ($p.StartsWith($r)) { return $p.Substring($r.Length).TrimStart('\','/') }
  return [System.IO.Path]::GetFileName($p)
}

function Backup-IfExists([string]$filePath, [string]$backupRoot, [string]$repoRoot) {
  if (Test-Path $filePath) {
    $rel = To-RelPath $filePath $repoRoot
    $dest = Join-Path $backupRoot $rel
    $destDir = Split-Path -Parent $dest
    Ensure-Dir $destDir
    Copy-Item -Force $filePath $dest
  }
}

function Write-FileAtomic([string]$filePath, [string]$content, [string]$backupRoot, [string]$repoRoot) {
  $dir = Split-Path -Parent $filePath
  Ensure-Dir $dir

  Backup-IfExists $filePath $backupRoot $repoRoot

  $tmp = "$filePath.tmp"
  $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
  [System.IO.File]::WriteAllText($tmp, $content, $utf8NoBom)
  Move-Item -Force $tmp $filePath
}

$repoRoot = (Get-Location).Path
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $repoRoot ".backups\professional-patch\$ts"
Ensure-Dir $backupRoot

# ----------------------------
# 1) TYPES compatíveis com a UI atual
# ----------------------------
$clientTypesPath = Join-Path $repoRoot "apps\web\src\types\client.ts"
$driverTypesPath = Join-Path $repoRoot "apps\web\src\types\driver.ts"

$clientTypes = @'
// apps/web/src/types/client.ts
// Tipos compatíveis com a UI atual (campos opcionais para não quebrar modais/tabelas).

export type ClientType = "PF" | "PJ";
export type ClientStatus = "ATIVO" | "INATIVO" | "BLOQUEADO";

export type Client = {
  id: string;
  type: ClientType;

  // Nome principal (PF ou PJ)
  name: string;

  // Documento unificado (CPF/CNPJ). Mantemos também aliases opcionais para UI legada.
  doc: string;
  cpf?: string | null;
  cnpj?: string | null;

  // PJ (legado UI)
  razaoSocial?: string | null;
  nomeFantasia?: string | null;

  // Contato (UI legada usa cellphone/email)
  phone?: string | null;
  cellphone?: string | null;
  email?: string | null;

  city?: string | null;
  status: ClientStatus;

  createdAt?: string;
  updatedAt?: string;
};

export type ClientFilters = {
  // padrão novo
  q?: string;
  // compat UI atual
  search?: string;

  type?: ClientType | "ALL";
  status?: ClientStatus | "ALL";
  city?: string;
};

export type CreateClientPayload = {
  type: ClientType;
  name: string;
  doc: string;

  cpf?: string | null;
  cnpj?: string | null;
  razaoSocial?: string | null;
  nomeFantasia?: string | null;

  phone?: string | null;
  cellphone?: string | null;
  email?: string | null;

  city?: string | null;
  status?: ClientStatus;
};

export type UpdateClientPayload = Partial<CreateClientPayload>;
'@

$driverTypes = @'
// apps/web/src/types/driver.ts
// Tipos compatíveis com a UI atual (CNHCategory/CNHStatus e campos opcionais).

export type DriverStatus = "ATIVO" | "INATIVO";

export type CNHCategory = "A" | "B" | "C" | "D" | "E" | "AB" | "AC" | "AD" | "AE";
export type CNHStatus = "REGULAR" | "VENCIDA" | "SUSPENSA" | "CASSADA";

export type Driver = {
  id: string;
  name: string;

  cpf: string;
  cnh?: string | null;

  // UI atual usa isso
  cnhCategory?: CNHCategory | null;
  cnhValidade?: string | null;
  telefone?: string | null;

  // mantemos também phone para padrão novo
  phone?: string | null;

  status: DriverStatus;

  clientId?: string | null;
  clientName?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

export type DriverFilters = {
  q?: string;
  search?: string;

  status?: DriverStatus | "ALL";
  clientId?: string | "ALL";

  // UI atual usa estes filtros
  cnhCategory?: CNHCategory | "ALL";
  cnhStatus?: CNHStatus | "ALL";
};

export type CreateDriverPayload = {
  name: string;
  cpf: string;
  cnh?: string | null;

  cnhCategory?: CNHCategory | null;
  cnhValidade?: string | null;
  telefone?: string | null;

  phone?: string | null;

  status?: DriverStatus;
  clientId?: string | null;
};

export type UpdateDriverPayload = Partial<CreateDriverPayload>;

// compat: alguns lugares chamam newClientId
export type MigrateDriverPayload = {
  toClientId?: string;
  newClientId?: string;
};
'@

Write-FileAtomic $clientTypesPath $clientTypes $backupRoot $repoRoot
Write-FileAtomic $driverTypesPath $driverTypes $backupRoot $repoRoot

# ----------------------------
# 2) API: reexport tipos + aliases getClients/getDrivers + migrate compat
# ----------------------------
$clientsApiPath = Join-Path $repoRoot "apps\web\src\lib\api\clients.ts"
$driversApiPath = Join-Path $repoRoot "apps\web\src\lib\api\drivers.ts"

$clientsApi = @'
// apps/web/src/lib/api/clients.ts
import { api } from "@/lib/api/http";
export type { Client, ClientFilters, CreateClientPayload, UpdateClientPayload } from "@/types/client";
import type { Client, ClientFilters, CreateClientPayload, UpdateClientPayload } from "@/types/client";

function toQuery(filters?: ClientFilters): string {
  if (!filters) return "";
  const q = new URLSearchParams();

  const term = filters.q ?? filters.search;
  if (term) q.set("q", term);

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
  return api<Client>(`/clients`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateClient(id: string, payload: UpdateClientPayload): Promise<Client> {
  return api<Client>(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteClient(id: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(`/clients/${id}`, { method: "DELETE" });
}

// Aliases para UI legada
export const getClients = listClients;
'@

$driversApi = @'
// apps/web/src/lib/api/drivers.ts
import { api } from "@/lib/api/http";
export type {
  Driver,
  DriverFilters,
  CreateDriverPayload,
  UpdateDriverPayload,
  MigrateDriverPayload,
  CNHCategory,
  CNHStatus,
  DriverStatus,
} from "@/types/driver";
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

  const term = filters.q ?? filters.search;
  if (term) q.set("q", term);

  if (filters.status && filters.status !== "ALL") q.set("status", filters.status);
  if (filters.clientId && filters.clientId !== "ALL") q.set("clientId", filters.clientId);

  if (filters.cnhCategory && filters.cnhCategory !== "ALL") q.set("cnhCategory", String(filters.cnhCategory));
  if (filters.cnhStatus && filters.cnhStatus !== "ALL") q.set("cnhStatus", String(filters.cnhStatus));

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
  return api<Driver>(`/drivers`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateDriver(id: string, payload: UpdateDriverPayload): Promise<Driver> {
  return api<Driver>(`/drivers/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteDriver(id: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(`/drivers/${id}`, { method: "DELETE" });
}

export async function migrateDriver(id: string, payload: MigrateDriverPayload): Promise<Driver> {
  const toClientId = payload.toClientId ?? payload.newClientId;
  return api<Driver>(`/drivers/${id}/migrate`, {
    method: "POST",
    body: JSON.stringify({ toClientId }),
  });
}

// Aliases para UI legada
export const getDrivers = listDrivers;
'@

Write-FileAtomic $clientsApiPath $clientsApi $backupRoot $repoRoot
Write-FileAtomic $driversApiPath $driversApi $backupRoot $repoRoot

# ----------------------------
# 3) DIAGNÓSTICO: sem JSX dentro de try/catch (lint)
# ----------------------------
$diagnosticoPath = Join-Path $repoRoot "apps\web\src\app\(app)\diagnostico\page.tsx"

$diagnostico = @'
// apps/web/src/app/(app)/diagnostico/page.tsx

import { api } from "@/lib/api/http";

type Health = { status: string; service: string; ts: string };

export default async function DiagnosticoPage() {
  let health: Health | null = null;
  let error: unknown = null;

  try {
    health = await api<Health>("/health");
  } catch (err) {
    error = err;
  }

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Diagnóstico</h1>

      {error ? (
        <>
          <p className="text-sm text-destructive">Falha ao consultar /health</p>
          <pre className="rounded-md bg-muted p-3 text-sm">{JSON.stringify(error, null, 2)}</pre>
        </>
      ) : (
        <pre className="rounded-md bg-muted p-3 text-sm">{JSON.stringify(health, null, 2)}</pre>
      )}
    </div>
  );
}
'@

Write-FileAtomic $diagnosticoPath $diagnostico $backupRoot $repoRoot

Write-Host ""
Write-Host "✅ Patch aplicado (compat UI + reexports + aliases + diagnostico lint)!" -ForegroundColor Green
Write-Host "📦 Backup em: $backupRoot" -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "  corepack pnpm -w typecheck"
Write-Host "  corepack pnpm -w lint"
Write-Host ""
