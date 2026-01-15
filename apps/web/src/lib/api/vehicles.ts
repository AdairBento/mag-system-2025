import { api } from "./http";

export type VehicleStatus = "DISPONIVEL" | "LOCADO" | "MANUTENCAO" | "INATIVO";

export type Vehicle = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor?: string;
  status: VehicleStatus;
  quilometragem?: number;
  renavam?: string;
  chassi?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type VehicleFilters = {
  search?: string;
  status?: VehicleStatus | "ALL";
};

export type ListResponse<T> = {
  ok: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
};

export async function getVehicles(filters: VehicleFilters, page = 1, limit = 10) {
  const qs = new URLSearchParams();
  if (filters.search) qs.set("search", filters.search);
  if (filters.status && filters.status !== "ALL") qs.set("status", filters.status);
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  return api<ListResponse<Vehicle>>(`/vehicles?${qs.toString()}`);
}

export async function createVehicle(payload: unknown) {
  return api<Vehicle>("/vehicles", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateVehicle(id: string, payload: unknown) {
  return api<Vehicle>(`/vehicles/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteVehicle(id: string) {
  return api<{ ok: boolean }>(`/vehicles/${id}`, { method: "DELETE" });
}
