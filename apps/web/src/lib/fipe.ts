import type { VehicleType, VehicleDetails } from "@/types/vehicle";

// FIPE API Base URL
const FIPE_API_BASE = "https://parallelum.com.br/fipe/api/v1";

export type Brand = {
  codigo: string;
  nome: string;
};

export type Model = {
  codigo: number;
  nome: string;
};

export type ModelYear = {
  codigo: string;
  nome: string;
};

function getVehicleTypeEndpoint(vehicleType: VehicleType): string {
  const map = { carros: "carros", motos: "motos", caminhoes: "caminhoes" };
  return map[vehicleType] || "carros";
}

export async function getBrands(vehicleType: VehicleType): Promise<Brand[]> {
  try {
    const endpoint = getVehicleTypeEndpoint(vehicleType);
    const url = FIPE_API_BASE + "/" + endpoint + "/marcas";
    const response = await fetch(url);
    if (!response.ok) throw new Error("FIPE API error");
    return await response.json();
  } catch (error) {
    console.error("FIPE getBrands error:", error);
    return [];
  }
}

export async function getModels(vehicleType: VehicleType, brandCode: string): Promise<Model[]> {
  try {
    const endpoint = getVehicleTypeEndpoint(vehicleType);
    const url = FIPE_API_BASE + "/" + endpoint + "/marcas/" + brandCode + "/modelos";
    const response = await fetch(url);
    if (!response.ok) throw new Error("FIPE API error");
    const data = await response.json();
    return data.modelos || [];
  } catch (error) {
    console.error("FIPE getModels error:", error);
    return [];
  }
}

export async function getYears(
  vehicleType: VehicleType,
  brandCode: string,
  modelCode: string,
): Promise<ModelYear[]> {
  try {
    const endpoint = getVehicleTypeEndpoint(vehicleType);
    const url =
      FIPE_API_BASE + "/" + endpoint + "/marcas/" + brandCode + "/modelos/" + modelCode + "/anos";
    const response = await fetch(url);
    if (!response.ok) throw new Error("FIPE API error");
    return await response.json();
  } catch (error) {
    console.error("FIPE getYears error:", error);
    return [];
  }
}

export async function getVehicleDetails(
  vehicleType: VehicleType,
  brandCode: string,
  modelCode: string,
  yearCode: string,
): Promise<VehicleDetails | null> {
  try {
    const endpoint = getVehicleTypeEndpoint(vehicleType);
    const url =
      FIPE_API_BASE +
      "/" +
      endpoint +
      "/marcas/" +
      brandCode +
      "/modelos/" +
      modelCode +
      "/anos/" +
      yearCode;
    const response = await fetch(url);
    if (!response.ok) throw new Error("FIPE API error");
    return await response.json();
  } catch (error) {
    console.error("FIPE getVehicleDetails error:", error);
    return null;
  }
}

export type { VehicleType, VehicleDetails } from "@/types/vehicle";
