/**
 * API FIPE - Busca de veículos
 * Fonte: https://parallelum.com.br/fipe/api/v1
 */

const FIPE_API = "https://parallelum.com.br/fipe/api/v1";

export type VehicleType = "carros" | "motos" | "caminhoes";

export interface Brand {
  codigo: string;
  nome: string;
}

export interface Model {
  codigo: number;
  nome: string;
}

export interface ModelYear {
  codigo: string;
  nome: string;
}

export interface VehicleDetails {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  TipoVeiculo: number;
  SiglaCombustivel: string;
}

async function safeJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

export async function getBrands(type: VehicleType = "carros"): Promise<Brand[]> {
  try {
    const response = await fetch(`${FIPE_API}/${type}/marcas`, { cache: "no-store" });
    if (!response.ok) throw new Error("Erro ao buscar marcas");
    return await safeJson<Brand[]>(response);
  } catch (error) {
    console.error("Erro FIPE getBrands:", error);
    return [];
  }
}

export async function getModels(brandCode: string, type: VehicleType = "carros"): Promise<Model[]> {
  try {
    const response = await fetch(`${FIPE_API}/${type}/marcas/${brandCode}/modelos`, { cache: "no-store" });
    if (!response.ok) throw new Error("Erro ao buscar modelos");
    const data = await safeJson<{ modelos?: Model[] }>(response);
    return data.modelos || [];
  } catch (error) {
    console.error("Erro FIPE getModels:", error);
    return [];
  }
}

export async function getYears(
  brandCode: string,
  modelCode: number,
  type: VehicleType = "carros"
): Promise<ModelYear[]> {
  try {
    const response = await fetch(`${FIPE_API}/${type}/marcas/${brandCode}/modelos/${modelCode}/anos`, { cache: "no-store" });
    if (!response.ok) throw new Error("Erro ao buscar anos");
    return await safeJson<ModelYear[]>(response);
  } catch (error) {
    console.error("Erro FIPE getYears:", error);
    return [];
  }
}

export async function getVehicleDetails(
  brandCode: string,
  modelCode: number,
  yearCode: string,
  type: VehicleType = "carros"
): Promise<VehicleDetails | null> {
  try {
    const response = await fetch(`${FIPE_API}/${type}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Erro ao buscar detalhes");
    return await safeJson<VehicleDetails>(response);
  } catch (error) {
    console.error("Erro FIPE getVehicleDetails:", error);
    return null;
  }
}