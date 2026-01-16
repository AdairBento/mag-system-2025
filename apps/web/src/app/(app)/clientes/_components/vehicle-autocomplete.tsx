"use client";

import * as React from "react";
import { Search, Loader2, Car, Calendar, RotateCcw } from "lucide-react";
import {
  getBrands,
  getModels,
  getYears,
  getVehicleDetails,
  type VehicleType,
  type Brand,
  type Model,
  type ModelYear,
} from "@/lib/fipe";

type SelectedVehicle = {
  brand: string;
  model: string;
  year: number;
  fuelType?: string;
  fipeCode?: string;
  price?: string;
  referenceMonth?: string;
};

interface VehicleAutocompleteProps {
  vehicleType?: VehicleType;
  onSelect: (vehicle: SelectedVehicle) => void;
  className?: string;
}

export function VehicleAutocomplete({
  vehicleType = "carros",
  onSelect,
  className = "",
}: VehicleAutocompleteProps) {
  const [step, setStep] = React.useState<"brand" | "model" | "year">("brand");
  const [loading, setLoading] = React.useState(false);

  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [models, setModels] = React.useState<Model[]>([]);
  const [years, setYears] = React.useState<ModelYear[]>([]);

  const [selectedBrand, setSelectedBrand] = React.useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = React.useState<Model | null>(null);

  const [searchBrand, setSearchBrand] = React.useState("");
  const [searchModel, setSearchModel] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);

  function resetSelection() {
    setStep("brand");
    setSelectedBrand(null);
    setSelectedModel(null);
    setModels([]);
    setYears([]);
    setSearchBrand("");
    setSearchModel("");
    setError(null);
  }

  React.useEffect(() => {
    resetSelection();
    void loadBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleType]);

  async function loadBrands() {
    setError(null);
    setLoading(true);
    try {
      const data = await getBrands(vehicleType);
      setBrands(data);
    } catch {
      setError("Não foi possível carregar marcas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBrandSelect(brand: Brand) {
    setError(null);
    setSelectedBrand(brand);
    setSearchBrand(brand.nome);
    setStep("model");
    setLoading(true);
    try {
      const data = await getModels(brand.codigo, vehicleType);
      setModels(data);
    } catch {
      setError("Não foi possível carregar modelos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleModelSelect(model: Model) {
    if (!selectedBrand) return;
    setError(null);
    setSelectedModel(model);
    setSearchModel(model.nome);
    setStep("year");
    setLoading(true);
    try {
      const data = await getYears(selectedBrand.codigo, model.codigo, vehicleType);
      setYears(data);
    } catch {
      setError("Não foi possível carregar anos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleYearSelect(year: ModelYear) {
    if (!selectedBrand || !selectedModel) return;
    setError(null);
    setLoading(true);
    try {
      const details = await getVehicleDetails(
        selectedBrand.codigo,
        selectedModel.codigo,
        year.codigo,
        vehicleType,
      );

      if (details) {
        onSelect({
          brand: details.Marca,
          model: details.Modelo,
          year: details.AnoModelo,
          fuelType: details.Combustivel,
          fipeCode: details.CodigoFipe,
          price: details.Valor,
          referenceMonth: details.MesReferencia,
        });
      } else {
        setError("Não foi possível obter os detalhes do veículo.");
      }
    } catch {
      setError("Erro ao buscar detalhes do veículo.");
    } finally {
      setLoading(false);
    }
  }

  const filteredBrands = React.useMemo(() => {
    const q = searchBrand.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.nome.toLowerCase().includes(q));
  }, [brands, searchBrand]);

  const filteredModels = React.useMemo(() => {
    const q = searchModel.trim().toLowerCase();
    if (!q) return models;
    return models.filter((m) => m.nome.toLowerCase().includes(q));
  }, [models, searchModel]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <button
            type="button"
            onClick={() => {
              setStep("brand");
              setSelectedBrand(null);
              setSelectedModel(null);
              setModels([]);
              setYears([]);
              setSearchModel("");
              setError(null);
            }}
            className="hover:text-teal-600 transition font-medium"
          >
            Marca
          </button>

          {selectedBrand && (
            <>
              <span className="text-gray-400">/</span>
              <button
                type="button"
                onClick={() => {
                  setStep("model");
                  setSelectedModel(null);
                  setYears([]);
                  setSearchModel("");
                  setError(null);
                }}
                className="hover:text-teal-600 transition font-medium"
              >
                Modelo
              </button>
            </>
          )}

          {selectedModel && (
            <>
              <span className="text-gray-400">/</span>
              <span className="font-medium text-gray-800">Ano</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={resetSelection}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-700 transition"
          title="Reiniciar seleção"
        >
          <RotateCcw size={16} />
          <span className="hidden sm:inline">Limpar</span>
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {step === "brand" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar Marca</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchBrand}
              onChange={(e) => setSearchBrand(e.target.value)}
              placeholder="Digite para buscar..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-teal-600" />
              </div>
            ) : filteredBrands.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500">Nenhuma marca encontrada.</div>
            ) : (
              filteredBrands.map((brand) => (
                <button
                  type="button"
                  key={brand.codigo}
                  onClick={() => void handleBrandSelect(brand)}
                  className="w-full px-4 py-3 text-left hover:bg-teal-50 transition border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <Car size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-800">{brand.nome}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {step === "model" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Buscar Modelo{selectedBrand ? ` - ${selectedBrand.nome}` : ""}
          </label>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchModel}
              onChange={(e) => setSearchModel(e.target.value)}
              placeholder="Digite para buscar..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-teal-600" />
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500">Nenhum modelo encontrado.</div>
            ) : (
              filteredModels.map((model) => (
                <button
                  type="button"
                  key={model.codigo}
                  onClick={() => void handleModelSelect(model)}
                  className="w-full px-4 py-3 text-left hover:bg-teal-50 transition border-b border-gray-100 last:border-b-0"
                >
                  <span className="font-medium text-gray-800">{model.nome}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {step === "year" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Selecionar Ano{selectedModel ? ` - ${selectedModel.nome}` : ""}
          </label>

          <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-teal-600" />
              </div>
            ) : years.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500">Nenhum ano disponível.</div>
            ) : (
              years.map((year) => (
                <button
                  type="button"
                  key={year.codigo}
                  onClick={() => void handleYearSelect(year)}
                  className="w-full px-4 py-3 text-left hover:bg-teal-50 transition border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-800">{year.nome}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
