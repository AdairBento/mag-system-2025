import type {
  Driver,
  DriverFilters,
  DriverListResponse,
  MigrateDriverRequest,
  MigrateDriverResponse,
} from "@/types/driver";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getDrivers(
  filters?: DriverFilters,
  page = 1,
  limit = 10,
): Promise<DriverListResponse> {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.clientId) params.append("clientId", filters.clientId);
  if (filters?.cnhCategory && filters.cnhCategory !== "ALL")
    params.append("cnhCategory", filters.cnhCategory);
  if (filters?.cnhStatus && filters.cnhStatus !== "ALL")
    params.append("cnhStatus", filters.cnhStatus);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const res = await fetch(`${API_URL}/drivers?${params}`);
  if (!res.ok) throw new Error("Erro ao buscar motoristas");
  return res.json();
}

export async function getDriverById(id: string): Promise<Driver> {
  const res = await fetch(`${API_URL}/drivers/${id}`);
  if (!res.ok) throw new Error("Erro ao buscar motorista");
  return res.json();
}

export async function createDriver(data: Partial<Driver>): Promise<Driver> {
  const res = await fetch(`${API_URL}/drivers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.status === 409) {
    const conflict = await res.json();
    throw { status: 409, data: conflict };
  }

  if (!res.ok) throw new Error("Erro ao criar motorista");
  return res.json();
}

export async function updateDriver(id: string, data: Partial<Driver>): Promise<Driver> {
  const res = await fetch(`${API_URL}/drivers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar motorista");
  return res.json();
}

export async function deleteDriver(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/drivers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Erro ao deletar motorista");
  }
}

export async function migrateDriver(
  id: string,
  data: MigrateDriverRequest,
): Promise<MigrateDriverResponse> {
  const res = await fetch(`${API_URL}/drivers/${id}/migrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao migrar motorista");
  return res.json();
}
