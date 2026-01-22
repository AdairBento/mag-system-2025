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
  dailyRate: number;
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
    companyName?: string;
  };
  vehicle?: {
    id: string;
    plate: string;
    brand: string;
    model: string;
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
