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

  if (filters.cnhCategory && filters.cnhCategory !== "ALL")
    q.set("cnhCategory", String(filters.cnhCategory));
  if (filters.cnhStatus && filters.cnhStatus !== "ALL")
    q.set("cnhStatus", String(filters.cnhStatus));

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
export type PagedResult<T> = { data: T[] };

// Compat: UI antiga chama getDrivers(filters, page, limit) e espera .data
export async function getDrivers(
  filters?: DriverFilters,
  page?: number,
  limit?: number,
): Promise<PagedResult<Driver>> {
  void page;
  void limit;
  const data = await listDrivers(filters);
  return { data };
}
