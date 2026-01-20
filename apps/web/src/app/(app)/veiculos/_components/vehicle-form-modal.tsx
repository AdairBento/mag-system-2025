"use client";
import type { VehicleStatus } from "@/types/vehicle";
import type { VehicleFormData } from "@/types/vehicle";

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import type { Vehicle } from "@/lib/api/vehicles";
import { getBrands, getModels, getYears, type Brand, type Model, type ModelYear } from "@/lib/fipe";

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  initialData?: Vehicle | null;
}

const CAR_COLORS = [
  "Branco",
  "Preto",
  "Prata",
  "Cinza",
  "Vermelho",
  "Azul",
  "Verde",
  "Amarelo",
  "Marrom",
  "Bege",
];

export function VehicleFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: VehicleFormModalProps) {
  const [formData, setFormData] = useState<VehicleFormData>({
    plate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    mileage: 0,
    renavam: "",
    chassis: "",
    status: "DISPONIVEL",
    dailyRate: 0,
    weeklyRate: 0,
    monthlyRate: 0,
  });

  // Estados FIPE
  const [useFipe, setUseFipe] = useState(true);
  const [fipeLoading, setFipeLoading] = useState(false);
  const [fipeError, setFipeError] = useState<string | null>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [years, setYears] = useState<ModelYear[]>([]);

  const [selectedBrandCode, setSelectedBrandCode] = useState("");
  const [selectedModelCode, setSelectedModelCode] = useState("");
  const [selectedYearCode, setSelectedYearCode] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          plate: initialData.plate,
          brand: initialData.brand,
          model: initialData.model,
          year: initialData.year,
          color: initialData.color || "",
          mileage: initialData.mileage || 0,
          renavam: initialData.renavam || "",
          chassis: initialData.chassis || "",
          status: initialData.status,
          dailyRate: initialData.dailyRate || 0,
          weeklyRate: initialData.weeklyRate || 0,
          monthlyRate: initialData.monthlyRate || 0,
        });
        setUseFipe(false);
      } else {
        setFormData({
          plate: "",
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          color: "",
          mileage: 0,
          renavam: "",
          chassis: "",
          status: "DISPONIVEL",
          dailyRate: 0,
          weeklyRate: 0,
          monthlyRate: 0,
        });
        setUseFipe(true);
        loadBrands();
      }
    }
  }, [isOpen, initialData]);

  const loadBrands = async () => {
    setFipeLoading(true);
    setFipeError(null);
    try {
      const data = await getBrands("carros");
      if (data.length === 0) {
        setFipeError("FIPE indisponível. Preencha manualmente.");
        setUseFipe(false);
      } else {
        setBrands(data);
      }
    } catch (error) {
      setFipeError("Erro ao carregar marcas da FIPE. Preencha manualmente.");
      setUseFipe(false);
    } finally {
      setFipeLoading(false);
    }
  };

  const handleBrandChange = async (brandCode: string) => {
    setSelectedBrandCode(brandCode);
    const brand = brands.find((b) => b.codigo === brandCode);
    if (brand) {
      setFormData((prev) => ({
        ...prev,
        brand: brand.nome,
        model: "",
        year: new Date().getFullYear(),
      }));
      setFipeLoading(true);
      const data = await getModels("carros", brandCode);
      setModels(data);
      setYears([]);
      setFipeLoading(false);
    }
  };

  const handleModelChange = async (modelCode: string) => {
    setSelectedModelCode(modelCode);
    const model = models.find((m) => String(m.codigo) === modelCode);
    if (model) {
      setFormData((prev) => ({ ...prev, model: model.nome }));
      setFipeLoading(true);
      const data = await getYears("carros", selectedBrandCode, modelCode);
      setYears(data);
      setFipeLoading(false);
    }
  };

  const handleYearChange = async (yearCode: string) => {
    setSelectedYearCode(yearCode);
    const year = years.find((y) => y.codigo === yearCode);
    if (year) {
      const yearNum = parseInt(year.nome.split("-")[0]);
      setFormData((prev) => ({ ...prev, year: yearNum }));
      // NÃO calcula valores - deixa vazio para usuário preencher
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dailyRate || !formData.weeklyRate || !formData.monthlyRate) {
      alert("❌ Todos os valores (Diária, Semanal e Mensal) devem ser preenchidos!");
      return;
    }
    await onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? "Editar Veículo" : "Novo Veículo"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {fipeError && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">{fipeError}</p>
                <button
                  type="button"
                  onClick={() => setUseFipe(false)}
                  className="mt-1 text-xs text-yellow-700 underline hover:text-yellow-900"
                >
                  Continuar preenchendo manualmente
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {useFipe && !initialData ? (
              <>
                <div>
                  <label className={labelClass}>Marca *</label>
                  <select
                    value={selectedBrandCode}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className={inputClass}
                    disabled={fipeLoading}
                    required
                  >
                    <option value="">Selecione a marca</option>
                    {brands.map((brand) => (
                      <option key={brand.codigo} value={brand.codigo}>
                        {brand.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Modelo *</label>
                  <select
                    value={selectedModelCode}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className={inputClass}
                    disabled={fipeLoading || !selectedBrandCode}
                    required
                  >
                    <option value="">Selecione o modelo</option>
                    {models.map((model) => (
                      <option key={model.codigo} value={model.codigo}>
                        {model.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Ano *</label>
                  <select
                    value={selectedYearCode}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className={inputClass}
                    disabled={fipeLoading || !selectedModelCode}
                    required
                  >
                    <option value="">Selecione o ano</option>
                    {years.map((year) => (
                      <option key={year.codigo} value={year.codigo}>
                        {year.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelClass}>Marca *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className={inputClass}
                    placeholder="Ex: Toyota, Volkswagen"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Modelo *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className={inputClass}
                    placeholder="Ex: Corolla, Gol"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Ano *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className={inputClass}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className={labelClass}>Placa *</label>
              <input
                type="text"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                className={inputClass}
                placeholder="ABC-1234"
                maxLength={8}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Cor</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className={inputClass}
              >
                <option value="">Selecione...</option>
                {CAR_COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Quilometragem (km) *</label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                className={inputClass}
                min="0"
                required
              />
            </div>

            <div>
              <label className={labelClass}>RENAVAM</label>
              <input
                type="text"
                value={formData.renavam}
                onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                className={inputClass}
                placeholder="00000000000"
                maxLength={11}
              />
            </div>

            <div>
              <label className={labelClass}>Chassis</label>
              <input
                type="text"
                value={formData.chassis}
                onChange={(e) =>
                  setFormData({ ...formData, chassis: e.target.value.toUpperCase() })
                }
                className={inputClass}
                placeholder="9BWZZZ377VT004251"
                maxLength={17}
              />
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Status *</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as VehicleStatus })
                }
                className={inputClass}
                required
              >
                <option value="DISPONIVEL">Disponível</option>
                <option value="LOCADO">Locado</option>
                <option value="MANUTENCAO">Manutenção</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💰</span>
              <p className="text-base font-bold text-orange-900">
                Valores de Locação (Todos obrigatórios) *
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-orange-900 mb-1.5">
                  Diária (R$) *
                </label>
                <input
                  type="number"
                  value={formData.dailyRate || ""}
                  onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                  className="w-full border-2 border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                  min="0"
                  step="0.01"
                  placeholder="150.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-orange-900 mb-1.5">
                  Semanal (R$) *
                </label>
                <input
                  type="number"
                  value={formData.weeklyRate || ""}
                  onChange={(e) => setFormData({ ...formData, weeklyRate: Number(e.target.value) })}
                  className="w-full border-2 border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                  min="0"
                  step="0.01"
                  placeholder="900.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-orange-900 mb-1.5">
                  Mensal (R$) *
                </label>
                <input
                  type="number"
                  value={formData.monthlyRate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyRate: Number(e.target.value) })
                  }
                  className="w-full border-2 border-orange-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white"
                  min="0"
                  step="0.01"
                  placeholder="3000.00"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-orange-700 mt-3">
              💡 Dica: Defina os valores conforme o estado do veículo, demanda e concorrência local.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={fipeLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fipeLoading ? "Carregando FIPE..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
