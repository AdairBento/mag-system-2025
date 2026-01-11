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
