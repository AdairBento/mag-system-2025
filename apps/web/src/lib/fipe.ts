// src/lib/fipe.ts - FIPE API Integration (Stub)
// TODO: Implementar integração com API FIPE real

export type VehicleType = "carros" | "motos" | "caminhoes";

export type Brand = {
  codigo: string;
  nome: string;
};

export type Model = {
  codigo: string;
  nome: string;
};

export type ModelYear = {
  codigo: string;
  nome: string;
};

export type VehicleDetails = {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  TipoVeiculo: number;
  SiglaCombustivel: string;
};

// Stub functions - retornam arrays vazios por enquanto
export async function getBrands(_vehicleType: VehicleType): Promise<Brand[]> {
  // TODO: Implementar chamada real à API FIPE
  console.warn("FIPE: getBrands not implemented yet");
  return [];
}

export async function getModels(_vehicleType: VehicleType, _brandCode: string): Promise<Model[]> {
  // TODO: Implementar chamada real à API FIPE
  console.warn("FIPE: getModels not implemented yet");
  return [];
}

export async function getYears(
  _vehicleType: VehicleType,
  _brandCode: string,
  _modelCode: string,
): Promise<ModelYear[]> {
  // TODO: Implementar chamada real à API FIPE
  console.warn("FIPE: getYears not implemented yet");
  return [];
}

export async function getVehicleDetails(
  _vehicleType: VehicleType,
  _brandCode: string,
  _modelCode: string,
  _yearCode: string,
): Promise<VehicleDetails | null> {
  // TODO: Implementar chamada real à API FIPE
  console.warn("FIPE: getVehicleDetails not implemented yet");
  return null;
}
