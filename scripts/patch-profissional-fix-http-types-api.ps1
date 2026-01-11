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

# Repo root = pasta atual
$repoRoot = (Get-Location).Path

# backup root
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $repoRoot ".backups\professional-patch\$ts"
Ensure-Dir $backupRoot

# ----------------------------
# 0) FIX: apps/web/src/lib/api/http.ts  (LIMPO, SEM JSX)
# ----------------------------
$httpPath = Join-Path $repoRoot "apps\web\src\lib\api\http.ts"
$httpContent = @'
type ApiError = {
  ok: false;
  status: number;
  code?: string;
  message?: string;
  details?: unknown;
};

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  return envUrl && envUrl.trim() ? envUrl.trim() : "http://localhost:3001";
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 204) return undefined as unknown as T;

  const data = await parseBody(res);

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "message" in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>)["message"])
        : `HTTP ${res.status}`;

    const err: ApiError = {
      ok: false,
      status: res.status,
      message: msg,
      details: data,
    };
    throw err;
  }

  return data as T;
}
'@

Write-FileAtomic $httpPath $httpContent $backupRoot $repoRoot

# ----------------------------
# 1) TYPES
# ----------------------------
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
  clientId?: string | null;
  clientName?: string | null;
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

Write-FileAtomic $clientTypesPath $clientTypes $backupRoot $repoRoot
Write-FileAtomic $driverTypesPath $driverTypes $backupRoot $repoRoot

# ----------------------------
# 2) API REST PURO (SEM JSX)
# ----------------------------
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

export async function migrateDriver(id: string, payload: MigrateDriverPayload): Promise<Driver> {
  return api<Driver>(`/drivers/${id}/migrate`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
'@

Write-FileAtomic $clientsApiPath $clientsApi $backupRoot $repoRoot
Write-FileAtomic $driversApiPath $driversApi $backupRoot $repoRoot

# ----------------------------
# 3) DIAGNÓSTICO (padronizado + try/catch)
# ----------------------------
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

Write-FileAtomic $diagnosticoPath $diagnostico $backupRoot $repoRoot

Write-Host ""
Write-Host "✅ Patch PROFISSIONAL aplicado (http.ts + types + api + diagnostico)!" -ForegroundColor Green
Write-Host "📦 Backup completo em: $backupRoot" -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "  corepack pnpm -w typecheck"
Write-Host "  corepack pnpm -w lint"
Write-Host ""
