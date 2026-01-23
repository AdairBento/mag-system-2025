import { api } from "./http";
import type { Vehicle, VehicleFilters } from "@/types/vehicle";

export type { Vehicle, VehicleFilters };

export interface VehicleListResponse {
  data: Vehicle[];
  meta: {
    total: number;
    page: number;
    perPage: number;
  };
}

export async function getVehicles(filters?: VehicleFilters): Promise<VehicleListResponse> {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.append("status", filters.status);
  }

  if (filters?.plate) {
    params.append("plate", filters.plate);
  }

  const queryString = params.toString();
  const url = queryString ? `vehicles?${queryString}` : "vehicles";

  return api<VehicleListResponse>(url);
}

export async function getVehicle(id: string): Promise<Vehicle> {
  return api<Vehicle>(`vehicles/${id}`);
}

export async function createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
  return api<Vehicle>("vehicles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
  return api<Vehicle>(`vehicles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteVehicle(id: string): Promise<void> {
  await api<void>(`vehicles/${id}`, {
    method: "DELETE",
  });
}
