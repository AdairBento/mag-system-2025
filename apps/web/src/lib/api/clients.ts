// apps/web/src/lib/api/clients.ts
import { api } from "@/lib/api/http";
export type {
  Client,
  ClientFilters,
  CreateClientPayload,
  UpdateClientPayload,
} from "@/types/client";
import type {
  Client,
  ClientFilters,
  CreateClientPayload,
  UpdateClientPayload,
} from "@/types/client";

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
  return api<Client[]>(`clients${toQuery(filters)}`);
}

export async function getClient(id: string): Promise<Client> {
  return api<Client>(`clients/${id}`);
}

export async function createClient(payload: CreateClientPayload): Promise<Client> {
  return api<Client>(`clients`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateClient(id: string, payload: UpdateClientPayload): Promise<Client> {
  return api<Client>(`clients/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteClient(id: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(`clients/${id}`, { method: "DELETE" });
}

// Aliases para UI legada
export type PagedResult<T> = { data: T[] };

// Compat: UI antiga chama getClients(filters, page, limit) e espera .data
export async function getClients(
  filters?: ClientFilters,
  page?: number,
  limit?: number,
): Promise<PagedResult<Client>> {
  void page;
  void limit;
  const data = await listClients(filters);
  return { data };
}

export async function searchClients(query: string): Promise<Client[]> {
  return api<Client[]>(`clients/search?q=${encodeURIComponent(query)}`);
}
