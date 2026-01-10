export type DriverStatus = "ATIVO" | "INATIVO";
export type CNHCategory = "A" | "B" | "C" | "D" | "E" | "AB" | "AC" | "AD" | "AE";
export type CNHStatus = "valid" | "expiring" | "expired";

export interface Driver {
  id: string;
  name: string;
  cpf: string;
  cnh: string;
  cnhCategory: CNHCategory;
  cnhValidade: string;
  telefone?: string;
  clientId: string;
  clientName?: string;
  status: DriverStatus;
  cnhStatus?: CNHStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DriverFilters {
  search?: string;
  clientId?: string;
  cnhCategory?: CNHCategory | "ALL";
  cnhStatus?: CNHStatus | "ALL";
}

export interface DriverListResponse {
  data: Driver[];
  requestId: string;
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface MigrateDriverRequest {
  newClientId: string;
}

export interface MigrateDriverResponse {
  message: string;
  driver: {
    id: string;
    name: string;
    oldClientId: string;
    newClientId: string;
    migratedAt: string;
  };
  requestId: string;
}
