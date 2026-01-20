// apps/web/src/types/vehicle.ts

// ===== ENTIDADES (nomes retornados pela API) =====
export type VehicleStatus = "DISPONIVEL" | "LOCADO" | "MANUTENCAO" | "INATIVO";

export type Vehicle = {
  id: string;
  plate: string; // API: plate
  brand: string; // API: brand
  model: string; // API: model
  year: number; // API: year
  color?: string; // API: color
  mileage?: number; // API: mileage
  renavam?: string;
  chassis?: string;
  status: VehicleStatus;
  dailyRate?: number; // API: dailyRate
  weeklyRate?: number;
  monthlyRate?: number;
  createdAt: string;
  updatedAt: string;
};

// ===== PAYLOADS (enviar para API) =====
export type VehicleFormData = {
  id?: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
  renavam?: string;
  chassis?: string;
  status: VehicleStatus;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
};

export type VehicleFilters = {
  search?: string;
  status?: VehicleStatus | "ALL";
};

// ===== FIPE =====
export type VehicleType = "carros" | "motos" | "caminhoes";

export type VehicleDetails = {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  SiglaCombustivel: string;
};
