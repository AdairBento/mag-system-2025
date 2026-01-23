export type VehicleStatus = "disponivel" | "alugado" | "manutencao" | "inativo";

export interface Vehicle {
  id: string;
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
  clienteId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFilters {
  status?: string;
  plate?: string;
  brand?: string;
  model?: string;
}

export interface VehicleFormData {
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
}

export type VehicleType = "carros" | "motos" | "caminhoes";

export interface VehicleDetails {
  Marca: string;
  Modelo: string;
  AnoModelo: string;
  Combustivel: string;
  CodigoFipe: string;
  Valor: string;
  MesReferencia: string;
  marca: string;
  modelo: string;
  ano: string;
  combustivel: string;
  codigoFipe: string;
  valor: string;
}
