import { api } from "./http";

export type ClientStatus = "ATIVO" | "INATIVO" | "BLOQUEADO";
export type ClientType = "PF" | "PJ";

export type Client = {
  id: string;
  type: ClientType;
  status: ClientStatus;
  name?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  cpf?: string;
  cnpj?: string;
  cellphone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ClientFilters = {
  search?: string;
  type?: ClientType | "ALL";
  status?: ClientStatus | "ALL";
};

export type ListResponse<T> = {
  ok: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
};

export async function getClients(filters: ClientFilters, page = 1, limit = 10) {
  const qs = new URLSearchParams();
  if (filters.search) qs.set("search", filters.search);
  if (filters.type && filters.type !== "ALL") qs.set("type", filters.type);
  if (filters.status && filters.status !== "ALL") qs.set("status", filters.status);
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  return api<ListResponse<Client>>(`/clients?${qs.toString()}`);
}

export async function createClient(payload: unknown) {
  return api<Client>("/clients", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateClient(id: string, payload: unknown) {
  return api<Client>(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteClient(id: string) {
  return api<{ ok: boolean }>(`/clients/${id}`, { method: "DELETE" });
}
